"use client";

import {
  Heart,
  MessageCircle,
  Trash2,
  Ghost,
  Send,
  EyeOff,
} from "lucide-react";

const DEFAULT_AVATAR = "/images/default-avatar.png";

export function AuthorDisplay({ isAnonymous, user }) {
  if (isAnonymous) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
          <Ghost className="h-4 w-4" />
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-800">Anonymous Student</span>
          <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">
            Anonymous
          </span>
        </div>
      </div>
    );
  }

  const displayName = user?.name || "Student";
  const avatarSrc = user?.imageUrl || DEFAULT_AVATAR;

  return (
    <div className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarSrc}
        alt={displayName}
        className="h-8 w-8 rounded-full object-cover bg-gray-100"
        onError={(e) => {
          e.currentTarget.src = DEFAULT_AVATAR;
        }}
      />
      <span className="text-sm font-semibold text-gray-800">{displayName}</span>
    </div>
  );
}

function CommentAuthor({ isAnonymous, author }) {
  if (isAnonymous) {
    return (
      <div className="flex items-center gap-1.5 mb-1">
        <Ghost className="h-3 w-3 text-purple-500" />
        <span className="font-bold text-gray-800">Anonymous Student</span>
      </div>
    );
  }

  return (
    <div className="font-bold text-gray-800 mb-0.5">{author?.name || "Student"}</div>
  );
}

export default function ConfessionCard({
  confession,
  isExpanded,
  isSignedIn,
  isOwner,
  likingId,
  commentText,
  commentAnonymous,
  commentSubmitting,
  onToggleExpand,
  onLike,
  onDelete,
  onCommentTextChange,
  onCommentAnonymousChange,
  onAddComment,
  onDeleteComment,
}) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <AuthorDisplay isAnonymous={confession.isAnonymous} user={confession.user} />
        {isOwner && (
          <button
            onClick={() => onDelete(confession._id)}
            title="Delete confession"
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-800 whitespace-pre-line flex-1 leading-relaxed">
        {confession.content}
      </p>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onLike(confession._id)}
            disabled={!isSignedIn || likingId === confession._id}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
              confession.likedByMe
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
            }`}
          >
            <Heart
              className={`h-3.5 w-3.5 ${confession.likedByMe ? "fill-current" : ""}`}
            />
            {confession.likeCount || 0}
          </button>

          <button
            onClick={() => onToggleExpand(confession._id)}
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors cursor-pointer"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {confession.comments?.length || 0} Advice
          </button>
        </div>

        <span className="text-[10px] text-gray-400">
          {new Date(confession.createdAt).toLocaleDateString()}
        </span>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Community Advice
          </h4>

          {confession.comments?.length > 0 ? (
            <div className="space-y-2">
              {confession.comments.map((c) => {
                const canDelete = isSignedIn && (c.isCommentOwner || isOwner);

                return (
                  <div
                    key={c._id}
                    className="group rounded-md bg-white p-3 text-xs border border-gray-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CommentAuthor isAnonymous={c.isAnonymous} author={c.createdBy} />
                        <p className="text-gray-700">{c.text}</p>
                      </div>
                      {canDelete && (
                        <button
                          onClick={() => onDeleteComment(confession._id, c._id)}
                          title="Delete reply"
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">
              No advice yet. Share something supportive!
            </p>
          )}

          {isSignedIn && (
            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Give advice or support..."
                  value={commentText}
                  onChange={(e) => onCommentTextChange(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-purple-500 focus:outline-none bg-white"
                />
                <button
                  onClick={() => onAddComment(confession._id)}
                  disabled={commentSubmitting || !commentText.trim()}
                  className="inline-flex items-center gap-1 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-3 w-3" /> Send
                </button>
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={commentAnonymous}
                  onChange={(e) => onCommentAnonymousChange(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <EyeOff className="h-3 w-3" />
                Reply anonymously
              </label>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
