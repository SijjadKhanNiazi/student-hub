import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Folder from "@/lib/models/Folder";
import { getOrCreateUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, subjectId } = await request.json();

    if (!name || !subjectId) {
      return NextResponse.json({ error: "Folder name and subject ID are required" }, { status: 400 });
    }

    await dbConnect();

    const folder = await Folder.create({
      name: name.trim(),
      subject: subjectId,
      createdBy: user._id,
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    console.error("POST /api/folders error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Folder with this name already exists in subject" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
