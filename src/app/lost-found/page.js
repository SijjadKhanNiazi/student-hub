"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UploadButton } from "@/lib/uploadthing-components";
import {
  Search,
  Plus,
  MapPin,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Send,
  Trash2,
  Loader2,
  User as UserIcon,
  ImageIcon,
  X,
  SlidersHorizontal,
  PackageSearch,
} from "lucide-react";

// ── tiny helpers ──────────────────────────────────────────────────────────────

function Badge({ children, variant = "default" }) {
  const variants = {
    lost: "bg-rose-100   text-rose-700   dark:bg-rose-900/40   dark:text-rose-300",
    found:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    active:
      "bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300",
    resolved:
      "bg-gray-100   text-gray-500   dark:bg-gray-800      dark:text-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${variants[variant] || ""}`}
    >
      {children}
    </span>
  );
}

function FilterPill({ label, active, onClick, activeClass }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
        active
          ? activeClass || "text-white"
          : "text-[var(--brand-struct)] bg-[color-mix(in_srgb,var(--brand-struct)_8%,transparent)] hover:bg-[color-mix(in_srgb,var(--brand-struct)_14%,transparent)]"
      }`}
    >
      {label}
    </button>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function LostFoundPage() {
  const { user, isSignedIn } = useUser();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Lost");
  const [location, setLocation] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== "all") params.append("category", filterCategory);
      if (filterStatus !== "all") params.append("status", filterStatus);
      const res = await fetch(`/api/lost-found?${params.toString()}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filterCategory, filterStatus]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/lost-found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          location,
          imageUrl: uploadedImageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create post");
      setTitle("");
      setDescription("");
      setCategory("Lost");
      setLocation("");
      setUploadedImageUrl("");
      setShowModal(false);
      fetchPosts();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (postId, currentStatus) => {
    try {
      const next = currentStatus === "Active" ? "Resolved" : "Active";
      const res = await fetch(`/api/lost-found/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId, postTitle) => {
    if (!confirm(`Delete "${postTitle}"?`)) return;
    try {
      const res = await fetch(`/api/lost-found/${postId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete post");
      fetchPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;
    try {
      setCommentSubmitting(true);
      const res = await fetch(`/api/lost-found/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      const data = await res.json();
      if (res.ok) {
        setCommentText("");
        setPosts((prev) => prev.map((p) => (p._id === postId ? data.post : p)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      const res = await fetch(
        `/api/lost-found/${postId}/comments?commentId=${commentId}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (res.ok)
        setPosts((prev) => prev.map((p) => (p._id === postId ? data.post : p)));
    } catch (err) {
      console.error(err);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-16">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute -right-10 -bottom-10 opacity-[0.07] pointer-events-none select-none">
          <PackageSearch className="w-56 h-56" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm">
              <Search className="h-3 w-3" />
              Campus Lost & Found Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
              Find Lost Belongings Fast
            </h1>
            <p className="text-teal-100/85 text-xs sm:text-sm leading-relaxed max-w-md">
              Lost something on campus or found an item? Post details here to
              quickly reunite lost belongings with their owners.
            </p>
          </div>
          {isSignedIn && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-teal-700 hover:bg-teal-50 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" /> Report Item
            </button>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--brand-struct) 4%, var(--brand-bg))",
          borderColor:
            "color-mix(in srgb, var(--brand-struct) 10%, transparent)",
        }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: "var(--brand-struct)", opacity: 0.45 }}
          />
          <FilterPill
            label="All Items"
            active={filterCategory === "all"}
            onClick={() => setFilterCategory("all")}
            activeClass="bg-[var(--brand-struct)] text-[var(--brand-bg)]"
          />
          <FilterPill
            label="Lost"
            active={filterCategory === "Lost"}
            onClick={() => setFilterCategory("Lost")}
            activeClass="bg-rose-600 text-white"
          />
          <FilterPill
            label="Found"
            active={filterCategory === "Found"}
            onClick={() => setFilterCategory("Found")}
            activeClass="bg-emerald-600 text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-medium"
            style={{ color: "var(--brand-struct)", opacity: 0.45 }}
          >
            Status:
          </span>
          {["all", "Active", "Resolved"].map((st) => (
            <FilterPill
              key={st}
              label={st === "all" ? "All" : st}
              active={filterStatus === st}
              onClick={() => setFilterStatus(st)}
              activeClass="bg-blue-600 text-white"
            />
          ))}
        </div>
      </div>

      {/* ── Feed ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-teal-600" />
          <p
            className="text-xs font-medium"
            style={{ color: "var(--brand-struct)", opacity: 0.45 }}
          >
            Loading reports...
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed p-14 text-center"
          style={{
            borderColor:
              "color-mix(in srgb, var(--brand-struct) 15%, transparent)",
            backgroundColor:
              "color-mix(in srgb, var(--brand-bg) 80%, var(--brand-struct) 4%)",
          }}
        >
          <PackageSearch
            className="h-10 w-10 mx-auto mb-3"
            style={{
              color: "color-mix(in srgb, var(--brand-struct) 20%, transparent)",
            }}
          />
          <p
            className="font-bold text-sm"
            style={{ color: "var(--brand-struct)" }}
          >
            No reports match your filter
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--brand-struct)", opacity: 0.45 }}
          >
            Try changing the filters above or be the first to report an item.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => {
            const isOwner = user && post.user?.clerkId === user.id;
            const isExpanded = expandedPostId === post._id;

            return (
              <div
                key={post._id}
                className="flex flex-col rounded-2xl border overflow-hidden transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: "var(--brand-bg)",
                  borderColor:
                    "color-mix(in srgb, var(--brand-struct) 10%, transparent)",
                  boxShadow:
                    "0 1px 4px color-mix(in srgb, var(--brand-struct) 6%, transparent)",
                }}
              >
                {/* Image */}
                {post.imageUrl ? (
                  <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="h-20 w-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--brand-struct) 5%, var(--brand-bg))",
                    }}
                  >
                    <ImageIcon
                      className="h-6 w-6"
                      style={{
                        color:
                          "color-mix(in srgb, var(--brand-struct) 20%, transparent)",
                      }}
                    />
                  </div>
                )}

                {/* Body */}
                <div className="flex flex-col flex-1 p-4 space-y-3">
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={post.category === "Lost" ? "lost" : "found"}
                    >
                      {post.category}
                    </Badge>
                    <Badge
                      variant={
                        post.status === "Resolved" ? "resolved" : "active"
                      }
                    >
                      {post.status === "Resolved" ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Resolved
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" /> Active
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3
                    className="font-bold text-[15px] leading-snug"
                    style={{ color: "var(--brand-struct)" }}
                  >
                    {post.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-xs leading-relaxed line-clamp-3 whitespace-pre-line flex-1"
                    style={{ color: "var(--brand-struct)", opacity: 0.65 }}
                  >
                    {post.description}
                  </p>

                  {/* Location */}
                  {post.location && (
                    <div
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--brand-struct) 6%, transparent)",
                        color: "var(--brand-struct)",
                      }}
                    >
                      <MapPin className="h-3 w-3 text-teal-500 shrink-0" />
                      <span className="truncate">{post.location}</span>
                    </div>
                  )}

                  {/* Footer row */}
                  <div
                    className="flex items-center justify-between pt-3 border-t text-xs"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--brand-struct) 8%, transparent)",
                    }}
                  >
                    <div
                      className="flex items-center gap-1.5"
                      style={{ color: "var(--brand-struct)", opacity: 0.5 }}
                    >
                      <UserIcon className="h-3.5 w-3.5" />
                      <span>{post.user?.firstName || "Student"}</span>
                    </div>
                    <button
                      onClick={() =>
                        setExpandedPostId(isExpanded ? null : post._id)
                      }
                      className="flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {post.comments?.length || 0} Responses
                    </button>
                  </div>

                  {/* Owner controls */}
                  {isOwner && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        onClick={() =>
                          handleToggleStatus(post._id, post.status)
                        }
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Mark as{" "}
                        {post.status === "Active" ? "Resolved" : "Active"}
                      </button>
                      <button
                        onClick={() => handleDeletePost(post._id, post.title)}
                        className="p-1 rounded-lg transition-colors cursor-pointer"
                        style={{
                          color:
                            "color-mix(in srgb, var(--brand-struct) 35%, transparent)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#dc2626";
                          e.currentTarget.style.backgroundColor =
                            "rgba(220,38,38,0.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color =
                            "color-mix(in srgb, var(--brand-struct) 35%, transparent)";
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Comments drawer */}
                  {isExpanded && (
                    <div
                      className="rounded-xl border p-3.5 space-y-3 mt-1"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--brand-struct) 4%, var(--brand-bg))",
                        borderColor:
                          "color-mix(in srgb, var(--brand-struct) 10%, transparent)",
                      }}
                    >
                      <h4
                        className="text-[11px] font-bold uppercase tracking-widest"
                        style={{ color: "var(--brand-struct)", opacity: 0.45 }}
                      >
                        Responses
                      </h4>

                      {post.comments?.length > 0 ? (
                        <div className="space-y-2">
                          {post.comments.map((c) => {
                            const isCommentOwner =
                              user &&
                              (c.createdBy?.clerkId === user.id ||
                                post.user?.clerkId === user.id);
                            return (
                              <div
                                key={c._id}
                                className="group rounded-lg border p-2.5 text-xs flex items-start justify-between gap-2"
                                style={{
                                  backgroundColor: "var(--brand-bg)",
                                  borderColor:
                                    "color-mix(in srgb, var(--brand-struct) 10%, transparent)",
                                }}
                              >
                                <div>
                                  <span
                                    className="font-bold text-[11px]"
                                    style={{ color: "var(--brand-struct)" }}
                                  >
                                    {c.createdBy?.firstName || "Student"}
                                  </span>
                                  <p
                                    className="mt-0.5 leading-relaxed"
                                    style={{
                                      color: "var(--brand-struct)",
                                      opacity: 0.7,
                                    }}
                                  >
                                    {c.text}
                                  </p>
                                </div>
                                {isCommentOwner && (
                                  <button
                                    onClick={() =>
                                      handleDeleteComment(post._id, c._id)
                                    }
                                    className="opacity-0 group-hover:opacity-100 p-1 cursor-pointer shrink-0 text-gray-400 hover:text-red-600 transition-all"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p
                          className="text-xs italic"
                          style={{ color: "var(--brand-struct)", opacity: 0.4 }}
                        >
                          No responses yet. Write a comment to coordinate.
                        </p>
                      )}

                      {isSignedIn && (
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Write a response..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              !e.shiftKey &&
                              handleAddComment(post._id)
                            }
                            className="flex-1 rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                            style={{
                              backgroundColor: "var(--brand-bg)",
                              borderColor:
                                "color-mix(in srgb, var(--brand-struct) 15%, transparent)",
                              color: "var(--brand-struct)",
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(post._id)}
                            disabled={commentSubmitting || !commentText.trim()}
                            className="inline-flex items-center justify-center rounded-lg bg-teal-600 hover:bg-teal-700 px-3 py-1.5 text-white disabled:opacity-50 cursor-pointer transition-colors"
                          >
                            {commentSubmitting ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Send className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border shadow-2xl max-h-[92vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--brand-bg)",
              borderColor:
                "color-mix(in srgb, var(--brand-struct) 12%, transparent)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--brand-struct) 10%, transparent)",
              }}
            >
              <h2
                className="text-base font-extrabold tracking-tight"
                style={{ color: "var(--brand-struct)" }}
              >
                Report Lost or Found Item
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg cursor-pointer transition-colors"
                style={{
                  color:
                    "color-mix(in srgb, var(--brand-struct) 40%, transparent)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "color-mix(in srgb, var(--brand-struct) 8%, transparent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="px-6 py-5 space-y-5">
              {/* Category selector */}
              <div className="space-y-2">
                <label
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--brand-struct)", opacity: 0.55 }}
                >
                  Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Lost", "Found"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className="py-2.5 text-xs font-bold rounded-xl border-2 text-center cursor-pointer transition-all"
                      style={
                        category === cat
                          ? cat === "Lost"
                            ? {
                                backgroundColor: "rgba(225,29,72,0.08)",
                                borderColor: "#e11d48",
                                color: "#e11d48",
                              }
                            : {
                                backgroundColor: "rgba(5,150,105,0.08)",
                                borderColor: "#059669",
                                color: "#059669",
                              }
                          : {
                              backgroundColor: "transparent",
                              borderColor:
                                "color-mix(in srgb, var(--brand-struct) 15%, transparent)",
                              color:
                                "color-mix(in srgb, var(--brand-struct) 55%, transparent)",
                            }
                      }
                    >
                      {cat === "Lost"
                        ? "I Lost Something"
                        : "I Found Something"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shared field component */}
              {[
                {
                  label: "Item Title",
                  id: "title",
                  placeholder: "e.g. Black HP Laptop Charger",
                  value: title,
                  onChange: setTitle,
                  required: true,
                  type: "input",
                },
                {
                  label: "Description & Contact Info",
                  id: "desc",
                  placeholder:
                    "Describe the item — color, brand, specific features...",
                  value: description,
                  onChange: setDescription,
                  required: true,
                  type: "textarea",
                },
                {
                  label: "Campus Location (Optional)",
                  id: "loc",
                  placeholder: "e.g. CS Department Room 102 / Library Hall",
                  value: location,
                  onChange: setLocation,
                  required: false,
                  type: "input",
                },
              ].map((f) => (
                <div key={f.id} className="space-y-1.5">
                  <label
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--brand-struct)", opacity: 0.55 }}
                  >
                    {f.label}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      required={f.required}
                      placeholder={f.placeholder}
                      value={f.value}
                      onChange={(e) => f.onChange(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--brand-struct) 4%, var(--brand-bg))",
                        borderColor:
                          "color-mix(in srgb, var(--brand-struct) 14%, transparent)",
                        color: "var(--brand-struct)",
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      required={f.required}
                      placeholder={f.placeholder}
                      value={f.value}
                      onChange={(e) => f.onChange(e.target.value)}
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--brand-struct) 4%, var(--brand-bg))",
                        borderColor:
                          "color-mix(in srgb, var(--brand-struct) 14%, transparent)",
                        color: "var(--brand-struct)",
                      }}
                    />
                  )}
                </div>
              ))}

              {/* Image upload */}
              <div className="space-y-1.5">
                <label
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--brand-struct)", opacity: 0.55 }}
                >
                  Photo (Optional)
                </label>
                {uploadedImageUrl ? (
                  <div
                    className="flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold"
                    style={{
                      backgroundColor: "rgba(5,150,105,0.07)",
                      borderColor: "rgba(5,150,105,0.3)",
                      color: "#059669",
                    }}
                  >
                    <span>Photo attached successfully</span>
                    <button
                      type="button"
                      onClick={() => setUploadedImageUrl("")}
                      className="underline text-red-500 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    className="rounded-xl border-2 border-dashed p-4 text-center"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--brand-struct) 12%, transparent)",
                    }}
                  >
                    <UploadButton
                      endpoint="noteUploader"
                      onClientUploadComplete={(res) => {
                        if (res?.[0]) setUploadedImageUrl(res[0].url);
                      }}
                      onUploadError={(error) =>
                        alert(`Upload error: ${error.message}`)
                      }
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div
                className="flex items-center justify-end gap-3 pt-2 border-t"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--brand-struct) 8%, transparent)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--brand-struct) 15%, transparent)",
                    color: "var(--brand-struct)",
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
                  disabled={submitting}
                  className="rounded-xl bg-teal-600 hover:bg-teal-700 px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50 cursor-pointer active:scale-95 transition-all shadow-sm"
                >
                  {submitting ? "Publishing..." : "Publish Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
