import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/lib/models/User";
import CompetitionMatch from "@/lib/models/CompetitionMatch";
import { requireAdmin } from "@/lib/auth";

// How long a started competition stays open for voting.
const COMPETITION_DURATION_MS = 48 * 60 * 60 * 1000; // 48 hours

/**
 * POST /api/competitions/start – admin starts a competition.
 *
 * Optional body: { preferredMatchId } – when provided, the admin has clicked
 * a specific pending request in the dashboard; we pair that request with the
 * next-oldest other waiting user and start the match. When omitted, we simply
 * pair the two oldest waiting registrations (existing behaviour).
 */
export async function POST(req) {
  try {
    await requireAdmin();
    await dbConnect();

    let body = {};
    try {
      body = req ? await req.json().catch(() => ({})) : {};
    } catch (_) {
      body = {};
    }
    const { preferredMatchId } = body || {};

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

    const allPending = await CompetitionMatch.find({
      player2: null,
      status: "Active",
    }).sort({ createdAt: 1 });

    if (allPending.length < 2) {
      return NextResponse.json(
        { error: "Not enough pending users to start a competition" },
        { status: 400 },
      );
    }

    let first;
    let second;

    if (preferredMatchId) {
      first = allPending.find(
        (m) => m._id.toString() === preferredMatchId.toString(),
      );
      if (!first) {
        return NextResponse.json(
          {
            error:
              "Requested competition request was not found or is no longer pending.",
          },
          { status: 404 },
        );
      }
      const others = allPending.filter(
        (m) => m._id.toString() !== preferredMatchId.toString(),
      );
      if (others.length === 0) {
        return NextResponse.json(
          {
            error:
              "Need at least one other pending user to pair with this request.",
          },
          { status: 400 },
        );
      }
      second = others[0];
    } else {
      first = allPending[0];
      second = allPending[1];
    }

    first.player2 = second.player1;
    first.player2Photo = second.player1Photo || null;
    first.status = "Started";
    first.expiresAt = new Date(Date.now() + COMPETITION_DURATION_MS);
    await first.save();

    await CompetitionMatch.findByIdAndDelete(second._id);

    return NextResponse.json(
      { success: true, matchId: first._id },
      { status: 200 },
    );
  } catch (err) {
    console.error("Start competition error:", err);
    const status = err?.status || 500;
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status },
    );
  }
}
