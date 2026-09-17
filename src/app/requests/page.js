"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  MessageSquarePlus,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  Loader2,
  User as UserIcon,
  MessageCircle,
  Trash2,
} from "lucide-react";

export default function RequestsPage() {
  const { user, isSignedIn } = useUser();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  // Post Request Modal state
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Active Comment Drawer / View State
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const url =
        filterStatus === "all"
          ? "/api/requests"
          : `/api/requests?status=${filterStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, semester, subject }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post request");

      setTitle("");
      setDescription("");
      setSemester("");
      setSubject("");
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (reqId, currentStatus) => {
    try {
      const nextStatus = currentStatus === "open" ? "fulfilled" : "open";
      const res = await fetch(`/api/requests/${reqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRequest = async (reqId, reqTitle) => {
    if (!confirm(`Are you sure you want to delete request "${reqTitle}"?`))
      return;

    try {
      const res = await fetch(`/api/requests/${reqId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete request");

      fetchRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddComment = async (reqId) => {
    if (!commentText.trim()) return;
    try {
      setCommentSubmitting(true);
      const res = await fetch(`/api/requests/${reqId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      const data = await res.json();
      if (res.ok) {
        setCommentText("");
        setRequests((prev) =>
          prev.map((item) => (item._id === reqId ? data.request : item)),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (reqId, commentId) => {
    if (!confirm("Are you sure you want to delete this response?")) return;

    try {
      const res = await fetch(
        `/api/requests/${reqId}/comments?commentId=${commentId}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (res.ok) {
        setRequests((prev) =>
          prev.map((item) => (item._id === reqId ? data.request : item)),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white dark:bg-zinc-900/50 p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm transition-all">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
            <MessageSquarePlus className="h-3.5 w-3.5" /> Peer Help Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Requirement Requests (&quot;I need this&quot;)
          </h1>
          <p className="text-sm opacity-70 max-w-xl">
            Need specific notes, past papers, or books? Post your request here
            for fellow students to help out!
          </p>
        </div>

        {isSignedIn && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" /> Post Requirement
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        {["all", "open", "fulfilled"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filterStatus === st
                ? "bg-accent text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 opacity-70 hover:opacity-100"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Requests Feed */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-white/50 dark:bg-zinc-900/30 opacity-70 text-sm">
          No requirement requests found. Be the first to post one!
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isExpanded = expandedRequestId === req._id;
            const isRequestOwner = user && req.createdBy?.clerkId === user.id;

            return (
              <div
                key={req._id}
                className="card-glow rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 shadow-sm space-y-4 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          req.status === "fulfilled"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {req.status === "fulfilled" ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Fulfilled
                          </>
                        ) : (
                          <>
                            <Clock className="h-3.5 w-3.5" /> Open Request
                          </>
                        )}
                      </span>
                      {req.semester && (
                        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 opacity-80 px-2.5 py-1 rounded-full font-medium">
                          Sem {req.semester}
                        </span>
                      )}
                      {req.subject && (
                        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 opacity-80 px-2.5 py-1 rounded-full font-medium">
                          {req.subject}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">
                      {req.title}
                    </h3>
                    <p className="text-sm opacity-80 whitespace-pre-line leading-relaxed">
                      {req.description}
                    </p>
                  </div>

                  {isRequestOwner && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleStatus(req._id, req.status)}
                        className="text-xs font-semibold opacity-70 hover:opacity-100 hover:text-accent underline cursor-pointer px-2 py-1"
                      >
                        Mark as {req.status === "open" ? "Fulfilled" : "Open"}
                      </button>

                      <button
                        onClick={() => handleDeleteRequest(req._id, req.title)}
                        title="Delete request"
                        className="p-2 opacity-60 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Metadata & Discussion toggle */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs opacity-70">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>
                      Requested by {req.createdBy?.firstName || "Student"}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      setExpandedRequestId(isExpanded ? null : req._id)
                    }
                    className="flex items-center gap-1.5 font-semibold text-accent hover:underline cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{req.comments?.length || 0} Responses</span>
                  </button>
                </div>

                {/* Comment / Discussion Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3 bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider opacity-60">
                      Discussion & Help
                    </h4>

                    {req.comments && req.comments.length > 0 ? (
                      <div className="space-y-2.5">
                        {req.comments.map((c) => {
                          const isCommentOwner =
                            user &&
                            (c.createdBy?.clerkId === user.id ||
                              req.createdBy?.clerkId === user.id);
                          return (
                            <div
                              key={c._id}
                              className="group rounded-xl bg-white dark:bg-zinc-900 p-3.5 text-xs border border-zinc-200/80 dark:border-zinc-800 flex items-start justify-between gap-3 shadow-2xs"
                            >
                              <div className="space-y-1">
                                <div className="font-bold opacity-90">
                                  {c.createdBy?.firstName || "Student"}
                                </div>
                                <p className="opacity-80 leading-relaxed">
                                  {c.text}
                                </p>
                              </div>

                              {isCommentOwner && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(req._id, c._id)
                                  }
                                  title="Delete response"
                                  className="opacity-0 group-hover:opacity-100 p-1.5 opacity-60 hover:opacity-100 hover:text-red-500 transition-opacity cursor-pointer shrink-0"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs opacity-60 italic">
                        No responses yet. Be the first to help!
                      </p>
                    )}

                    {isSignedIn && (
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Write a response or share link..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 text-xs focus:border-accent focus:outline-none bg-white dark:bg-zinc-900 transition-colors"
                        />
                        <button
                          onClick={() => handleAddComment(req._id)}
                          disabled={commentSubmitting || !commentText.trim()}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                          <Send className="h-3.5 w-3.5" /> Send
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Post Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Post Requirement Request
              </h2>
              <p className="text-xs opacity-60 mt-1">
                Let the community know what study material you are hunting for.
              </p>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-80">
                  What do you need? (Title)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Need CS301 Midterm Past Papers 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none bg-zinc-50/50 dark:bg-zinc-950/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-80">
                  Details / Description
                </label>
                <textarea
                  required
                  placeholder="Explain what specific topics, chapters, or files you are looking for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none bg-zinc-50/50 dark:bg-zinc-950/50 transition-colors resize-none"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-80">
                    Semester (Optional)
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none bg-zinc-50/50 dark:bg-zinc-950/50 transition-colors"
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n} className="dark:bg-zinc-900">
                        Semester {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-80">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Data Structures"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none bg-zinc-50/50 dark:bg-zinc-950/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-sm font-semibold opacity-70 hover:opacity-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-md transition-all"
                >
                  {submitting ? "Posting..." : "Post Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
