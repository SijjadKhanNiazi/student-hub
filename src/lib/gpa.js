/**
 * University 4.00 Scale Grading Utility
 * Precise percentage-to-grade point mapping & calculation logic.
 */

// Precise percentage to GPA lookup array (University / HEC Standard 4.00 Scale)
export const PERCENTAGE_GPA_TABLE = [
  { min: 85, max: 100, gpa: 4.00, letter: "A" },
  { min: 84, max: 84.99, gpa: 3.94, letter: "A" },
  { min: 83, max: 83.99, gpa: 3.87, letter: "A" },
  { min: 82, max: 82.99, gpa: 3.80, letter: "A-" },
  { min: 81, max: 81.99, gpa: 3.74, letter: "A-" },
  { min: 80, max: 80.99, gpa: 3.67, letter: "A-" },
  { min: 79, max: 79.99, gpa: 3.60, letter: "B+" },
  { min: 78, max: 78.99, gpa: 3.54, letter: "B+" },
  { min: 77, max: 77.99, gpa: 3.47, letter: "B+" },
  { min: 76, max: 76.99, gpa: 3.40, letter: "B+" },
  { min: 75, max: 75.99, gpa: 3.34, letter: "B+" },
  { min: 74, max: 74.99, gpa: 3.27, letter: "B" },
  { min: 73, max: 73.99, gpa: 3.20, letter: "B" },
  { min: 72, max: 72.99, gpa: 3.14, letter: "B" },
  { min: 71, max: 71.99, gpa: 3.07, letter: "B" },
  { min: 70, max: 70.99, gpa: 3.00, letter: "B" },
  { min: 69, max: 69.99, gpa: 2.94, letter: "B-" },
  { min: 68, max: 68.99, gpa: 2.87, letter: "B-" },
  { min: 67, max: 67.99, gpa: 2.80, letter: "B-" },
  { min: 66, max: 66.99, gpa: 2.74, letter: "B-" },
  { min: 65, max: 65.99, gpa: 2.67, letter: "B-" },
  { min: 64, max: 64.99, gpa: 2.60, letter: "C+" },
  { min: 63, max: 63.99, gpa: 2.54, letter: "C+" },
  { min: 62, max: 62.99, gpa: 2.47, letter: "C+" },
  { min: 61, max: 61.99, gpa: 2.40, letter: "C+" },
  { min: 60, max: 60.99, gpa: 2.34, letter: "C+" },
  { min: 59, max: 59.99, gpa: 2.27, letter: "C" },
  { min: 58, max: 58.99, gpa: 2.20, letter: "C" },
  { min: 57, max: 57.99, gpa: 2.14, letter: "C" },
  { min: 56, max: 56.99, gpa: 2.07, letter: "C" },
  { min: 55, max: 55.99, gpa: 2.00, letter: "C" },
  { min: 54, max: 54.99, gpa: 1.94, letter: "C-" },
  { min: 53, max: 53.99, gpa: 1.87, letter: "C-" },
  { min: 52, max: 52.99, gpa: 1.80, letter: "C-" },
  { min: 51, max: 51.99, gpa: 1.74, letter: "C-" },
  { min: 50, max: 50.99, gpa: 1.67, letter: "D" },
  { min: 0, max: 49.99, gpa: 0.00, letter: "F" },
];

/**
 * Given a percentage value (0 - 100), returns corresponding grade point & letter grade.
 */
export function getGradePointFromMarks(marks) {
  const num = parseFloat(marks);
  if (isNaN(num)) return { gpa: 0, letter: "-" };
  if (num >= 85) return { gpa: 4.00, letter: "A" };
  if (num < 50) return { gpa: 0.00, letter: "F" };

  const match = PERCENTAGE_GPA_TABLE.find((row) => num >= row.min && num <= row.max);
  if (match) return { gpa: match.gpa, letter: match.letter };

  return { gpa: 0.00, letter: "F" };
}

/**
 * Computes Semester GPA or Cumulative CGPA
 * Formula: Sum(Grade Point * Credit Hours) / Sum(Credit Hours)
 */
export function calculateGpa(courses) {
  let totalQualityPoints = 0;
  let totalCreditHours = 0;

  courses.forEach((course) => {
    const credits = parseFloat(course.creditHours) || 0;
    const gpa = parseFloat(course.gradePoint) || 0;

    // Ignore non-credit or invalid courses
    if (credits > 0 && !course.isNonCredit) {
      totalQualityPoints += gpa * credits;
      totalCreditHours += credits;
    }
  });

  const finalGpa = totalCreditHours > 0 ? totalQualityPoints / totalCreditHours : 0;

  return {
    totalQualityPoints: totalQualityPoints.toFixed(2),
    totalCreditHours,
    gpa: finalGpa.toFixed(2),
  };
}

/**
 * Calculates Cumulative CGPA combining previous CGPA/credits with current semester.
 */
export function calculateCgpa(prevCgpa, prevCredits, currentGpa, currentCredits) {
  const pCgpa = parseFloat(prevCgpa) || 0;
  const pCreds = parseFloat(prevCredits) || 0;
  const cGpa = parseFloat(currentGpa) || 0;
  const cCreds = parseFloat(currentCredits) || 0;

  const totalPoints = pCgpa * pCreds + cGpa * cCreds;
  const totalCreds = pCreds + cCreds;

  const cumulativeCgpa = totalCreds > 0 ? totalPoints / totalCreds : 0;

  return {
    totalPoints: totalPoints.toFixed(2),
    totalCredits: totalCreds,
    cgpa: cumulativeCgpa.toFixed(2),
  };
}
