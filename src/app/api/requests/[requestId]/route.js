import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Request from "@/lib/models/Request";
import { getOrCreateUser } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { requestId } = await params;
    await dbConnect();

    const reqDoc = await Request.findById(requestId)
      .populate("createdBy", "firstName lastName imageUrl clerkId")
      .populate("comments.createdBy", "firstName lastName imageUrl clerkId");

    if (!reqDoc) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ request: reqDoc });
  } catch (error) {
    console.error("GET /api/requests/[requestId] error:", error);
    return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await params;
    const { status } = await request.json();

    if (!["open", "fulfilled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    await dbConnect();

    const reqDoc = await Request.findById(requestId);
    if (!reqDoc) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Ownership check for updating status
    if (reqDoc.createdBy.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only the request creator can update status" }, { status: 403 });
    }

    reqDoc.status = status;
    await reqDoc.save();

    return NextResponse.json({ request: reqDoc });
  } catch (error) {
    console.error("PATCH /api/requests/[requestId] error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await params;
    await dbConnect();

    const reqDoc = await Request.findById(requestId);
    if (!reqDoc) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Strict ownership check
    if (reqDoc.createdBy.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only the request creator can delete this request" }, { status: 403 });
    }

    await Request.findByIdAndDelete(requestId);

    return NextResponse.json({ success: true, message: "Request deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/requests/[requestId] error:", error);
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 });
  }
}
