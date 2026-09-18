"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  X,
  AlertCircle,
} from "lucide-react";

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 1000;
const COMMENT_MAX = 500;

/* -------------------------------------------------------------------------- */
/* Small shared UI primitives                                                 */
/* -------------------------------------------------------------------------- */

/** Fixed-position toast stack. Replaces window.alert() for error/success feedback. */
function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.variant === "error" ? "alert" : "status"}
          className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            t.variant === "error"
              ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/60 dark:border-red-900 dark:text-red-200"
              : "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-900 dark:text-emerald-200"
          }`}
        >
          {t.variant === "error" ? (
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <p className="flex-1 leading-snug">{t.message}</p>
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
            className="opacity-60 hover:opacity-100 cursor-pointer shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

/** Accessible confirm modal. Replaces window.confirm(). */
function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger,
  busy,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onClick={() => !busy && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 text-zinc-900 dark:text-zinc-100"
      >
        <div className="space-y-1.5">
          <h2 id="confirm-dialog-title" className="text-base font-bold">
            {title}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer shadow-sm transition-all ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-accent hover:opacity-90"
            }`}
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const isFulfilled = status === "fulfilled";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        isFulfilled
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      }`}
    >
      {isFulfilled ? (
        <>
          <CheckCircle2 className="h-3.5 w-3.5" /> Fulfilled
        </>
      ) : (
        <>
          <Clock className="h-3.5 w-3.5" /> Open Request
        </>
      )}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Main page                                                                  */
/* -------------------------------------------------------------------------- */

export default function RequestsPage() {
  const { user, isSignedIn } = useUser();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Toasts (replace alert())
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef({});

  const pushToast = useCallback((message, variant = "success") => {
    const id = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    toastTimers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete toastTimers.current[id];
    }, 5000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (toastTimers.current[id]) {
      clearTimeout(toastTimers.current[id]);
      delete toastTimers.current[id];
    }
  }, []);

  useEffect(() => {
    return () => {
      Object.values(toastTimers.current).forEach(clearTimeout);
    };
  }, []);

  // Post Request Modal state
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const titleInputRef = useRef(null);

  // Active Comment Drawer / View State
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Per-item busy state, keyed by request/comment id, so one action doesn't
  // disable the whole page and multiple items can't be mutated concurrently.
  const [togglingId, setTogglingId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  // Confirm dialog state (generic, reused for request + comment deletion)
  const [confirmState, setConfirmState] = useState(null); // { type, id, extra, busy }

  useEffect(() => {
    if (showModal) {
      // Focus the first field when the modal opens for keyboard/screen-reader users.
      requestAnimationFrame(() => titleInputRef.current?.focus());
    }
  }, [showModal]);

  const fetchRequests = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setLoadError(null);
        const url =
          filterStatus === "all"
            ? "/api/requests"
            : `/api/requests?status=${filterStatus}`;
        const res = await fetch(url, { signal });
        if (!res.ok) {
          throw new Error(`Failed to load requests (${res.status})`);
        }
        const data = await res.json();
        setRequests(Array.isArray(data.requests) ? data.requests : []);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        setLoadError(
          "Couldn't load requests. Check your connection and try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [filterStatus],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchRequests(controller.signal);
    return () => controller.abort();
  }, [fetchRequests]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle || !trimmedDescription || submitting) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription,
          semester,
          subject: subject.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to post request");

      setTitle("");
      setDescription("");
      setSemester("");
      setSubject("");
      setShowModal(false);
      pushToast("Your request was posted.");
      fetchRequests();
    } catch (err) {
      pushToast(
        err.message || "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    if (submitting) return;
    setShowModal(false);
  };

  const handleToggleStatus = async (reqId, currentStatus) => {
    if (togglingId) return;
    const nextStatus = currentStatus === "open" ? "fulfilled" : "open";

    // Optimistic update
    setTogglingId(reqId);
    const previous = requests;
    setRequests((prev) =>
      prev.map((r) => (r._id === reqId ? { ...r, status: nextStatus } : r)),
    );

    try {
      const res = await fetch(`/api/requests/${reqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (err) {
      setRequests(previous); // roll back
      pushToast("Couldn't update the status. Please try again.", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const requestDeleteRequest = (reqId, reqTitle) => {
    setConfirmState({
      type: "request",
      id: reqId,
      label: reqTitle,
      busy: false,
    });
  };

  const requestDeleteComment = (reqId, commentId) => {
    setConfirmState({ type: "comment", id: commentId, reqId, busy: false });
  };

  const handleConfirmDelete = async () => {
    if (!confirmState) return;
    setConfirmState((s) => ({ ...s, busy: true }));

    try {
      if (confirmState.type === "request") {
        const res = await fetch(`/api/requests/${confirmState.id}`, {
          method: "DELETE",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to delete request");

        setRequests((prev) => prev.filter((r) => r._id !== confirmState.id));
        if (expandedRequestId === confirmState.id) setExpandedRequestId(null);
        pushToast("Request deleted.");
      } else {
        setDeletingCommentId(confirmState.id);
        const res = await fetch(
          `/api/requests/${confirmState.reqId}/comments?commentId=${confirmState.id}`,
          { method: "DELETE" },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to delete response");

        setRequests((prev) =>
          prev.map((item) =>
            item._id === confirmState.reqId ? data.request : item,
          ),
        );
        pushToast("Response deleted.");
      }
      setConfirmState(null);
    } catch (err) {
      pushToast(
        err.message || "Something went wrong. Please try again.",
        "error",
      );
      setConfirmState(null);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleAddComment = async (reqId) => {
    const trimmed = commentText.trim();
    if (!trimmed || commentSubmitting) return;

    try {
      setCommentSubmitting(true);
      const res = await fetch(`/api/requests/${reqId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to post response");

      setCommentText("");
      setRequests((prev) =>
        prev.map((item) => (item._id === reqId ? data.request : item)),
      );
    } catch (err) {
      pushToast(
        err.message || "Couldn't post your response. Please try again.",
        "error",
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 pb-12 text-zinc-900 dark:text-zinc-100">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <ConfirmDialog
        open={!!confirmState}
        title={
          confirmState?.type === "request"
            ? "Delete this request?"
            : "Delete this response?"
        }
        description={
          confirmState?.type === "request"
            ? `"${confirmState?.label}" and all of its responses will be permanently removed.`
            : "This response will be permanently removed."
        }
        confirmLabel="Delete"
        danger
        busy={!!confirmState?.busy}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmState(null)}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white dark:bg-zinc-900/50 p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
            <MessageSquarePlus className="h-3.5 w-3.5" /> Peer Help Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Requirement Requests (&quot;I need this&quot;)
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
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
      <div
        className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3"
        role="tablist"
        aria-label="Filter requests by status"
      >
        {["all", "open", "fulfilled"].map((st) => (
          <button
            key={st}
            role="tab"
            aria-selected={filterStatus === st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filterStatus === st
                ? "bg-accent text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
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
      ) : loadError ? (
        <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-8 text-center space-y-3">
          <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
          <button
            onClick={() => fetchRequests()}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 cursor-pointer transition-colors"
          >
            Try again
          </button>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-white/50 dark:bg-zinc-900/30 text-sm text-zinc-500 dark:text-zinc-400">
          No requirement requests found. Be the first to post one!
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isExpanded = expandedRequestId === req._id;
            const isRequestOwner = user && req.createdBy?.clerkId === user.id;
            const isToggling = togglingId === req._id;

            return (
              <div
                key={req._id}
                className="card-glow rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 shadow-sm space-y-4 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={req.status} />
                      {req.semester && (
                        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-full font-medium">
                          Sem {req.semester}
                        </span>
                      )}
                      {req.subject && (
                        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-full font-medium">
                          {req.subject}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white break-words">
                      {req.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed break-words">
                      {req.description}
                    </p>
                  </div>

                  {isRequestOwner && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleStatus(req._id, req.status)}
                        disabled={isToggling}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-accent underline decoration-transparent hover:decoration-current disabled:opacity-50 cursor-pointer px-2 py-1 transition-colors"
                      >
                        {isToggling && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        Mark as {req.status === "open" ? "Fulfilled" : "Open"}
                      </button>

                      <button
                        onClick={() => requestDeleteRequest(req._id, req.title)}
                        title="Delete request"
                        aria-label={`Delete request: ${req.title}`}
                        className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Metadata & Discussion toggle */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
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
                    aria-expanded={isExpanded}
                    className="flex items-center gap-1.5 font-semibold text-accent hover:underline cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{req.comments?.length || 0} Responses</span>
                  </button>
                </div>

                {/* Comment / Discussion Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3 bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Discussion & Help
                    </h4>

                    {req.comments && req.comments.length > 0 ? (
                      <div className="space-y-2.5">
                        {req.comments.map((c) => {
                          const isCommentOwner =
                            user &&
                            (c.createdBy?.clerkId === user.id ||
                              req.createdBy?.clerkId === user.id);
                          const isDeletingThis = deletingCommentId === c._id;
                          return (
                            <div
                              key={c._id}
                              className="group rounded-xl bg-white dark:bg-zinc-900 p-3.5 text-xs border border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-3 shadow-sm"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="font-bold text-zinc-800 dark:text-zinc-100">
                                  {c.createdBy?.firstName || "Student"}
                                </div>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed break-words">
                                  {c.text}
                                </p>
                              </div>

                              {isCommentOwner && (
                                <button
                                  onClick={() =>
                                    requestDeleteComment(req._id, c._id)
                                  }
                                  disabled={isDeletingThis}
                                  title="Delete response"
                                  aria-label="Delete this response"
                                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1.5 text-zinc-500 hover:text-red-500 disabled:opacity-50 transition-opacity cursor-pointer shrink-0"
                                >
                                  {isDeletingThis ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                        No responses yet. Be the first to help!
                      </p>
                    )}

                    {isSignedIn && (
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Write a response or share link..."
                          value={commentText}
                          maxLength={COMMENT_MAX}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !commentSubmitting) {
                              handleAddComment(req._id);
                            }
                          }}
                          aria-label="Write a response"
                          className="flex-1 min-w-0 rounded-xl border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-accent focus:outline-none bg-white dark:bg-zinc-900 transition-colors"
                        />
                        <button
                          onClick={() => handleAddComment(req._id)}
                          disabled={commentSubmitting || !commentText.trim()}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-sm shrink-0"
                        >
                          {commentSubmitting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          Send
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-request-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 text-zinc-900 dark:text-zinc-100"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="post-request-title"
                  className="text-xl font-bold tracking-tight"
                >
                  Post Requirement Request
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Let the community know what study material you are hunting
                  for.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close dialog"
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="req-title"
                    className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300"
                  >
                    What do you need? (Title)
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    {title.length}/{TITLE_MAX}
                  </span>
                </div>
                <input
                  id="req-title"
                  ref={titleInputRef}
                  type="text"
                  required
                  maxLength={TITLE_MAX}
                  placeholder="e.g. Need CS301 Midterm Past Papers 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-accent focus:outline-none bg-zinc-50/50 dark:bg-zinc-950/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="req-description"
                    className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300"
                  >
                    Details / Description
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    {description.length}/{DESCRIPTION_MAX}
                  </span>
                </div>
                <textarea
                  id="req-description"
                  required
                  maxLength={DESCRIPTION_MAX}
                  placeholder="Explain what specific topics, chapters, or files you are looking for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-accent focus:outline-none bg-zinc-50/50 dark:bg-zinc-950/50 transition-colors resize-none"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="req-semester"
                    className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300"
                  >
                    Semester (Optional)
                  </label>
                  <select
                    id="req-semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-accent focus:outline-none bg-zinc-50/50 dark:bg-zinc-950/50 transition-colors"
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
                  <label
                    htmlFor="req-subject"
                    className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300"
                  >
                    Subject (Optional)
                  </label>
                  <input
                    id="req-subject"
                    type="text"
                    placeholder="e.g. Data Structures"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-accent focus:outline-none bg-zinc-50/50 dark:bg-zinc-950/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !description.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-md transition-all"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
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
