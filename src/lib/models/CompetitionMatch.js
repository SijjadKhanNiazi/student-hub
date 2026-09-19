import mongoose from "mongoose";
import "@/lib/models/User";

/**
 * Eagerly import the User model. In serverless routes, Mongoose's model
 * registry is re-populated from scratch on every cold start. Because
 * CompetitionMatch uses `ref: "User"` for player1/player2/winner and
 * populate() is called before `User` is ever imported in that handler,
 * populate would throw MissingSchemaError("User" is not registered).
 * Importing User here guarantees the model is registered any time
 * CompetitionMatch is loaded.
 */

const VoteSchema = new mongoose.Schema(
  {
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: "votedAt", updatedAt: false } },
);

const CompetitionMatchSchema = new mongoose.Schema(
  {
    player1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    player2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    player1Photo: { type: String, default: null },
    player2Photo: { type: String, default: null },
    status: {
      type: String,
      enum: ["Active", "Started", "Completed"],
      default: "Active",
      required: true,
    },
    votes: { type: [VoteSchema], default: [] },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Only one match can ever be "Started" at the same time. This is enforced
// at the database level (not just in application code), so even if two
// requests race each other, MongoDB itself rejects the second insert/update.
CompetitionMatchSchema.index(
  { status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "Started" },
    name: "only_one_started_match",
  },
);

export default mongoose.models.CompetitionMatch ||
  mongoose.model("CompetitionMatch", CompetitionMatchSchema);
