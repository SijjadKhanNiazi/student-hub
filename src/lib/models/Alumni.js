import mongoose from "mongoose";

const AlumniSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    degree: {
      type: String,
      required: true,
      trim: true,
    },
    graduationYear: {
      type: String,
      required: true,
      trim: true,
    },
    currentRole: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      default: "",
      trim: true,
    },
    linkedInUrl: {
      type: String,
      default: "",
      trim: true,
    },
    githubUrl: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    expertise: [
      {
        type: String,
        trim: true,
      },
    ],
    guidanceAreas: [
      {
        type: String,
        trim: true,
      },
    ],
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    isAvailableForMentorship: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Alumni || mongoose.model("Alumni", AlumniSchema);
