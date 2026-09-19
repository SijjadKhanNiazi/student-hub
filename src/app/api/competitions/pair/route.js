import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import CompetitionMatch from "@/lib/models/CompetitionMatch";
import User from "@/lib/models/User";
import { requireAdmin } from "@/lib/auth";

const COMPETITION_DURATION_MS = 48 * 60 * 60 * 1000; // 48 hours

/**
 * POST /api/competitions/pair – admin directly pairs two random users and
 * starts the match immediately (skips the waiting-list flow that /start
 * uses). Kept as a separate "force match" utility for admins, but fixed so
 * it behaves consistently with the rest of the system:
 *  - BUG FIX: it created matches with status "Active" even though both
 *    players were already assigned — "Active" is reserved for a lone
 *    player1 still waiting for an opponent. This match should be "Started".
 *  - BUG FIX: no expiresAt was set, so it never auto-completed.
 *  - BUG FIX: hard-coded admin email check replaced with requireAdmin(),
 *    the same helper /start already uses.
 *  - BUG FIX: didn't check for an already-live competition, so it could
 *    create a second "Started" match (the root cause of the "Competition
 *    not found" bug you hit). Now blocked with a 409.
 */
export async function POST() {
  try {
    await requireAdmin();
    await dbConnect();

    const alreadyLive = await CompetitionMatch.findOne({ status: "Started" });
    if (alreadyLive) {
      return NextResponse.json(
        {
          error:
            "A competition is already live. Finish or wait for it to expire first.",
        },
        { status: 409 },
      );
    }

    const candidates = await User.aggregate([
      { $match: { role: { $ne: "admin" } } },
      { $sample: { size: 2 } },
    ]);

    if (candidates.length < 2) {
      return NextResponse.json(
        { error: "Not enough participants" },
        { status: 400 },
      );
    }

    const match = await CompetitionMatch.create({
      player1: candidates[0]._id,
      player2: candidates[1]._id,
      status: "Started",
      expiresAt: new Date(Date.now() + COMPETITION_DURATION_MS),
    });

    return NextResponse.json({ success: true, matchId: match._id });
  } catch (err) {
    console.error("Pair competition error:", err);
    const status = err?.status || 500;
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status },
    );
  }
}
