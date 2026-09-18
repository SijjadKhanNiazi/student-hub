import { requireUser } from "@/lib/auth";

/**
 * GET /api/me – returns the current authenticated user's data as JSON.
 */
export async function GET(req) {
  try {
    const user = await requireUser();
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    };
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = { error: "Unauthorized" };
    return new Response(JSON.stringify(error), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
