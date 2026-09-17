/**
 * Builds a display-safe user object with full name and avatar for public API responses.
 */
export function formatPublicUser(userDoc) {
  if (!userDoc) return null;

  const u = userDoc.toObject ? userDoc.toObject() : userDoc;
  if (!u || typeof u !== "object") return null;

  const firstName = (u.firstName || "").trim();
  const lastName = (u.lastName || "").trim();
  const name =
    [firstName, lastName].filter(Boolean).join(" ") ||
    (u.email ? u.email.split("@")[0] : "") ||
    "Student";

  return {
    name,
    imageUrl: u.imageUrl || "",
  };
}

/**
 * Strips author identity from confessions/comments when marked anonymous.
 * Never expose user ObjectIds in public API responses for anonymous posts.
 */
export function sanitizeConfession(confession, currentUserId = null) {
  const obj = confession.toObject ? confession.toObject() : { ...confession };

  const ownerId = obj.user?._id?.toString() || obj.user?.toString();
  obj.isOwner = currentUserId ? ownerId === currentUserId.toString() : false;

  if (obj.isAnonymous) {
    obj.user = null;
  } else {
    obj.user = formatPublicUser(obj.user);
  }

  obj.likeCount = obj.likes?.length || 0;
  obj.likedByMe = currentUserId
    ? (obj.likes || []).some((id) => id.toString() === currentUserId.toString())
    : false;
  delete obj.likes;

  if (obj.comments) {
    obj.comments = obj.comments.map((comment) => {
      const c = comment.toObject ? comment.toObject() : { ...comment };
      const commentAuthorId =
        c.createdBy?._id?.toString() || c.createdBy?.toString();
      c.isCommentOwner = currentUserId
        ? commentAuthorId === currentUserId.toString()
        : false;

      if (c.isAnonymous) {
        c.createdBy = null;
      } else {
        c.createdBy = formatPublicUser(c.createdBy);
      }

      return c;
    });
  }

  return obj;
}
