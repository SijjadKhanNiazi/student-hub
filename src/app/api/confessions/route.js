import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Confession from "@/lib/models/Confession";
import { getOrCreateUser } from "@/lib/auth";
import { sanitizeConfession } from "@/lib/confessions";

export async function GET() {
  try {
    await dbConnect();

    const user = await getOrCreateUser();
    const confessions = await Confession.find()
      .sort({ createdAt: -1 })
      .populate("user", "firstName lastName imageUrl clerkId email")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId email");

    const sanitized = confessions.map((c) =>
      sanitizeConfession(c, user?._id)
    );

    return NextResponse.json({ confessions: sanitized });
  } catch (error) {
    console.error("GET /api/confessions error:", error);
    return NextResponse.json({ error: "Failed to fetch confessions" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, isAnonymous = true } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    await dbConnect();

    const confession = await Confession.create({
      content: content.trim(),
      isAnonymous: Boolean(isAnonymous),
      user: user._id,
      likes: [],
      comments: [],
    });

    const populated = await Confession.findById(confession._id)
      .populate("user", "firstName lastName imageUrl clerkId email")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId email");

    return NextResponse.json(
      { confession: sanitizeConfession(populated, user._id) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/confessions error:", error);
    return NextResponse.json({ error: "Failed to create confession" }, { status: 500 });
  }
}
