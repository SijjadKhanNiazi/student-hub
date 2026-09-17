import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Alumni from "@/lib/models/Alumni";
import User from "@/lib/models/User";
import { getOrCreateUser } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const guidanceArea = searchParams.get("guidanceArea") || "";
    const degree = searchParams.get("degree") || "";

    const filter = {};

    if (guidanceArea) {
      filter.guidanceAreas = guidanceArea;
    }

    if (degree) {
      filter.degree = { $regex: degree, $options: "i" };
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { name: searchRegex },
        { currentRole: searchRegex },
        { company: searchRegex },
        { degree: searchRegex },
        { expertise: searchRegex },
        { bio: searchRegex },
      ];
    }

    const alumniList = await Alumni.find(filter)
      .populate("user", "firstName lastName imageUrl email clerkId")
      .sort({ createdAt: -1 })
      .lean();

    // Check if current user is logged in to return their profile status
    const currentUser = await getOrCreateUser();
    let myProfile = null;
    if (currentUser) {
      myProfile = await Alumni.findOne({ user: currentUser._id }).lean();
    }

    return NextResponse.json({
      success: true,
      alumni: alumniList,
      myProfile,
      currentUserId: currentUser ? currentUser._id.toString() : null,
    });
  } catch (error) {
    console.error("Error fetching alumni:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch alumni directory" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const currentUser = await getOrCreateUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();
    const {
      name,
      degree,
      graduationYear,
      currentRole,
      company,
      linkedInUrl,
      githubUrl,
      email,
      phone,
      expertise,
      guidanceAreas,
      bio,
      isAvailableForMentorship,
    } = body;

    if (!name || !degree || !graduationYear || !currentRole) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, Degree, Graduation Year, and Current Role are required fields.",
        },
        { status: 400 }
      );
    }

    // Process expertise and guidanceAreas arrays if sent as strings or arrays
    const parsedExpertise = Array.isArray(expertise)
      ? expertise
      : (expertise || "").split(",").map((s) => s.trim()).filter(Boolean);

    const parsedGuidanceAreas = Array.isArray(guidanceAreas)
      ? guidanceAreas
      : (guidanceAreas || "").split(",").map((s) => s.trim()).filter(Boolean);

    const profileData = {
      user: currentUser._id,
      name,
      degree,
      graduationYear,
      currentRole,
      company: company || "",
      linkedInUrl: linkedInUrl || "",
      githubUrl: githubUrl || "",
      email: email || currentUser.email || "",
      phone: phone || "",
      expertise: parsedExpertise,
      guidanceAreas: parsedGuidanceAreas,
      bio: bio || "",
      isAvailableForMentorship: isAvailableForMentorship !== false,
    };

    const alumniProfile = await Alumni.findOneAndUpdate(
      { user: currentUser._id },
      profileData,
      { new: true, upsert: true, runValidators: true }
    ).populate("user", "firstName lastName imageUrl email clerkId");

    return NextResponse.json({
      success: true,
      profile: alumniProfile,
      message: "Profile saved successfully!",
    });
  } catch (error) {
    console.error("Error creating/updating alumni profile:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save profile" },
      { status: 500 }
    );
  }
}
