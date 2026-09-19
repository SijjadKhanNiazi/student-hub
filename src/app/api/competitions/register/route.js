import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/lib/models/User";
import CompetitionMatch from "@/lib/models/CompetitionMatch";
import { requireUser } from "@/lib/auth";

/**
 * POST /api/competitions/register – Register the current user for a new voting competition.
 * Creates an active CompetitionMatch with the user as `player1`.
 *
 * Accepts an optional JSON body: { photo: "<base64 data URL>" }
 */
export async function POST(req) {
  try {
    await dbConnect();
    const user = await requireUser();

    const body = await req.json().catch(() => ({}));
    const { photo } = body || {};

    const alreadyInMatch = await CompetitionMatch.findOne({
      $or: [
        { player1: user._id, status: { $in: ["Active", "Started"] } },
        { player2: user._id, status: { $in: ["Active", "Started"] } },
      ],
    });
    if (alreadyInMatch) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are already registered for a competition or have one in progress.",
        },
        { status: 400 },
      );
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const match = await CompetitionMatch.create({
      player1: user._id,
      player1Photo: typeof photo === "string" && photo.startsWith("data:")
        ? photo
        : user.imageUrl || null,
      player2: null,
      winner: null,
      status: "Active",
      expiresAt,
    });

    return NextResponse.json(
      { success: true, matchId: match._id },
      { status: 201 },
    );
  } catch (err) {
    console.error("Competition register error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
