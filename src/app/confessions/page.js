"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Plus, Loader2, Sparkles, EyeOff } from "lucide-react";
import ConfessionCard from "@/app/components/ConfessionCard";

export default function ConfessionsPage() {
  const { isSignedIn } = useUser();

  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const [postAnonymous, setPostAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [expandedId, setExpandedId] = useState(null);
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
      const res = await fetch(`/api/confessions/${id}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setConfessions((prev) =>
          prev.map((c) => (c._id === id ? data.confession : c))
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
        body: JSON.stringify({ text: commentText, isAnonymous: commentAnonymous }),
      });
      const data = await res.json();
      if (res.ok) {
        setCommentText("");
        setCommentAnonymous(false);
        setConfessions((prev) =>
          prev.map((c) => (c._id === id ? data.confession : c))
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
        { method: "DELETE" }
      );
      const data = await res.json();
      if (res.ok) {
        setConfessions((prev) =>
          prev.map((c) => (c._id === confessionId ? data.confession : c))
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl bg-white p-6 border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Campus Confessions & Advice Wall
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Share thoughts, seek advice, or vent safely. Toggle anonymous posting anytime.
          </p>
        </div>

        {isSignedIn && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" /> Share Confession
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : confessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center bg-white text-gray-500 text-sm">
          No confessions yet. Be the first to share something!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {confessions.map((confession) => (
            <ConfessionCard
              key={confession._id}
              confession={confession}
              isExpanded={expandedId === confession._id}
              isSignedIn={isSignedIn}
              isOwner={isSignedIn && confession.isOwner}
              likingId={likingId}
              commentText={commentText}
              commentAnonymous={commentAnonymous}
              commentSubmitting={commentSubmitting}
              onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Share a Confession</h2>
            <p className="text-xs text-gray-500">
              Your identity is always stored securely for moderation, but hidden from others when anonymous.
            </p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  What&apos;s on your mind?
                </label>
                <textarea
                  required
                  maxLength={2000}
                  placeholder="Share a confession, ask for advice, or vent about campus life..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  rows={5}
                />
                <p className="mt-1 text-[10px] text-gray-400 text-right">
                  {content.length}/2000
                </p>
              </div>

              <label className="flex items-center gap-3 rounded-lg border border-purple-100 bg-purple-50 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postAnonymous}
                  onChange={(e) => setPostAnonymous(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-sm font-semibold text-purple-900 flex items-center gap-1.5">
                    <EyeOff className="h-4 w-4" /> Post Anonymously
                  </span>
                  <span className="text-xs text-purple-700">
                    {postAnonymous
                      ? "Your name and avatar will be hidden from the feed"
                      : "Your full name and profile photo will be visible"}
                  </span>
                </div>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Posting..." : "Post Confession"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
