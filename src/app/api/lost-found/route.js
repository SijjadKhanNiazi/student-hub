import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import LostFound from "@/lib/models/LostFound";
import { getOrCreateUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    await dbConnect();

    const query = {};
    if (category && category !== "all") query.category = category;
    if (status && status !== "all") query.status = status;

    const posts = await LostFound.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "firstName lastName imageUrl clerkId")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId");

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("GET /api/lost-found error:", error);
    return NextResponse.json({ error: "Failed to fetch lost & found posts" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, category, imageUrl, location } = await request.json();

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Title, description, and category are required" }, { status: 400 });
    }

    if (!["Lost", "Found"].includes(category)) {
      return NextResponse.json({ error: "Invalid category. Must be 'Lost' or 'Found'" }, { status: 400 });
    }

    await dbConnect();

    const post = await LostFound.create({
      title: title.trim(),
      description: description.trim(),
      category,
      imageUrl: imageUrl || "",
      location: location ? location.trim() : "",
      user: user._id,
      status: "Active",
    });

    const populatedPost = await LostFound.findById(post._id)
      .populate("user", "firstName lastName imageUrl clerkId")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId");

    return NextResponse.json({ post: populatedPost }, { status: 201 });
  } catch (error) {
    console.error("POST /api/lost-found error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
