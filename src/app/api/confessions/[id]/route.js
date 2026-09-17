import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Confession from "@/lib/models/Confession";
import { getOrCreateUser } from "@/lib/auth";

export async function DELETE(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const confession = await Confession.findById(id);
    if (!confession) {
      return NextResponse.json({ error: "Confession not found" }, { status: 404 });
    }

    const isOwner = confession.user.toString() === user._id.toString();
    if (!isOwner && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await confession.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/confessions/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete confession" }, { status: 500 });
  }
}
