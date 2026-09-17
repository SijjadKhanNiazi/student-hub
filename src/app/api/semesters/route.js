import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/lib/models/Subject";

export async function GET() {
  try {
    await dbConnect();

    // Aggregate count of subjects per semester
    const subjectCounts = await Subject.aggregate([
      { $group: { _id: "$semester", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    subjectCounts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    const semesters = Array.from({ length: 8 }, (_, i) => {
      const num = i + 1;
      return {
        id: num,
        number: num,
        name: `Semester ${num}`,
        subjectCount: countMap[num] || 0,
      };
    });

    return NextResponse.json({ semesters });
  } catch (error) {
    console.error("GET /api/semesters error:", error);
    return NextResponse.json({ error: "Failed to fetch semesters" }, { status: 500 });
  }
}
