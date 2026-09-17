import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Note from "@/lib/models/Note";
import { getOrCreateUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");

    await dbConnect();

    const query = folderId ? { folder: folderId } : {};
    const notes = await Note.find(query)
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "firstName lastName clerkId");

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("GET /api/notes error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, fileUrl, fileType, fileKey, fileName, fileSize, folderId } = await request.json();

    if (!title || !fileUrl || !folderId) {
      return NextResponse.json({ error: "Title, file URL, and folder ID are required" }, { status: 400 });
    }

    await dbConnect();

    const note = await Note.create({
      title: title.trim(),
      fileUrl,
      fileType: fileType || "document",
      fileKey: fileKey || "default_key",
      fileName: fileName || "",
      fileSize: fileSize || 0,
      folder: folderId,
      uploadedBy: user._id,
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("POST /api/notes error:", error);
    return NextResponse.json({ error: "Failed to save note record" }, { status: 500 });
  }
}
