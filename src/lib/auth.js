import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

/**
 * Gets or creates a User document in MongoDB based on the current Clerk session.
 * This replaces the webhook approach — users are lazily synced on first interaction.
 *
 * @returns {Object|null} The MongoDB User document, or null if not authenticated.
 */
export async function getOrCreateUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  await dbConnect();

  let user = await User.findOne({ clerkId: clerkUser.id });

  if (!user) {
    user = await User.create({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      imageUrl: clerkUser.imageUrl || "",
    });
  } else {
    // Grant admin role based on email
    if (user.email === "sijjadkhan603@gmail.com" && user.role !== "admin") {
      await User.findByIdAndUpdate(user._id, { role: "admin" });
      user.role = "admin";
    }
    const updates = {};
    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    if (user.email !== email) updates.email = email;
    if (user.firstName !== (clerkUser.firstName || "")) updates.firstName = clerkUser.firstName || "";
    if (user.lastName !== (clerkUser.lastName || "")) updates.lastName = clerkUser.lastName || "";
    if (user.imageUrl !== (clerkUser.imageUrl || "")) updates.imageUrl = clerkUser.imageUrl || "";

    if (Object.keys(updates).length > 0) {
      user = await User.findByIdAndUpdate(user._id, updates, { new: true });
    }
  }

  return user;
}

/**
 * Requires authentication — throws a Response if not authenticated.
 * Use in API routes.
 */
export async function requireUser() {
  const user = await getOrCreateUser();
  if (!user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}
