import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/lib/models/User";
import CompetitionMatch from "@/lib/models/CompetitionMatch";

/**
 * GET /api/competitions/latest
 *
 * Returns the most recent MAX_SPOTLIGHT competition winners, restricted
 * to matches completed within the last SPOTLIGHT_HOURS hours. The 0th
 * entry is the newest (the "champion" spotlighted one).
 */
const SPOTLIGHT_HOURS = 48 * 7;
const MAX_SPOTLIGHT = 5;

function formatWinnerEntry(match) {
  const w = match.winner;
  if (!w) return null;
  const fullName =
    `${w.firstName || ""} ${w.lastName || ""}`.trim() || w.email || "Winner";

  // Opponent info — useful for the "defeated X" flair
  let opponent = null;
  const winnerId = w._id?.toString();
  const p1Id = match.player1?._id?.toString() || match.player1?.toString();
  const p2Id = match.player2?._id?.toString() || match.player2?.toString();
  const loserDoc =
    winnerId === p1Id
      ? typeof match.player2 === "object" && match.player2 !== null
        ? match.player2
        : null
      : typeof match.player1 === "object" && match.player1 !== null
      ? match.player1
      : null;
  if (loserDoc) {
    const loserName =
      `${loserDoc.firstName || ""} ${loserDoc.lastName || ""}`.trim() ||
      loserDoc.email ||
      null;
    if (loserName) opponent = loserName;
  }

  // Tally vote counts (if server already populated candidates as docs, use _id)
  const getCandidateId = (c) =>
    typeof c === "object" && c !== null ? c._id?.toString() : c?.toString();
  const p1Votes = (match.votes || []).filter(
    (v) => getCandidateId(v.candidate) === p1Id,
  ).length;
  const p2Votes = (match.votes || []).filter(
    (v) => getCandidateId(v.candidate) === p2Id,
  ).length;

  return {
    id: match._id,
    completedAt: match.updatedAt,
    winner: {
      id: w._id,
      name: fullName,
      imageUrl: w.imageUrl || null,
      email: w.email || null,
    },
    score: {
      p1Votes,
      p2Votes,
      winnerVotes: winnerId === p1Id ? p1Votes : p2Votes,
      loserVotes: winnerId === p1Id ? p2Votes : p1Votes,
    },
    opponent,
  };
}

export async function GET() {
  try {
    await dbConnect();

    const cutoff = new Date(Date.now() - SPOTLIGHT_HOURS * 60 * 60 * 1000);

    const matches = await CompetitionMatch.find({
      status: "Completed",
      winner: { $ne: null },
      updatedAt: { $gte: cutoff },
    })
      .sort({ updatedAt: -1 })
      .limit(MAX_SPOTLIGHT)
      .populate("winner", "firstName lastName imageUrl email")
      .populate("player1", "firstName lastName email")
      .populate("player2", "firstName lastName email")
      .populate("votes.candidate", "_id")
      .lean();

    if (!matches || matches.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No recent winners within the spotlight window",
          winners: [],
        },
        { status: 404 },
      );
    }

    const spotlightExpiresAt = new Date(
      new Date(matches[0].updatedAt).getTime() +
        SPOTLIGHT_HOURS * 60 * 60 * 1000,
    );

    const winners = matches
      .map(formatWinnerEntry)
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      winners,
      champion: winners[0] || null,
      spotlightExpiresAt,
    });
  } catch (err) {
    console.error("Latest competition error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error", winners: [] },
      { status: 500 },
    );
  }
}
