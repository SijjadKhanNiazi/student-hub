"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import CompetitionAdminPanel from "../components/CompetitionAdminPanel";

export default function CompetitionsPage() {
  const { user: clerkUser, isSignedIn } = useUser();
  const [role, setRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [msg, setMsg] = useState("");
  const [activeComp, setActiveComp] = useState(null);

  // fetch current user role + DB user ID from /api/me
  useEffect(() => {
    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setRole(data.role);
        setCurrentUserId(data.id);
      })
      .catch(() => {
        setRole(null);
        setCurrentUserId(null);
      });
  }, [clerkUser, isSignedIn]);

  // fetch pending list
  useEffect(() => {
    fetch("/api/competitions/pending")
      .then((res) => res.json())
      .then((data) => setPending(data.pending || []))
      .catch(() => setPending([]));
  }, []);

  // fetch active competition and poll
  const loadActive = async () => {
    try {
      const res = await fetch("/api/competitions/active");
      if (res.ok) {
        const data = await res.json();
        setActiveComp(data.competition);
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadActive();
    const interval = setInterval(loadActive, 5000);
    return () => clearInterval(interval);
  }, []);

  const startCompetition = async (preferredMatchId) => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/competitions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: preferredMatchId
          ? JSON.stringify({ preferredMatchId })
          : undefined,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to start");
      setMsg(
        preferredMatchId
          ? "Competition started with selected request!"
          : "Competition started!",
      );
      const fresh = await fetch("/api/competitions/pending");
      const freshData = await fresh.json();
      setPending(freshData.pending || []);
      await loadActive();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const vote = async (candidateId) => {
    if (!activeComp || loading || cancelling) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/competitions/${activeComp._id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate: candidateId }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Failed to vote");
      setMsg("Vote recorded! You can cancel it later if you change your mind.");
      await loadActive();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelVote = async () => {
    if (!activeComp || cancelling || loading) return;
    setCancelling(true);
    setMsg("");
    try {
      const res = await fetch(`/api/competitions/${activeComp._id}/vote`, {
        method: "DELETE",
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Failed to cancel vote");
      setMsg("Vote cancelled. You can vote again.");
      await loadActive();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setCancelling(false);
    }
  };

  // Figure out who the current user voted for in the live match.
  // The votes array comes back from /active with .voter populated in some
  // cases, so handle both cases: voter = ObjectId string, or voter = user doc.
  const getCurrentUserVoteCandidateId = () => {
    if (!activeComp || !currentUserId) return null;
    const myVote = (activeComp.votes || []).find((v) => {
      const voterId =
        typeof v.voter === "object" && v.voter !== null
          ? v.voter._id || v.voter.id
          : v.voter;
      return voterId?.toString() === currentUserId.toString();
    });
    if (!myVote) return null;
    const c = myVote.candidate;
    return typeof c === "object" && c !== null ? c._id || c.id : c;
  };

  return (
    <section className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Competitions</h1>
      <p className="text-center mb-6 text-lg text-gray-700 dark:text-gray-300">
        Join the voting competition to showcase your work and vote for the best
        submissions.
      </p>
      <div className="flex justify-center mb-6">
        <Link
          href="/competitions/register"
          className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:opacity-90 transition"
        >
          Register for Competition
        </Link>
      </div>

      {/* Pending users preview */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">
          Waiting List ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No pending competition requests yet.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((p) => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.user?.imageUrl || "/images/default-avatar.png"}
                    alt={`${p.user?.firstName || ""} ${p.user?.lastName || ""}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">
                      {p.user?.firstName || "—"}{" "}
                      {p.user?.lastName || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {p.user?.email || "No email"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Requested: {new Date(p.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {role === "admin" && (
                  <button
                    onClick={() => startCompetition(p.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 text-sm font-medium self-start sm:self-center"
                  >
                    {loading ? "Starting..." : "Approve & Start"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin controls */}
      {role === "admin" && (
        <div className="mt-4">
          <CompetitionAdminPanel />
          <button
            onClick={startCompetition}
            disabled={loading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Starting..." : "Start Next Competition"}
          </button>
          {msg && (
            <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
              {msg}
            </p>
          )}
        </div>
      )}

      {/* Active competition voting section */}
      {activeComp && (
        <div className="mt-8 border-t pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-2xl font-bold">Live Competition</h2>
            {currentUserId && getCurrentUserVoteCandidateId() && (
              <button
                onClick={cancelVote}
                disabled={loading || cancelling}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-white rounded-lg transition disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "↩ Cancel My Vote"}
              </button>
            )}
          </div>
          {/* Show the status/result message here too, so it's visible even
              when there's no admin panel rendered above (non-admin users). */}
          {role !== "admin" && msg && (
            <p className="mb-4 text-sm text-center text-gray-800 dark:text-gray-200">
              {msg}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            {[activeComp.player1, activeComp.player2]
              .filter(Boolean)
              .map((user) => {
                const voteCount = (activeComp.votes || []).filter((v) => {
                  const candidateId =
                    typeof v.candidate === "object" && v.candidate !== null
                      ? v.candidate._id
                      : v.candidate;
                  return candidateId?.toString() === user._id?.toString();
                }).length;
                const votedFor =
                  getCurrentUserVoteCandidateId()?.toString() ===
                  user._id?.toString();
                const votedSomeoneElse =
                  currentUserId &&
                  getCurrentUserVoteCandidateId() &&
                  !votedFor;

                return (
                  <div
                    key={user._id}
                    className={`p-4 border rounded-lg text-center transition ${
                      votedFor
                        ? "ring-2 ring-[#FF6B35] border-[#FF6B35] bg-orange-50 dark:bg-orange-950/30"
                        : ""
                    }`}
                  >
                    {votedFor && (
                      <span className="inline-block mb-2 text-xs font-medium px-2 py-0.5 rounded-full bg-[#FF6B35] text-white">
                        ✓ Your vote
                      </span>
                    )}
                    <img
                      src={user.imageUrl || "/default-avatar.png"}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-24 h-24 rounded-full mx-auto mb-2 object-cover"
                    />
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                    <p className="mt-2">Votes: {voteCount}</p>
                    <button
                      onClick={() => vote(user._id)}
                      disabled={
                        loading ||
                        cancelling ||
                        (!!currentUserId && !!getCurrentUserVoteCandidateId())
                      }
                      className="mt-2 px-4 py-2 bg-[#FF6B35] text-white rounded hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title={
                        currentUserId &&
                        getCurrentUserVoteCandidateId() &&
                        !votedFor
                          ? "Cancel your current vote first to switch candidates."
                          : ""
                      }
                    >
                      {loading
                        ? "..."
                        : votedFor
                        ? "✓ Already Voted"
                        : votedSomeoneElse
                        ? "Cancel Vote First"
                        : "Vote"}
                    </button>
                  </div>
                );
              })}
          </div>
          {activeComp.expiresAt && (
            <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
              Voting closes:{" "}
              {new Date(activeComp.expiresAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
