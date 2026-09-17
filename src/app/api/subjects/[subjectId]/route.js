import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/lib/models/Subject";
import Folder from "@/lib/models/Folder";

export async function GET(request, { params }) {
  try {
    const { subjectId } = await params;
    await dbConnect();

    const subject = await Subject.findById(subjectId).populate("createdBy", "firstName lastName clerkId");
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const folders = await Folder.find({ subject: subjectId }).sort({ name: 1 }).populate("createdBy", "firstName lastName clerkId");

    return NextResponse.json({ subject, folders });
  } catch (error) {
    console.error("GET /api/subjects/[subjectId] error:", error);
    return NextResponse.json({ error: "Failed to fetch subject details" }, { status: 500 });
  }
}
