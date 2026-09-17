import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Folder from "@/lib/models/Folder";
import Note from "@/lib/models/Note";
import { getOrCreateUser } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { folderId } = await params;
    await dbConnect();

    const folder = await Folder.findById(folderId).populate("subject").populate("createdBy", "firstName lastName clerkId");
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const notes = await Note.find({ folder: folderId })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "firstName lastName clerkId");

    return NextResponse.json({ folder, notes });
  } catch (error) {
    console.error("GET /api/folders/[folderId] error:", error);
    return NextResponse.json({ error: "Failed to fetch folder details" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { folderId } = await params;
    await dbConnect();

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Strict ownership check
    if (folder.createdBy.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only the folder creator can delete this folder" }, { status: 403 });
    }

    // Delete folder and all notes inside it
    await Note.deleteMany({ folder: folderId });
    await Folder.findByIdAndDelete(folderId);

    return NextResponse.json({ success: true, message: "Folder deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/folders/[folderId] error:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}
