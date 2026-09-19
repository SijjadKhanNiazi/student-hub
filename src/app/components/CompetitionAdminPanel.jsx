"use client";
import { useState } from "react";

export default function CompetitionAdminPanel() {
  const [pairResult, setPairResult] = useState(null);
  const [winnerResult, setWinnerResult] = useState(null);
  const [winnerEmail, setWinnerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const createMatch = async () => {
    setError(null);
    setPairResult(null);
    try {
      const res = await fetch("/api/competitions/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create match");
      setPairResult(data);
    } catch (e) {
      setError(e.message);
    }
  };

  const declareWinner = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    setWinnerResult(null);
    if (!winnerEmail.trim()) {
      setError("Please enter the winner's email address.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/competitions/winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerEmail: winnerEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set winner");
      setWinnerResult(data);
      setWinnerEmail("");
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <h2 className="text-lg font-semibold mb-3 text-white">
        Competition Admin Panel
      </h2>

      <button
        onClick={createMatch}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition"
      >
        Create Random 1v1 Match
      </button>
      {pairResult && (
        <div className="mt-2 text-sm text-green-400">
          Match created:{" "}
          <span className="font-mono">{String(pairResult.matchId)}</span>
        </div>
      )}

      <form onSubmit={declareWinner} className="mt-6 space-y-2">
        <div>
          <h3 className="text-base font-medium text-white mb-1">
            Declare Winner by Email
          </h3>
          <p className="text-xs text-gray-400 mb-2">
            Enter the participant's email. The system will automatically find
            the active competition they are part of and declare them the
            winner.
          </p>
          <label className="block text-sm text-white mb-1">
            Winner Email Address
          </label>
          <input
            type="email"
            value={winnerEmail}
            onChange={(e) => setWinnerEmail(e.target.value)}
            className="w-full p-2 rounded bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g. student@example.com"
          />
        </div>
        <button
          type="submit"
          onClick={declareWinner}
          disabled={submitting}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition"
        >
          {submitting ? "Declaring..." : "Declare Winner"}
        </button>

        {winnerResult && (
          <div className="mt-3 p-3 rounded bg-green-900/40 border border-green-500/40 text-sm text-green-200 space-y-1">
            <p className="font-medium text-green-300">
              ✅ Winner recorded successfully!
            </p>
            <p>
              <span className="text-gray-300">Match ID:</span>{" "}
              <span className="font-mono">
                {String(winnerResult.matchId)}
              </span>
            </p>
            <p>
              <span className="text-gray-300">Winner:</span>{" "}
              {winnerResult.winner?.name || "—"}{" "}
              <span className="text-gray-400">
                ({winnerResult.winner?.email || "—"})
              </span>
            </p>
            {winnerResult.loser && (
              <p>
                <span className="text-gray-300">Opponent:</span>{" "}
                {winnerResult.loser.name || "—"}{" "}
                <span className="text-gray-400">
                  ({winnerResult.loser.email || "—"})
                </span>
              </p>
            )}
          </div>
        )}
      </form>

      {error && (
        <div className="mt-3 text-sm text-red-400">Error: {error}</div>
      )}
    </div>
  );
}
