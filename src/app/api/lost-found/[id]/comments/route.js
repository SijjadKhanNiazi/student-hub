import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import LostFound from "@/lib/models/LostFound";
import { getOrCreateUser } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    await dbConnect();

    const post = await LostFound.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    post.comments.push({
      text: text.trim(),
      createdBy: user._id,
    });

    await post.save();

    const updatedPost = await LostFound.findById(id)
      .populate("user", "firstName lastName imageUrl clerkId")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId");

    return NextResponse.json({ post: updatedPost }, { status: 201 });
  } catch (error) {
    console.error("POST /api/lost-found/[id]/comments error:", error);
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

    const post = await LostFound.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Ownership check (comment owner or post owner or admin)
    const isCommentOwner = comment.createdBy.toString() === user._id.toString();
    const isPostOwner = post.user.toString() === user._id.toString();
    if (!isCommentOwner && !isPostOwner && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: You can only delete your own comment" }, { status: 403 });
    }

    comment.deleteOne();
    await post.save();

    const updatedPost = await LostFound.findById(id)
      .populate("user", "firstName lastName imageUrl clerkId")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId");

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error("DELETE /api/lost-found/[id]/comments error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
