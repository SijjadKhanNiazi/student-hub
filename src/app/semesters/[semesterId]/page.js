"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { BookOpen, Plus, ArrowLeft, Loader2 } from "lucide-react";

import Button from "@/app/components/ui/Button";

export default function SemesterSubjectsPage({ params }) {
  const { semesterId } = use(params);
  const { isSignedIn } = useUser();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDesc, setNewSubjectDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/subjects?semester=${semesterId}`);
      const data = await res.json();
      setSubjects(data.subjects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [semesterId]);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    try {
      setSubmitting(true);
      setError("");
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSubjectName,
          semester: semesterId,
          description: newSubjectDesc,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create subject");
      }

      setNewSubjectName("");
      setNewSubjectDesc("");
      setShowAddModal(false);
      fetchSubjects();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Back button & Header */}
      <div>
        <Link
          href="/#semesters"
          className="inline-flex items-center text-sm text-[#2C4A3E] dark:text-[#FCFBF7] hover:text-[#FF6B35] dark:hover:text-[#FF79C6] transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Semesters
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-[#2C4A3E] dark:text-[#FCFBF7] font-satoshi">Semester {semesterId}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Select a subject to view resources or add a new subject to the curriculum.
            </p>
          </div>

          {isSignedIn && (
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add Subject
            </Button>
          )}
        </div>
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#FCFBF7] dark:bg-[#14121F] border border-[#2C4A3E]/10 dark:border-[#231E3D] p-8 shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold text-[#2C4A3E] dark:text-[#FCFBF7] font-satoshi">Add New Subject</h2>
            {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">{error}</p>}
            <form onSubmit={handleCreateSubject} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#2C4A3E] dark:text-[#FCFBF7] mb-2">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-[#231E3D] bg-white dark:bg-[#231E3D] text-[#2C4A3E] dark:text-[#FCFBF7] px-4 py-3 text-sm focus:border-[#FF6B35] dark:focus:border-[#FF79C6] focus:outline-none focus:ring-1 focus:ring-[#FF6B35] dark:focus:ring-[#FF79C6] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2C4A3E] dark:text-[#FCFBF7] mb-2">Description (Optional)</label>
                <textarea
                  placeholder="Brief summary of topics covered"
                  value={newSubjectDesc}
                  onChange={(e) => setNewSubjectDesc(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-[#231E3D] bg-white dark:bg-[#231E3D] text-[#2C4A3E] dark:text-[#FCFBF7] px-4 py-3 text-sm focus:border-[#FF6B35] dark:focus:border-[#FF79C6] focus:outline-none focus:ring-1 focus:ring-[#FF6B35] dark:focus:ring-[#FF79C6] transition-all"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit" className="gap-2 px-6">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Subject
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subjects List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35] dark:text-[#FF79C6]" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-white dark:bg-[#231E3D] rounded-xl p-6 shadow-xl card-glow text-center py-16">
          <div className="mx-auto h-20 w-20 rounded-full bg-[#FF6B35]/10 dark:bg-[#FF79C6]/10 flex items-center justify-center mb-6">
            <BookOpen className="h-10 w-10 text-[#FF6B35] dark:text-[#FF79C6]" />
          </div>
          <h3 className="text-xl font-bold text-[#2C4A3E] dark:text-[#FCFBF7] font-satoshi mb-2">No subjects yet</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Be the first to add a subject for Semester {semesterId} and help build the community resources!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <Link key={sub._id} href={`/semesters/${semesterId}/subjects/${sub._id}`}>
              <div className="bg-white dark:bg-[#231E3D] rounded-xl p-6 shadow-xl card-glow h-full flex flex-col justify-between group cursor-pointer hover:border-[#FF6B35] dark:hover:border-[#FF79C6] border border-transparent transition-all">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-[#2C4A3E]/10 dark:bg-[#FCFBF7]/10 p-3 text-[#2C4A3E] dark:text-[#FCFBF7] group-hover:bg-[#FF6B35] group-hover:text-white dark:group-hover:bg-[#FF79C6] transition-colors">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-[#2C4A3E] dark:text-[#FCFBF7] text-xl font-satoshi group-hover:text-[#FF6B35] dark:group-hover:text-[#FF79C6] transition-colors">
                      {sub.name}
                    </h3>
                  </div>
                  {sub.description && (
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#231E3D] flex items-center justify-between text-sm font-medium">
                  <span className="text-gray-500">By {sub.createdBy?.firstName || "Student"}</span>
                  <span className="text-[#FF6B35] dark:text-[#FF79C6] group-hover:translate-x-1 transition-transform">Browse →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
