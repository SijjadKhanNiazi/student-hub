"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UploadButton } from "@/lib/uploadthing-components";
import {
  Search,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Send,
  Trash2,
  Loader2,
  Tag,
  User as UserIcon,
  ImageIcon,
} from "lucide-react";

export default function LostFoundPage() {
  const { user, isSignedIn } = useUser();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Create Post Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Lost");
  const [location, setLocation] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Active Comment Drawer State
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
      const nextStatus = currentStatus === "Active" ? "Resolved" : "Active";
      const res = await fetch(`/api/lost-found/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId, postTitle) => {
    if (!confirm(`Are you sure you want to delete post "${postTitle}"?`)) return;

    try {
      const res = await fetch(`/api/lost-found/${postId}`, { method: "DELETE" });
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
        setPosts((prev) =>
          prev.map((item) => (item._id === postId ? data.post : item))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`/api/lost-found/${postId}/comments?commentId=${commentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setPosts((prev) =>
          prev.map((item) => (item._id === postId ? data.post : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-700 p-6 text-white shadow-md">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 sm:text-3xl">
            <Search className="h-7 w-7" />
            Campus Lost & Found Portal
          </h1>
          <p className="mt-1 text-sm text-emerald-100 max-w-xl">
            Lost something on campus or found an item? Post details here to quickly reunite lost belongings with their owners.
          </p>
        </div>

        {isSignedIn && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-teal-700 hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" /> Report Item
          </button>
        )}
      </div>

      {/* Category & Status Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3">
        {/* Category Filters */}
        <div className="flex items-center gap-2">
          {["all", "Lost", "Found"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-colors cursor-pointer ${
                filterCategory === cat
                  ? cat === "Lost"
                    ? "bg-rose-600 text-white"
                    : cat === "Found"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat === "all" ? "All Items" : cat === "Lost" ? "🔍 Lost Items" : "✨ Found Items"}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Status:</span>
          {["all", "Active", "Resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer ${
                filterStatus === st
                  ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center bg-white text-gray-500 text-sm">
          No lost or found reports match your filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const isOwner = user && post.user?.clerkId === user.id;
            const isExpanded = expandedPostId === post._id;

            return (
              <div
                key={post._id}
                className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div>
                  {/* Image Preview if available */}
                  {post.imageUrl ? (
                    <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="p-5 space-y-3">
                    {/* Badges Bar */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          post.category === "Lost"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {post.category === "Lost" ? "🔍 Lost" : "✨ Found"}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          post.status === "Resolved"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-blue-100 text-blue-700"
                        }`}
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
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-gray-900 leading-snug">{post.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line">
                      {post.description}
                    </p>

                    {/* Location Badge */}
                    {post.location && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 p-2 rounded-md">
                        <MapPin className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{post.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-5 pt-0 space-y-3">
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5" />
                      <span>{post.user?.firstName || "Student"}</span>
                    </div>

                    <button
                      onClick={() => setExpandedPostId(isExpanded ? null : post._id)}
                      className="flex items-center gap-1 font-semibold text-teal-600 hover:underline cursor-pointer"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{post.comments?.length || 0} Responses</span>
                    </button>
                  </div>

                  {/* Owner Controls */}
                  {isOwner && (
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        onClick={() => handleToggleStatus(post._id, post.status)}
                        className="font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        Mark as {post.status === "Active" ? "Resolved" : "Active"}
                      </button>

                      <button
                        onClick={() => handleDeletePost(post._id, post.title)}
                        title="Delete post"
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Comments Section Drawer */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                        Coordination & Comments
                      </h4>

                      {post.comments && post.comments.length > 0 ? (
                        <div className="space-y-2">
                          {post.comments.map((c) => {
                            const isCommentOwner = user && (c.createdBy?.clerkId === user.id || post.user?.clerkId === user.id);
                            return (
                              <div
                                key={c._id}
                                className="group rounded-md bg-white p-2.5 text-xs border border-gray-200 flex items-start justify-between gap-2"
                              >
                                <div>
                                  <div className="font-bold text-gray-800">
                                    {c.createdBy?.firstName || "Student"}
                                  </div>
                                  <p className="text-gray-700 mt-0.5">{c.text}</p>
                                </div>

                                {isCommentOwner && (
                                  <button
                                    onClick={() => handleDeleteComment(post._id, c._id)}
                                    title="Delete comment"
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 cursor-pointer shrink-0"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">No responses yet. Write a comment to coordinate.</p>
                      )}

                      {isSignedIn && (
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Write a response..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="flex-1 rounded-md border border-gray-300 px-2.5 py-1 text-xs focus:border-teal-500 focus:outline-none bg-white"
                          />
                          <button
                            onClick={() => handleAddComment(post._id)}
                            disabled={commentSubmitting || !commentText.trim()}
                            className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
                          >
                            <Send className="h-3 w-3" />
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

      {/* Create Lost/Found Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900">Report Lost or Found Item</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setCategory("Lost")}
                    className={`py-2 text-xs font-bold rounded-md border text-center cursor-pointer ${
                      category === "Lost"
                        ? "bg-rose-50 border-rose-500 text-rose-700"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    🔍 I Lost Something
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory("Found")}
                    className={`py-2 text-xs font-bold rounded-md border text-center cursor-pointer ${
                      category === "Found"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    ✨ I Found Something
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Black HP Laptop Charger / Blue Wallet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description & Contact Info</label>
                <textarea
                  required
                  placeholder="Describe the item, color, brand, or specific features to identify it..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Campus Location</label>
                <input
                  type="text"
                  placeholder="e.g. CS Department Room 102 / Library Hall"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photo (Optional)</label>
                {uploadedImageUrl ? (
                  <div className="rounded-md bg-green-50 p-3 text-xs text-green-700 border border-green-200 flex items-center justify-between">
                    <span>✔ Photo attached!</span>
                    <button
                      type="button"
                      onClick={() => setUploadedImageUrl("")}
                      className="text-xs text-red-600 underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center">
                    <UploadButton
                      endpoint="noteUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setUploadedImageUrl(res[0].url);
                        }
                      }}
                      onUploadError={(error) => {
                        alert(`Upload error: ${error.message}`);
                      }}
                    />
                  </div>
                )}
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
                  className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Submitting..." : "Publish Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
