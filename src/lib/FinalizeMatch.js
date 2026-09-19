import User from "@/lib/models/User";
import { sendEmail, isValidEmail } from "@/lib/email";

/**
 * Tallies votes on a Started match, marks it Completed, sets the winner,
 * and (best-effort) emails both players. Expects a full Mongoose document
 * (not `.lean()`), since it calls `.save()`.
 *
 * Safe to call multiple times on the same match — once status is
 * "Completed" it's a no-op, so concurrent requests hitting expiry at the
 * same time won't double-process it.
 */
export async function finalizeMatch(match) {
  if (!match || match.status === "Completed") return match;

  const p1Id = match.player1?.toString();
  const p2Id = match.player2?.toString();

  const p1Votes = match.votes.filter(
    (v) => v.candidate?.toString() === p1Id,
  ).length;
  const p2Votes = match.votes.filter(
    (v) => v.candidate?.toString() === p2Id,
  ).length;

  let winnerId = null;
  if (p1Votes > p2Votes) winnerId = match.player1;
  else if (p2Votes > p1Votes) winnerId = match.player2;

  match.winner = winnerId;
  match.status = "Completed";
  await match.save();

  try {
    await sendResultEmails(match, winnerId, p1Id, p2Id);
  } catch (err) {
    console.error("finalizeMatch: failed to send result emails", err);
  }

  return match;
}

async function sendResultEmails(match, winnerId, p1Id, p2Id) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const [player1, player2] = await Promise.all([
    User.findById(match.player1),
    match.player2 ? User.findById(match.player2) : null,
  ]);

  const nameOf = (u) =>
    `${u?.firstName || ""} ${u?.lastName || ""}`.trim() || "there";

  const send = async (to, subject, text) => {
    if (!isValidEmail(to)) return;
    try {
      await sendEmail({ to, subject, text });
    } catch (err) {
      console.error("FinalizeMatch: failed to send email to", to, err);
    }
  };

  const jobs = [];
  if (!winnerId) {
    if (player1?.email)
      jobs.push(
        send(
          player1.email,
          "Competition result",
          `Hey ${nameOf(player1)}, your round ended in a tie!`,
        ),
      );
    if (player2?.email)
      jobs.push(
        send(
          player2.email,
          "Competition result",
          `Hey ${nameOf(player2)}, your round ended in a tie!`,
        ),
      );
  } else {
    const winnerIsP1 = winnerId.toString() === p1Id;
    const winner = winnerIsP1 ? player1 : player2;
    const loser = winnerIsP1 ? player2 : player1;
    if (winner?.email) {
      jobs.push(
        send(
          winner.email,
          "Congratulations – You won the competition!",
          `Hey ${nameOf(winner)}, you have been declared the winner of the recent 1v1 competition. 🎉`,
        ),
      );
    }
    if (loser?.email) {
      jobs.push(
        send(
          loser.email,
          "Result of your recent competition",
          `Hi ${nameOf(loser)}, unfortunately you lost this round. Better luck next time!`,
        ),
      );
    }
  }
  await Promise.all(jobs);
}
