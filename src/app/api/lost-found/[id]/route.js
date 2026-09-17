import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import LostFound from "@/lib/models/LostFound";
import { getOrCreateUser } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();

    const post = await LostFound.findById(id)
      .populate("user", "firstName lastName imageUrl clerkId")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId");

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("GET /api/lost-found/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!["Active", "Resolved"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await dbConnect();

    const post = await LostFound.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Ownership check
    if (post.user.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only the post creator can update status" }, { status: 403 });
    }

    post.status = status;
    await post.save();

    const updatedPost = await LostFound.findById(id)
      .populate("user", "firstName lastName imageUrl clerkId")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId");

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error("PATCH /api/lost-found/[id] error:", error);
    return NextResponse.json({ error: "Failed to update post status" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const post = await LostFound.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Ownership check
    if (post.user.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only the post creator can delete this post" }, { status: 403 });
    }

    await LostFound.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/lost-found/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
