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
    const { text, isAnonymous = false } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    await dbConnect();

    const confession = await Confession.findById(id);
    if (!confession) {
      return NextResponse.json({ error: "Confession not found" }, { status: 404 });
    }

    confession.comments.push({
      text: text.trim(),
      createdBy: user._id,
      isAnonymous: Boolean(isAnonymous),
    });

    await confession.save();

    const populated = await Confession.findById(id)
      .populate("user", "firstName lastName imageUrl clerkId email")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId email");

    return NextResponse.json(
      { confession: sanitizeConfession(populated, user._id) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/confessions/[id]/comments error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json({ error: "Comment ID is required" }, { status: 400 });
    }

    await dbConnect();

    const confession = await Confession.findById(id);
    if (!confession) {
      return NextResponse.json({ error: "Confession not found" }, { status: 404 });
    }

    const comment = confession.comments.id(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const isCommentOwner = comment.createdBy.toString() === user._id.toString();
    const isPostOwner = confession.user.toString() === user._id.toString();
    if (!isCommentOwner && !isPostOwner && user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own comment" },
        { status: 403 }
      );
    }

    comment.deleteOne();
    await confession.save();

    const populated = await Confession.findById(id)
      .populate("user", "firstName lastName imageUrl clerkId email")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId email");

    return NextResponse.json({ confession: sanitizeConfession(populated, user._id) });
  } catch (error) {
    console.error("DELETE /api/confessions/[id]/comments error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
