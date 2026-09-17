"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Calculator,
  RotateCcw,
  BookOpen,
  Award,
  ChevronDown,
  Info,
} from "lucide-react";
import { getGradePointFromMarks, calculateGpa, calculateCgpa, PERCENTAGE_GPA_TABLE } from "@/lib/gpa";

const DEFAULT_COURSES = [
  { id: 1, name: "Programming Fundamentals", marks: "85", creditHours: "4", isNonCredit: false },
  { id: 2, name: "Calculus & Analytical Geometry", marks: "78", creditHours: "3", isNonCredit: false },
  { id: 3, name: "English Composition", marks: "82", creditHours: "3", isNonCredit: false },
  { id: 4, name: "Applied Physics", marks: "72", creditHours: "3", isNonCredit: false },
];

export default function CgpaCalculator() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [prevCgpa, setPrevCgpa] = useState("");
  const [prevCredits, setPrevCredits] = useState("");
  const [showTableModal, setShowTableModal] = useState(false);

  const addCourse = () => {
    setCourses([
      ...courses,
      {
        id: Date.now(),
        name: `Course ${courses.length + 1}`,
        marks: "",
        creditHours: "3",
        isNonCredit: false,
      },
    ]);
  };

  const removeCourse = (id) => {
    if (courses.length === 1) return;
    setCourses(courses.filter((c) => c.id !== id));
  };

  const updateCourse = (id, field, value) => {
    setCourses(
      courses.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const resetAll = () => {
    setCourses(DEFAULT_COURSES);
    setPrevCgpa("");
    setPrevCredits("");
  };

  // Compute calculated values for each course row
  const processedCourses = courses.map((course) => {
    const { gpa, letter } = getGradePointFromMarks(course.marks);
    const credits = parseFloat(course.creditHours) || 0;
    const qualityPoints = (gpa * credits).toFixed(2);
    return {
      ...course,
      gradePoint: gpa,
      letterGrade: letter,
      qualityPoints,
    };
  });

  // Calculate Current Semester GPA
  const semesterResult = calculateGpa(processedCourses);

  // Calculate Cumulative CGPA
  const cumulativeResult = calculateCgpa(
    prevCgpa,
    prevCredits,
    semesterResult.gpa,
    semesterResult.totalCreditHours
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 sm:text-3xl">
            <Calculator className="h-7 w-7" />
            University CGPA Calculator
          </h1>
          <p className="mt-1 text-sm text-blue-100">
            Calculate your semester SGPA and cumulative CGPA based on official 4.00 grading scale.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTableModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
          >
            <Info className="h-4 w-4" /> Grading Scale Table
          </button>
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      {/* Grid: Course Input Table + Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Course Input Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Current Semester Courses
              </h2>
              <span className="text-xs font-medium text-gray-500">
                {courses.length} {courses.length === 1 ? "Course" : "Courses"}
              </span>
            </div>

            {/* Courses Table / Rows */}
            <div className="space-y-3">
              <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-xs font-semibold uppercase tracking-wider text-gray-500 px-2">
                <div className="col-span-4">Course Name (Optional)</div>
                <div className="col-span-3">Marks % (0 - 100)</div>
                <div className="col-span-2">Credit Hours</div>
                <div className="col-span-2">GPA / Grade</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {processedCourses.map((c, index) => (
                <div
                  key={c.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center rounded-lg border border-gray-200 bg-gray-50/50 p-3 hover:border-blue-300 transition-colors"
                >
                  {/* Course Name */}
                  <div className="sm:col-span-4">
                    <label className="block sm:hidden text-xs font-semibold text-gray-500 mb-1">
                      Course #{index + 1}
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. Course ${index + 1}`}
                      value={c.name}
                      onChange={(e) => updateCourse(c.id, "name", e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Marks % */}
                  <div className="sm:col-span-3">
                    <label className="block sm:hidden text-xs font-semibold text-gray-500 mb-1">
                      Marks / Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="Marks %"
                        value={c.marks}
                        onChange={(e) => updateCourse(c.id, "marks", e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Credit Hours */}
                  <div className="sm:col-span-2">
                    <label className="block sm:hidden text-xs font-semibold text-gray-500 mb-1">
                      Credit Hours
                    </label>
                    <select
                      value={c.creditHours}
                      onChange={(e) => updateCourse(c.id, "creditHours", e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((ch) => (
                        <option key={ch} value={ch}>
                          {ch} CH
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mapped Grade Point & Letter */}
                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-start gap-2">
                    <label className="block sm:hidden text-xs font-semibold text-gray-500">GPA:</label>
                    <span className="inline-flex items-center gap-1 font-bold text-sm text-gray-800 bg-white border border-gray-200 rounded px-2 py-1">
                      <span className="text-blue-600">{c.gradePoint.toFixed(2)}</span>
                      <span className="text-xs text-gray-400">({c.letterGrade})</span>
                    </span>
                  </div>

                  {/* Delete Button */}
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      onClick={() => removeCourse(c.id)}
                      disabled={courses.length === 1}
                      title="Remove course"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Course Button */}
            <div className="pt-2">
              <button
                onClick={addCourse}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4 text-blue-600" /> Add Course
              </button>
            </div>
          </div>

          {/* Cumulative CGPA Section (Optional Previous Semesters) */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" />
              Combine with Previous Semesters (Optional)
            </h3>
            <p className="text-xs text-gray-500">
              Enter your previous cumulative CGPA and total earned credit hours to calculate your overall combined CGPA.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Previous CGPA</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.01"
                  placeholder="e.g. 3.45"
                  value={prevCgpa}
                  onChange={(e) => setPrevCgpa(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Previous Total Credit Hours
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 45"
                  value={prevCredits}
                  onChange={(e) => setPrevCredits(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Summary Card & Calculation Details */}
        <div className="space-y-6">
          {/* Main GPA Result Card */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-6 shadow-md text-center space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Semester GPA (SGPA)
            </h3>

            <div className="my-2">
              <span className="text-5xl font-extrabold text-blue-700 tracking-tight">
                {semesterResult.gpa}
              </span>
              <span className="text-sm text-gray-500 font-medium"> / 4.00</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-blue-100 text-xs text-gray-600">
              <div className="bg-white p-2.5 rounded-lg border border-blue-50">
                <span className="block text-gray-400 font-medium">Total Credit Hours</span>
                <span className="font-bold text-gray-900 text-sm">{semesterResult.totalCreditHours} CH</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-50">
                <span className="block text-gray-400 font-medium">Quality Points</span>
                <span className="font-bold text-gray-900 text-sm">{semesterResult.totalQualityPoints}</span>
              </div>
            </div>
          </div>

          {/* Cumulative CGPA Card (If Previous CGPA Entered) */}
          {prevCgpa && prevCredits && (
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-6 shadow-md text-center space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Cumulative CGPA (Overall)
              </h3>

              <div className="my-2">
                <span className="text-5xl font-extrabold text-indigo-700 tracking-tight">
                  {cumulativeResult.cgpa}
                </span>
                <span className="text-sm text-gray-500 font-medium"> / 4.00</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-indigo-100 text-xs text-gray-600">
                <div className="bg-white p-2.5 rounded-lg border border-indigo-50">
                  <span className="block text-gray-400 font-medium">Total Combined Credits</span>
                  <span className="font-bold text-gray-900 text-sm">{cumulativeResult.totalCredits} CH</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-indigo-50">
                  <span className="block text-gray-400 font-medium">Total Combined Points</span>
                  <span className="font-bold text-gray-900 text-sm">{cumulativeResult.totalPoints}</span>
                </div>
              </div>
            </div>
          )}

          {/* Breakdown Box */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Formula & Breakdown</h4>
            <div className="text-xs text-gray-600 space-y-2 font-mono bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-gray-800">SGPA Formula:</p>
              <p className="text-blue-700">SGPA = Total Quality Points ÷ Total Credit Hours</p>
              <p className="pt-1 text-gray-500">
                = {semesterResult.totalQualityPoints} ÷ {semesterResult.totalCreditHours || 1}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grading Scale Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Official Grading Scale (4.00 System)</h3>
              <button
                onClick={() => setShowTableModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              <div className="grid grid-cols-3 font-bold uppercase tracking-wider text-gray-500 py-2">
                <span>Marks % Range</span>
                <span>Grade Point</span>
                <span>Letter Grade</span>
              </div>
              {PERCENTAGE_GPA_TABLE.map((row, i) => (
                <div key={i} className="grid grid-cols-3 py-1.5 text-gray-700 hover:bg-gray-50">
                  <span>{row.min}% - {row.max}%</span>
                  <span className="font-semibold text-blue-600">{row.gpa.toFixed(2)}</span>
                  <span className="font-medium text-gray-900">{row.letter}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowTableModal(false)}
                className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
