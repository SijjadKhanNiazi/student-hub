import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Request from "@/lib/models/Request";
import { getOrCreateUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    await dbConnect();

    const query = status ? { status } : {};
    const requests = await Request.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "firstName lastName imageUrl clerkId")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId");

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("GET /api/requests error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, semester, subject } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    await dbConnect();

    const newRequest = await Request.create({
      title: title.trim(),
      description: description.trim(),
      semester: semester ? Number(semester) : undefined,
      subject: subject ? subject.trim() : "",
      createdBy: user._id,
      status: "open",
    });

    const populatedRequest = await Request.findById(newRequest._id)
      .populate("createdBy", "firstName lastName imageUrl clerkId")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId");

    return NextResponse.json({ request: populatedRequest }, { status: 201 });
  } catch (error) {
    console.error("POST /api/requests error:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}
