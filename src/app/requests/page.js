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
      const url = filterStatus === "all" ? "/api/requests" : `/api/requests?status=${filterStatus}`;
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
    if (!confirm(`Are you sure you want to delete request "${reqTitle}"?`)) return;

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
          prev.map((item) => (item._id === reqId ? data.request : item))
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
      const res = await fetch(`/api/requests/${reqId}/comments?commentId=${commentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setRequests((prev) =>
          prev.map((item) => (item._id === reqId ? data.request : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl bg-white p-6 border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquarePlus className="h-6 w-6 text-blue-600" />
            Requirement Requests ("Mujhe Yeh Chahiye")
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Need specific notes, past papers, or books? Post your request here for fellow students to help out!
          </p>
        </div>

        {isSignedIn && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" /> Post Requirement
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {["all", "open", "fulfilled"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              filterStatus === st
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Requests Feed */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center bg-white text-gray-500 text-sm">
          No requirement requests found.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isExpanded = expandedRequestId === req._id;
            const isRequestOwner = user && req.createdBy?.clerkId === user.id;

            return (
              <div key={req._id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          req.status === "fulfilled"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {req.status === "fulfilled" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Fulfilled
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" /> Open Request
                          </>
                        )}
                      </span>
                      {req.semester && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          Sem {req.semester}
                        </span>
                      )}
                      {req.subject && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          {req.subject}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{req.title}</h3>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{req.description}</p>
                  </div>

                  {isRequestOwner && (
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleToggleStatus(req._id, req.status)}
                        className="text-xs font-semibold text-gray-500 hover:text-blue-600 underline cursor-pointer"
                      >
                        Mark as {req.status === "open" ? "Fulfilled" : "Open"}
                      </button>

                      <button
                        onClick={() => handleDeleteRequest(req._id, req.title)}
                        title="Delete request"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Metadata & Discussion toggle */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>Requested by {req.createdBy?.firstName || "Student"}</span>
                  </div>

                  <button
                    onClick={() => setExpandedRequestId(isExpanded ? null : req._id)}
                    className="flex items-center gap-1 font-medium text-blue-600 hover:underline cursor-pointer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>{req.comments?.length || 0} Responses</span>
                  </button>
                </div>

                {/* Comment / Discussion Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">Discussion & Help</h4>

                    {req.comments && req.comments.length > 0 ? (
                      <div className="space-y-2">
                        {req.comments.map((c) => {
                          const isCommentOwner = user && (c.createdBy?.clerkId === user.id || req.createdBy?.clerkId === user.id);
                          return (
                            <div key={c._id} className="group rounded-md bg-white p-3 text-xs border border-gray-200 flex items-start justify-between gap-2">
                              <div>
                                <div className="font-bold text-gray-800 mb-0.5">
                                  {c.createdBy?.firstName || "Student"}
                                </div>
                                <p className="text-gray-700">{c.text}</p>
                              </div>

                              {isCommentOwner && (
                                <button
                                  onClick={() => handleDeleteComment(req._id, c._id)}
                                  title="Delete response"
                                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity cursor-pointer shrink-0"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">No responses yet. Be the first to help!</p>
                    )}

                    {isSignedIn && (
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Write a response or share link..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none bg-white"
                        />
                        <button
                          onClick={() => handleAddComment(req._id)}
                          disabled={commentSubmitting || !commentText.trim()}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                        >
                          <Send className="h-3 w-3" /> Send
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Post Requirement Request</h2>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">What do you need? (Title)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Need CS301 Midterm Past Papers 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Details / Description</label>
                <textarea
                  required
                  placeholder="Explain what specific topics, chapters, or files you are looking for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester (Optional)</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        Semester {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Data Structures"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

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
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
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
