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
import {
  getGradePointFromMarks,
  calculateGpa,
  calculateCgpa,
  PERCENTAGE_GPA_TABLE,
} from "@/lib/gpa";

const DEFAULT_COURSES = [
  {
    id: 1,
    name: "Programming Fundamentals",
    marks: "85",
    creditHours: "4",
    isNonCredit: false,
  },
  {
    id: 2,
    name: "Calculus & Analytical Geometry",
    marks: "78",
    creditHours: "3",
    isNonCredit: false,
  },
  {
    id: 3,
    name: "English Composition",
    marks: "82",
    creditHours: "3",
    isNonCredit: false,
  },
  {
    id: 4,
    name: "Applied Physics",
    marks: "72",
    creditHours: "3",
    isNonCredit: false,
  },
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
      courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const resetAll = () => {
    setCourses(DEFAULT_COURSES);
    setPrevCgpa("");
    setPrevCredits("");
  };

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

  const semesterResult = calculateGpa(processedCourses);

  const cumulativeResult = calculateCgpa(
    prevCgpa,
    prevCredits,
    semesterResult.gpa,
    semesterResult.totalCreditHours,
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-gradient-to-r from-[var(--brand-struct)] to-gray-800 p-8 text-white shadow-xl card-glow animate-gradient">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide text-accent">
            <Calculator className="h-4 w-4 text-accent" /> 4.00 Grading Scale
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-satoshi">
            University CGPA Calculator
          </h1>
          <p className="text-sm text-gray-300 max-w-xl">
            Effortlessly calculate your semester SGPA and cumulative CGPA with
            precise grade mapping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTableModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-semibold backdrop-blur-md transition-all border border-white/10 cursor-pointer"
          >
            <Info className="h-4 w-4" /> Grading Scale
          </button>
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-semibold backdrop-blur-md transition-all border border-white/10 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      {/* Grid: Course Input Table + Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Course Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-gray-200/60 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-6 sm:p-8 shadow-lg backdrop-blur-sm space-y-6 card-glow">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold flex items-center gap-2.5 font-satoshi">
                <BookOpen className="h-5 w-5 text-accent" />
                Current Semester Courses
              </h2>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {courses.length} {courses.length === 1 ? "Course" : "Courses"}
              </span>
            </div>

            {/* Courses Rows */}
            <div className="space-y-3">
              <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-xs font-semibold uppercase tracking-wider text-gray-400 px-2">
                <div className="col-span-4">Course Name</div>
                <div className="col-span-3">Marks % (0-100)</div>
                <div className="col-span-2">Credit Hours</div>
                <div className="col-span-2">GPA / Grade</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {processedCourses.map((c, index) => (
                <div
                  key={c.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 p-4 transition-all hover:border-[var(--brand-accent)]/50"
                >
                  <div className="sm:col-span-4">
                    <label className="block sm:hidden text-xs font-semibold text-gray-400 mb-1">
                      Course #{index + 1}
                    </label>
                    <input
                      type="text"
                      placeholder={`Course ${index + 1}`}
                      value={c.name}
                      onChange={(e) =>
                        updateCourse(c.id, "name", e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block sm:hidden text-xs font-semibold text-gray-400 mb-1">
                      Marks %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g. 85"
                      value={c.marks}
                      onChange={(e) =>
                        updateCourse(c.id, "marks", e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block sm:hidden text-xs font-semibold text-gray-400 mb-1">
                      Credit Hours
                    </label>
                    <select
                      value={c.creditHours}
                      onChange={(e) =>
                        updateCourse(c.id, "creditHours", e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-accent focus:outline-none transition-colors cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6].map((ch) => (
                        <option key={ch} value={ch}>
                          {ch} CH
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-start gap-2">
                    <label className="block sm:hidden text-xs font-semibold text-gray-400">
                      GPA:
                    </label>
                    <span className="inline-flex items-center gap-1.5 font-bold text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 shadow-xs">
                      <span className="text-accent">
                        {c.gradePoint.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({c.letterGrade})
                      </span>
                    </span>
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      onClick={() => removeCourse(c.id)}
                      disabled={courses.length === 1}
                      title="Remove course"
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={addCourse}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-2.5 text-sm font-semibold hover:border-accent transition-all shadow-xs cursor-pointer group"
              >
                <Plus className="h-4 w-4 text-accent transition-transform group-hover:scale-110" />{" "}
                Add Course
              </button>
            </div>
          </div>

          {/* Cumulative Section */}
          <div className="rounded-3xl border border-gray-200/60 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-6 sm:p-8 shadow-lg backdrop-blur-sm space-y-4 card-glow">
            <h3 className="text-base font-bold flex items-center gap-2.5 font-satoshi">
              <Award className="h-5 w-5 text-accent" />
              Combine with Previous Semesters (Optional)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enter your previous cumulative CGPA and total earned credit hours
              to calculate your overall combined score.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Previous CGPA
                </label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.01"
                  placeholder="e.g. 3.45"
                  value={prevCgpa}
                  onChange={(e) => setPrevCgpa(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Previous Total Credit Hours
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 45"
                  value={prevCredits}
                  onChange={(e) => setPrevCredits(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Summary Cards */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200/60 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-6 sm:p-8 shadow-lg text-center space-y-4 card-glow backdrop-blur-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-accent font-satoshi">
              Semester GPA (SGPA)
            </h3>

            <div className="my-2">
              <span className="text-6xl font-extrabold tracking-tight font-satoshi text-[var(--brand-struct)] dark:text-white">
                {semesterResult.gpa}
              </span>
              <span className="text-sm text-gray-400 font-medium"> / 4.00</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
              <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="block text-gray-400 font-medium mb-0.5">
                  Total Credit Hours
                </span>
                <span className="font-bold text-sm">
                  {semesterResult.totalCreditHours} CH
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="block text-gray-400 font-medium mb-0.5">
                  Quality Points
                </span>
                <span className="font-bold text-sm">
                  {semesterResult.totalQualityPoints}
                </span>
              </div>
            </div>
          </div>

          {prevCgpa && prevCredits && (
            <div className="rounded-3xl border border-gray-200/60 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-6 sm:p-8 shadow-lg text-center space-y-4 card-glow backdrop-blur-sm animate-float">
              <h3 className="text-xs font-bold uppercase tracking-widest text-accent font-satoshi">
                Cumulative CGPA (Overall)
              </h3>

              <div className="my-2">
                <span className="text-6xl font-extrabold tracking-tight font-satoshi text-[var(--brand-struct)] dark:text-white">
                  {cumulativeResult.cgpa}
                </span>
                <span className="text-sm text-gray-400 font-medium">
                  {" "}
                  / 4.00
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
                <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="block text-gray-400 font-medium mb-0.5">
                    Combined Credits
                  </span>
                  <span className="font-bold text-sm">
                    {cumulativeResult.totalCredits} CH
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="block text-gray-400 font-medium mb-0.5">
                    Combined Points
                  </span>
                  <span className="font-bold text-sm">
                    {cumulativeResult.totalPoints}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-gray-200/60 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-6 shadow-lg space-y-3 backdrop-blur-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider font-satoshi text-gray-500">
              Formula Breakdown
            </h4>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 font-mono bg-gray-50 dark:bg-gray-900/80 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                SGPA Calculation:
              </p>
              <p className="text-accent">Quality Points ÷ Total Credits</p>
              <p className="text-gray-400 pt-1">
                = {semesterResult.totalQualityPoints} ÷{" "}
                {semesterResult.totalCreditHours || 1}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grading Scale Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-lg font-bold font-satoshi">
                Official Grading Scale (4.00 System)
              </h3>
              <button
                onClick={() => setShowTableModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              <div className="grid grid-cols-3 font-bold uppercase tracking-wider text-gray-400 py-2">
                <span>Marks % Range</span>
                <span>Grade Point</span>
                <span>Letter Grade</span>
              </div>
              {PERCENTAGE_GPA_TABLE.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 px-2 rounded-xl"
                >
                  <span>
                    {row.min}% - {row.max}%
                  </span>
                  <span className="font-semibold text-accent">
                    {row.gpa.toFixed(2)}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {row.letter}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowTableModal(false)}
                className="rounded-xl bg-[var(--brand-struct)] text-white px-5 py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Close Scale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
