"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Plus,
  Loader2,
  Sparkles,
  EyeOff,
  MessageSquareHeart,
  Flame,
  Ghost,
} from "lucide-react";
import ConfessionCard from "@/app/components/ConfessionCard";

export default function ConfessionsPage() {
  const { isSignedIn } = useUser();

  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const [postAnonymous, setPostAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  const [expandedId, setExpandedId] = useState(null);

useEffect(() => {
    // fetch current user role
    const fetchRole = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (res.ok && data.role === 'admin') setIsAdmin(true);
      } catch (e) {
        console.error('Failed to fetch user role', e);
      }
    };
    if (isSignedIn) fetchRole();
  }, [isSignedIn]);

  const [commentText, setCommentText] = useState("");
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [likingId, setLikingId] = useState(null);

  const fetchConfessions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/confessions");
      const data = await res.json();
      setConfessions(data.confessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfessions();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/confessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, isAnonymous: postAnonymous }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post confession");
      setConfessions((prev) => [data.confession, ...prev]);
      setContent("");
      setPostAnonymous(true);
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id) => {
    if (!isSignedIn) return;
    try {
      setLikingId(id);
      const res = await fetch(`/api/confessions/${id}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setConfessions((prev) =>
          prev.map((c) => (c._id === id ? data.confession : c)),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLikingId(null);
    }
  };

  const handleAddComment = async (id) => {
    if (!commentText.trim()) return;
    try {
      setCommentSubmitting(true);
      const res = await fetch(`/api/confessions/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: commentText,
          isAnonymous: commentAnonymous,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCommentText("");
        setCommentAnonymous(false);
        setConfessions((prev) =>
          prev.map((c) => (c._id === id ? data.confession : c)),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (confessionId, commentId) => {
    if (!confirm("Delete this advice reply?")) return;
    try {
      const res = await fetch(
        `/api/confessions/${confessionId}/comments?commentId=${commentId}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (res.ok) {
        setConfessions((prev) =>
          prev.map((c) => (c._id === confessionId ? data.confession : c)),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfession = async (id) => {
    if (!confirm("Delete this confession permanently?")) return;
    try {
      const res = await fetch(`/api/confessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConfessions((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 pb-16">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 p-6 sm:p-7 text-white shadow-lg">
        {/* Decorative icon — purely background */}
        <div className="absolute -right-8 -bottom-8 opacity-[0.08] pointer-events-none select-none">
          <MessageSquareHeart className="w-52 h-52" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-purple-200" />
              Anonymous Community Wall
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
              Campus Confessions & Advice
            </h1>
            <p className="text-purple-100/85 text-xs sm:text-sm leading-relaxed max-w-md">
              Share thoughts anonymously, vent about student life, or receive
              genuine guidance and support from peers.
            </p>
          </div>

          {isSignedIn && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-purple-700 hover:bg-purple-50 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Share Confession
            </button>
          )}
        </div>
      </div>

      {/* ── Feed bar ── */}
      <div className="flex items-center justify-between px-1">
        <div
          className="flex items-center gap-2 text-xs font-bold"
          style={{ color: "var(--brand-struct)" }}
        >
          <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
          Recent Confessions Feed
        </div>
        <span
          className="text-xs font-medium"
          style={{ color: "var(--brand-struct)", opacity: 0.45 }}
        >
          {confessions.length} {confessions.length === 1 ? "Post" : "Posts"}
        </span>
      </div>

      {/* ── Feed content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-purple-600" />
          <p
            className="text-xs font-medium animate-pulse"
            style={{ color: "var(--brand-struct)", opacity: 0.5 }}
          >
            Loading confessions feed...
          </p>
        </div>
      ) : confessions.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed p-14 text-center shadow-sm"
          style={{
            borderColor:
              "color-mix(in srgb, var(--brand-struct) 15%, transparent)",
            backgroundColor:
              "color-mix(in srgb, var(--brand-bg) 80%, var(--brand-struct) 4%)",
          }}
        >
          <Ghost
            className="h-10 w-10 mx-auto mb-3"
            style={{
              color: "color-mix(in srgb, var(--brand-struct) 20%, transparent)",
            }}
          />
          <p
            className="font-bold text-sm"
            style={{ color: "var(--brand-struct)" }}
          >
            No confessions yet
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--brand-struct)", opacity: 0.5 }}
          >
            Be the first to share a thought or start a conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {confessions.map((confession) => (
                          <ConfessionCard
                key={confession._id}
                confession={confession}
                isExpanded={expandedId === confession._id}
                isSignedIn={isSignedIn}
                isOwner={isSignedIn && confession.isOwner}
                isAdmin={isAdmin}
                likingId={likingId}
                commentText={commentText}
                commentAnonymous={commentAnonymous}
                commentSubmitting={commentSubmitting}
                onToggleExpand={(id) =>
                  setExpandedId(expandedId === id ? null : id)
                }
                onLike={handleLike}
                onDelete={handleDeleteConfession}
                onCommentTextChange={setCommentText}
                onCommentAnonymousChange={setCommentAnonymous}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
              />
          ))}
        </div>
      )}

      {/* ── Create Confession Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border p-6 sm:p-7 shadow-2xl space-y-5"
            style={{
              backgroundColor: "var(--brand-bg)",
              borderColor:
                "color-mix(in srgb, var(--brand-struct) 12%, transparent)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div>
              <h2
                className="text-base font-extrabold tracking-tight font-satoshi"
                style={{ color: "var(--brand-struct)" }}
              >
                Create a Confession
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--brand-struct)", opacity: 0.5 }}
              >
                Your identity is kept completely private when posting
                anonymously.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Textarea */}
              <div>
                <textarea
                  required
                  maxLength={2000}
                  placeholder="What's on your mind? Share a story, ask for advice, or vent..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border p-4 text-sm resize-none leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--brand-struct) 5%, var(--brand-bg))",
                    borderColor:
                      "color-mix(in srgb, var(--brand-struct) 15%, transparent)",
                    color: "var(--brand-struct)",
                  }}
                />
                <div className="mt-1.5 flex justify-end">
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: "var(--brand-struct)", opacity: 0.4 }}
                  >
                    {content.length}/2000
                  </span>
                </div>
              </div>

              {/* Anonymous toggle */}
              <label
                className="flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer select-none"
                style={{
                  borderColor: "color-mix(in srgb, #9333ea 20%, transparent)",
                  backgroundColor:
                    "color-mix(in srgb, #9333ea 6%, var(--brand-bg))",
                }}
              >
                <input
                  type="checkbox"
                  checked={postAnonymous}
                  onChange={(e) => setPostAnonymous(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <div className="flex-1">
                  <span
                    className="text-xs font-bold flex items-center gap-1.5 font-satoshi"
                    style={{ color: "var(--brand-struct)" }}
                  >
                    <EyeOff className="h-3.5 w-3.5 text-purple-500" />
                    Post Anonymously
                  </span>
                  <span className="text-[11px] block mt-0.5 text-purple-600 dark:text-purple-400">
                    {postAnonymous
                      ? "Your name & avatar will be hidden as a Ghost identity"
                      : "Your profile name and photo will be shown on the post"}
                  </span>
                </div>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--brand-struct) 15%, transparent)",
                    color: "var(--brand-struct)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "color-mix(in srgb, var(--brand-struct) 6%, transparent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50 cursor-pointer shadow-sm active:scale-95 transition-all"
                >
                  {submitting ? "Posting..." : "Publish Confession"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
