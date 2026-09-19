import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import CompetitionMatch from "@/lib/models/CompetitionMatch";
import User from "@/lib/models/User";
import { currentUser } from "@clerk/nextjs/server";
import { sendEmail, isValidEmail } from "@/lib/email";

export async function POST(req) {
  try {
    await dbConnect();

    const body = (await req.json().catch(() => ({}))) || {};
    const { winnerEmail } = body;

    const clerkUser = await currentUser();

    const adminEmail =
      clerkUser?.emailAddresses?.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress;

    if (!adminEmail || !adminEmail.includes("sijjadkhan603@gmail.com")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!winnerEmail || !isValidEmail(winnerEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid winner email address" },
        { status: 400 },
      );
    }

    const winnerUser = await User.findOne({
      email: { $regex: `^${winnerEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (!winnerUser) {
      return NextResponse.json(
        { error: `No user found with email "${winnerEmail}"` },
        { status: 404 },
      );
    }

    const match = await CompetitionMatch.findOne({
      status: { $in: ["Started", "Active"] },
      $or: [
        { player1: winnerUser._id, player2: { $ne: null } },
        { player2: winnerUser._id },
      ],
    }).sort({ createdAt: -1 });

    if (!match) {
      return NextResponse.json(
        {
          error:
            "No active/in-progress competition found that includes this user as a participant.",
        },
        { status: 404 },
      );
    }

    const winnerId = winnerUser._id;
    match.winner = winnerId;
    match.status = "Completed";
    await match.save();

    const winner = winnerUser;
    const loserId =
      String(winnerId) === String(match.player1)
        ? match.player2
        : match.player1;
    const loser = loserId ? await User.findById(loserId) : null;

    const notify = async (to, subject, text) => {
      if (!isValidEmail(to)) return;
      try {
        await sendEmail({ to, subject, text });
      } catch (err) {
        console.error("winner route: failed to send email to", to, err);
      }
    };

    await Promise.all([
      notify(
        winner?.email,
        "Congratulations – You won the competition!",
        `Hey ${winner?.firstName || winner?.name || "there"}, you have been declared the winner of the recent 1v1 competition. 🎉`,
      ),
      notify(
        loser?.email,
        "Result of your recent competition",
        `Hi ${loser?.firstName || loser?.name || "there"}, unfortunately you lost this round. Better luck next time!`,
      ),
    ]);

    return NextResponse.json({
      success: true,
      matchId: match._id,
      winner: {
        _id: winner?._id,
        name: `${winner?.firstName || ""} ${winner?.lastName || ""}`.trim() || winner?.email,
        email: winner?.email,
      },
      loser: loser
        ? {
            _id: loser._id,
            name: `${loser.firstName || ""} ${loser.lastName || ""}`.trim() || loser.email,
            email: loser.email,
          }
        : null,
    });
  } catch (err) {
    console.error("Winner route error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 },
    );
  }
}
