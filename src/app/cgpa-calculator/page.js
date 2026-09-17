import CgpaCalculator from "@/app/components/CgpaCalculator";

export const metadata = {
  title: "CGPA Calculator — Mianwali Students Hub",
  description: "Calculate your Semester GPA (SGPA) and Cumulative CGPA with precision using the university 4.00 grading scale.",
};

export default function CgpaCalculatorPage() {
  return (
    <div className="py-4">
      <CgpaCalculator />
    </div>
  );
}
