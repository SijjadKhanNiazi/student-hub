import dbConnect from "@/lib/mongoose";
import User from "@/lib/models/User";
import CompetitionMatch from "@/lib/models/CompetitionMatch";
import { finalizeMatch } from "@/lib/FinalizeMatch";

export async function GET() {
  try {
    await dbConnect();

    let comp = await CompetitionMatch.findOne({ status: "Started" });

    // Auto-close the competition once time is up — this is what makes the
    // winner "just appear" without an admin having to click anything.
    if (comp && comp.expiresAt && comp.expiresAt <= new Date()) {
      await finalizeMatch(comp);
      comp = null;
    }

    if (!comp) {
      return new Response(JSON.stringify({ competition: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const populated = await CompetitionMatch.findById(comp._id)
      .populate("player1 player2 votes.voter votes.candidate")
      .lean();

    return new Response(JSON.stringify({ competition: populated }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Active competition error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to load active competition" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
