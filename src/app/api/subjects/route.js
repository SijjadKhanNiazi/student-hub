import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/lib/models/Subject";
import { getOrCreateUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester");

    await dbConnect();

    const query = semester ? { semester: Number(semester) } : {};
    const subjects = await Subject.find(query).sort({ name: 1 }).populate("createdBy", "firstName lastName");

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("GET /api/subjects error:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, semester, description } = await request.json();

    if (!name || !semester) {
      return NextResponse.json({ error: "Subject name and semester are required" }, { status: 400 });
    }

    await dbConnect();

    const subject = await Subject.create({
      name: name.trim(),
      semester: Number(semester),
      description: description || "",
      createdBy: user._id,
    });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    console.error("POST /api/subjects error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Subject already exists in this semester" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}
