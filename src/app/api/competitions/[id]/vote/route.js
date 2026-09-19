import dbConnect from "@/lib/mongoose";
import User from "@/lib/models/User";
import CompetitionMatch from "@/lib/models/CompetitionMatch";
import { requireUser } from "@/lib/auth";
import { finalizeMatch } from "@/lib/FinalizeMatch";

function getVoteMatchChecks(comp) {
  if (!comp) {
    return { ok: false, status: 404, error: "Competition not found" };
  }
  if (
    comp.status === "Started" &&
    comp.expiresAt &&
    comp.expiresAt <= new Date()
  ) {
    return {
      ok: false,
      status: 400,
      error: "This competition has ended",
      expired: true,
    };
  }
  if (comp.status !== "Started") {
    return {
      ok: false,
      status: 400,
      error: "Competition not active",
    };
  }
  return { ok: true };
}

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const user = await requireUser();
    const { id } = await params;
    const { candidate } = await req.json();

    if (!candidate) {
      return new Response(JSON.stringify({ error: "Candidate id required" }), {
        status: 400,
      });
    }

    const comp = await CompetitionMatch.findById(id);
    const checks = getVoteMatchChecks(comp);
    if (!checks.ok) {
      if (checks.expired && comp) await finalizeMatch(comp);
      return new Response(JSON.stringify({ error: checks.error }), {
        status: checks.status,
      });
    }

    const validCandidate =
      candidate.toString() === comp.player1?.toString() ||
      candidate.toString() === comp.player2?.toString();
    if (!validCandidate) {
      return new Response(
        JSON.stringify({ error: "Invalid candidate for this competition" }),
        { status: 400 },
      );
    }

    const alreadyVoted = comp.votes.some(
      (v) => v.voter?.toString() === user._id.toString(),
    );
    if (alreadyVoted) {
      return new Response(
        JSON.stringify({
          error:
            "You have already voted. Cancel your existing vote first to change it.",
        }),
        { status: 400 },
      );
    }

    comp.votes.push({ voter: user._id, candidate });
    await comp.save();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Vote error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Server error" }),
      { status: err?.status || 500 },
    );
  }
}

/**
 * DELETE /api/competitions/[id]/vote – cancel/undo the current user's vote
 * in the given live competition. The vote is simply removed from the votes
 * array so the user can vote again (for any participant) later.
 */
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const user = await requireUser();
    const { id } = await params;

    const comp = await CompetitionMatch.findById(id);
    const checks = getVoteMatchChecks(comp);
    if (!checks.ok) {
      if (checks.expired && comp) await finalizeMatch(comp);
      return new Response(JSON.stringify({ error: checks.error }), {
        status: checks.status,
      });
    }

    const before = comp.votes.length;
    comp.votes = comp.votes.filter(
      (v) => v.voter?.toString() !== user._id.toString(),
    );
    const removed = before - comp.votes.length;

    if (removed === 0) {
      return new Response(
        JSON.stringify({ error: "You haven't voted in this competition yet" }),
        { status: 400 },
      );
    }

    await comp.save();
    return new Response(
      JSON.stringify({ success: true, removed }),
      { status: 200 },
    );
  } catch (err) {
    console.error("Cancel vote error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Server error" }),
      { status: err?.status || 500 },
    );
  }
}
