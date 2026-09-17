import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Alumni from "@/lib/models/Alumni";
import { getOrCreateUser } from "@/lib/auth";

export async function DELETE(request, { params }) {
  try {
    const currentUser = await getOrCreateUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await params;

    const profile = await Alumni.findById(id);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found." },
        { status: 404 }
      );
    }

    // Verify ownership or admin role
    if (profile.user.toString() !== currentUser._id.toString() && currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden. You can only delete your own profile." },
        { status: 403 }
      );
    }

    await Alumni.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Alumni profile removed successfully.",
    });
  } catch (error) {
    console.error("Error deleting alumni profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
