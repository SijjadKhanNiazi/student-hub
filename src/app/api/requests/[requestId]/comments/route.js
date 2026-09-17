import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Request from "@/lib/models/Request";
import { getOrCreateUser } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await params;
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    await dbConnect();

    const reqDoc = await Request.findById(requestId);
    if (!reqDoc) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    reqDoc.comments.push({
      text: text.trim(),
      createdBy: user._id,
    });

    await reqDoc.save();

    const updatedReq = await Request.findById(requestId)
      .populate("createdBy", "firstName lastName imageUrl clerkId")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId");

    return NextResponse.json({ request: updatedReq }, { status: 201 });
  } catch (error) {
    console.error("POST /api/requests/[requestId]/comments error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await params;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json({ error: "Comment ID is required" }, { status: 400 });
    }

    await dbConnect();

    const reqDoc = await Request.findById(requestId);
    if (!reqDoc) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const comment = reqDoc.comments.id(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Strict ownership check (comment creator or request owner or admin)
    const isCommentOwner = comment.createdBy.toString() === user._id.toString();
    const isRequestOwner = reqDoc.createdBy.toString() === user._id.toString();
    if (!isCommentOwner && !isRequestOwner && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: You can only delete your own comment" }, { status: 403 });
    }

    comment.deleteOne();
    await reqDoc.save();

    const updatedReq = await Request.findById(requestId)
      .populate("createdBy", "firstName lastName imageUrl clerkId")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId");

    return NextResponse.json({ request: updatedReq });
  } catch (error) {
    console.error("DELETE /api/requests/[requestId]/comments error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
