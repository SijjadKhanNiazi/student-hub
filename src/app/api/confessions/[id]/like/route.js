import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Confession from "@/lib/models/Confession";
import { getOrCreateUser } from "@/lib/auth";
import { sanitizeConfession } from "@/lib/confessions";

export async function POST(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const confession = await Confession.findById(id);
    if (!confession) {
      return NextResponse.json({ error: "Confession not found" }, { status: 404 });
    }

    const userId = user._id.toString();
    const alreadyLiked = confession.likes.some((likeId) => likeId.toString() === userId);

    if (alreadyLiked) {
      confession.likes = confession.likes.filter((likeId) => likeId.toString() !== userId);
    } else {
      confession.likes.push(user._id);
    }

    await confession.save();

    const populated = await Confession.findById(id)
      .populate("user", "firstName lastName imageUrl clerkId email")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId email");

    return NextResponse.json({ confession: sanitizeConfession(populated, user._id) });
  } catch (error) {
    console.error("POST /api/confessions/[id]/like error:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
