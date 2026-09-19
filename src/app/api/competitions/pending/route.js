import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/lib/models/User";
import CompetitionMatch from "@/lib/models/CompetitionMatch";

/**
 * GET /api/competitions/pending – returns list of pending competition registrations (player2 null).
 */
export async function GET() {
  try {
    await dbConnect();
    const pending = await CompetitionMatch.find({
      player2: null,
      status: "Active",
    })
      .populate("player1", "firstName lastName email imageUrl")
      .lean();

    const result = pending.map((m) => ({
      id: m._id,
      user: m.player1,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ pending: result }, { status: 200 });
  } catch (err) {
    console.error("Pending competitions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
