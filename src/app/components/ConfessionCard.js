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
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 shadow-xs">
          <Ghost className="h-5 w-5" />
        </div>
        <div>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100 font-satoshi block">
            Anonymous Student
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            Posted anonymously
          </span>
        </div>
      </div>
    );
  }

  const displayName = user?.name || "Student";
  const avatarSrc = user?.imageUrl || DEFAULT_AVATAR;

  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarSrc}
        alt={displayName}
        className="h-10 w-10 rounded-full object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs"
        onError={(e) => {
          e.currentTarget.src = DEFAULT_AVATAR;
        }}
      />
      <div>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 font-satoshi block">
          {displayName}
        </span>
        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
          Campus Student
        </span>
      </div>
    </div>
  );
}

function CommentAuthor({ isAnonymous, author }) {
  if (isAnonymous) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <Ghost className="h-3 w-3 text-purple-500" />
        <span className="font-bold text-gray-900 dark:text-gray-100 font-satoshi">
          Anonymous Student
        </span>
      </div>
    );
  }

  const avatarSrc = author?.imageUrl || DEFAULT_AVATAR;
  const displayName = author?.name || author?.firstName || "User";

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarSrc}
        alt={displayName}
        className="h-5 w-5 rounded-full object-cover border border-gray-200 dark:border-gray-700"
        onError={(e) => {
          e.currentTarget.src = DEFAULT_AVATAR;
        }}
      />
      <span className="font-bold text-gray-900 dark:text-gray-100 font-satoshi">
        {displayName}
      </span>
    </div>
  );
}


export default function ConfessionCard({
  confession,
  isExpanded,
  isSignedIn,
  isOwner,
  isAdmin,
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
    <article className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3 flex items-start justify-between gap-3">
        <AuthorDisplay
          isAnonymous={confession.isAnonymous}
          user={confession.user}
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {new Date(confession.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
          {(isOwner || isAdmin) && (
            <button
              onClick={() => onDelete(confession._id)}
              title="Delete confession"
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="px-4 py-1">
        <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 whitespace-pre-line leading-relaxed font-satoshi">
          {confession.content}
        </p>
      </div>

      {/* Stats Bar */}
      <div className="px-4 py-2.5 mx-4 my-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <div>
          {confession.likeCount > 0 && (
            <span className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 px-2.5 py-0.5 rounded-full font-semibold border border-red-100 dark:border-red-900/50">
              ❤️ {confession.likeCount}
            </span>
          )}
        </div>
        <div>
          <button
            onClick={() => onToggleExpand(confession._id)}
            className="hover:underline cursor-pointer font-medium"
          >
            {confession.comments?.length || 0} advices
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1 grid grid-cols-2 gap-1 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/60">
        <button
          onClick={() => onLike(confession._id)}
          disabled={!isSignedIn || likingId === confession._id}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${
            confession.likedByMe
              ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Heart
            className={`h-4 w-4 ${confession.likedByMe ? "fill-current" : ""}`}
          />
          Like
        </button>

        <button
          onClick={() => onToggleExpand(confession._id)}
          className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
        >
          <MessageCircle className="h-4 w-4" />
          Give Advice
        </button>
      </div>

      {/* Comments Section */}
      {isExpanded && (
        <div className="bg-gray-50/90 dark:bg-gray-950/50 p-4 space-y-3.5 border-t border-gray-100 dark:border-gray-800">
          {confession.comments?.length > 0 ? (
            <div className="space-y-3">
              {confession.comments.map((c) => {
                const canDelete = isSignedIn && (c.isCommentOwner || isOwner);

                return (
                  <div
                    key={c._1 ?? c._id}
                    className="group flex items-start gap-2.5"
                  >
                    <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 text-gray-700 dark:text-gray-300">
                      {c.isAnonymous ? "👻" : c.createdBy?.name?.[0] || "S"}
                    </div>
                    <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl px-3.5 py-2.5 border border-gray-200 dark:border-gray-800 shadow-2xs relative">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <CommentAuthor
                          isAnonymous={c.isAnonymous}
                          author={c.createdBy}
                        />
                        {canDelete && (
                          <button
                            onClick={() =>
                              onDeleteComment(confession._id, c._id)
                            }
                            title="Delete reply"
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                        {c.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center py-2">
              No advice yet. Be the first to share your support!
            </p>
          )}

          {/* Comment Input Box */}
          {isSignedIn && (
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    placeholder="Write a supportive advice..."
                    value={commentText}
                    onChange={(e) => onCommentTextChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !commentSubmitting &&
                        commentText.trim()
                      ) {
                        onAddComment(confession._id);
                      }
                    }}
                    className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-xs focus:border-purple-500 focus:outline-none text-gray-900 dark:text-gray-100 shadow-2xs pr-10"
                  />
                  <button
                    onClick={() => onAddComment(confession._id)}
                    disabled={commentSubmitting || !commentText.trim()}
                    className="absolute right-1.5 p-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-30 cursor-pointer transition-all"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                <label className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400 cursor-pointer select-none font-medium">
                  <input
                    type="checkbox"
                    checked={commentAnonymous}
                    onChange={(e) => onCommentAnonymousChange(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5 cursor-pointer"
                  />
                  <EyeOff className="h-3 w-3 text-purple-500" />
                  Reply anonymously
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
