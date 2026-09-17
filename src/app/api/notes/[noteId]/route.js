import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Note from "@/lib/models/Note";
import { getOrCreateUser } from "@/lib/auth";

export async function DELETE(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noteId } = await params;
    await dbConnect();

    const note = await Note.findById(noteId);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Check ownership or admin role
    if (note.uploadedBy.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: You can only delete your own notes" }, { status: 403 });
    }

    await Note.findByIdAndDelete(noteId);

    return NextResponse.json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/notes/[noteId] error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
