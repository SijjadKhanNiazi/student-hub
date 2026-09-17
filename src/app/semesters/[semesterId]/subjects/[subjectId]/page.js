"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { UploadButton } from "@/lib/uploadthing-components";
import {
  Folder,
  FileText,
  ArrowLeft,
  Loader2,
  Download,
  FolderPlus,
  UploadCloud,
  Trash2,
  Plus,
} from "lucide-react";

export default function SubjectDetailPage({ params }) {
  const { semesterId, subjectId } = use(params);
  const { user, isSignedIn } = useUser();

  const [subject, setSubject] = useState(null);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Folder creation state
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderSubmitting, setFolderSubmitting] = useState(false);

  // Note creation state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [uploadedFileData, setUploadedFileData] = useState(null);
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  const fetchSubjectAndFolders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/subjects/${subjectId}`);
      const data = await res.json();
      setSubject(data.subject);
      setFolders(data.folders || []);
      if (data.folders && data.folders.length > 0 && !selectedFolderId) {
        setSelectedFolderId(data.folders[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (folderId) => {
    if (!folderId) return;
    try {
      setLoadingNotes(true);
      const res = await fetch(`/api/notes?folderId=${folderId}`);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    fetchSubjectAndFolders();
  }, [subjectId]);

  useEffect(() => {
    if (selectedFolderId) {
      fetchNotes(selectedFolderId);
    } else {
      setNotes([]);
    }
  }, [selectedFolderId]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      setFolderSubmitting(true);
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName, subjectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create folder");

      setNewFolderName("");
      setShowFolderModal(false);
      setSelectedFolderId(data.folder._id);
      fetchSubjectAndFolders();
    } catch (err) {
      alert(err.message);
    } finally {
      setFolderSubmitting(false);
    }
  };

  const handleDeleteFolder = async (folderId, folderName) => {
    if (
      !confirm(
        `Are you sure you want to delete folder "${folderName}" and all notes inside it?`,
      )
    )
      return;

    try {
      const res = await fetch(`/api/folders/${folderId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete folder");

      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
      fetchSubjectAndFolders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !uploadedFileData || !selectedFolderId) return;

    try {
      setNoteSubmitting(true);
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noteTitle,
          fileUrl: uploadedFileData.url,
          fileType: uploadedFileData.name.split(".").pop() || "pdf",
          fileKey: uploadedFileData.key,
          fileName: uploadedFileData.name,
          fileSize: uploadedFileData.size,
          folderId: selectedFolderId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save note");

      setNoteTitle("");
      setUploadedFileData(null);
      setShowNoteModal(false);
      fetchNotes(selectedFolderId);
    } catch (err) {
      alert(err.message);
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId, noteTitle) => {
    if (!confirm(`Are you sure you want to delete "${noteTitle}"?`)) return;

    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete note");

      fetchNotes(selectedFolderId);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const selectedFolderName =
    folders.find((f) => f._id === selectedFolderId)?.name || "Select a folder";

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-accent p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />

        <div className="relative z-10">
          <Link
            href={`/semesters/${semesterId}`}
            className="inline-flex items-center text-sm font-medium text-white/80 hover:text-white transition-colors mb-4 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md w-fit"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Semesters
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-satoshi tracking-tight">
                {subject?.name || "Subject Details"}
              </h1>
              <p className="text-white/80 text-sm sm:text-base mt-2">
                Semester {semesterId} • {folders.length} Folders available
              </p>
            </div>

            {isSignedIn && (
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setShowFolderModal(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/25 transition-all shadow-lg cursor-pointer"
                >
                  <FolderPlus className="h-4 w-4" /> New Folder
                </button>

                {selectedFolderId && (
                  <button
                    onClick={() => setShowNoteModal(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-zinc-900 hover:bg-zinc-100 transition-all shadow-xl hover:-translate-y-0.5 cursor-pointer"
                  >
                    <UploadCloud className="h-4 w-4 text-accent" /> Upload Note
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Folders Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Folders
            </h2>
            {isSignedIn && (
              <button
                onClick={() => setShowFolderModal(true)}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            )}
          </div>

          <div className="space-y-2">
            {folders.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-6 text-center text-sm text-zinc-500">
                No folders created yet.
              </div>
            ) : (
              folders.map((f) => {
                const isFolderOwner = user && f.createdBy?.clerkId === user.id;
                const isSelected = selectedFolderId === f._id;
                return (
                  <div
                    key={f._id}
                    onClick={() => setSelectedFolderId(f._id)}
                    className={`group relative flex items-center justify-between rounded-2xl p-4 text-sm font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-white dark:bg-zinc-900 border-accent shadow-md text-zinc-900 dark:text-white"
                        : "bg-white/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={`p-2 rounded-xl transition-colors ${isSelected ? "bg-accent/10 text-accent" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}
                      >
                        <Folder className="h-4 w-4" />
                      </div>
                      <span className="truncate">{f.name}</span>
                    </div>

                    {isFolderOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(f._id, f.name);
                        }}
                        title="Delete folder"
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Notes View Area */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xl shadow-zinc-100 dark:shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800 gap-4">
              <div>
                <h2 className="text-xl font-bold font-satoshi text-zinc-900 dark:text-white">
                  {selectedFolderName}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Browse or download study materials shared by peers.
                </p>
              </div>

              {selectedFolderId && isSignedIn && (
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent text-white px-4 py-2.5 text-xs font-bold hover:opacity-90 transition-all shadow-md cursor-pointer w-fit"
                >
                  <UploadCloud className="h-4 w-4" /> Upload Material
                </button>
              )}
            </div>

            <div className="mt-6">
              {!selectedFolderId ? (
                <div className="py-16 text-center text-sm text-zinc-500">
                  Please select or create a folder to view notes.
                </div>
              ) : loadingNotes ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-7 w-7 animate-spin text-accent" />
                </div>
              ) : notes.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
                  <FileText className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                    No notes found
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                    There are no study files in this folder yet. Be the first
                    one to upload notes!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => {
                    const isNoteOwner =
                      user && note.uploadedBy?.clerkId === user.id;
                    return (
                      <div
                        key={note._id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all gap-4"
                      >
                        <div className="flex items-center gap-3.5 overflow-hidden">
                          <div className="rounded-2xl bg-accent/10 p-3 text-accent shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                              {note.title}
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                              {note.fileName} • Uploaded by{" "}
                              {note.uploadedBy?.firstName || "Student"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                          <a
                            href={note.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-xl hover:border-accent transition-all shadow-sm"
                          >
                            <Download className="h-3.5 w-3.5 text-accent" />{" "}
                            Download
                          </a>

                          {isNoteOwner && (
                            <button
                              onClick={() =>
                                handleDeleteNote(note._id, note.title)
                              }
                              title="Delete note"
                              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-bold font-satoshi text-zinc-900 dark:text-white">
                Create New Folder
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Organize study materials into structured categories.
              </p>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Past Papers, Midterm Notes"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-sm text-zinc-900 dark:text-white focus:border-accent focus:outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 px-5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={folderSubmitting}
                  className="rounded-2xl bg-accent px-6 py-2.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-lg cursor-pointer"
                >
                  {folderSubmitting ? "Creating..." : "Create Folder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-bold font-satoshi text-zinc-900 dark:text-white">
                Upload Study Material
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Share helpful notes, slides, or past papers with your peers.
              </p>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Note Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 3 Summary Notes"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-sm text-zinc-900 dark:text-white focus:border-accent focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Document File (PDF, DOCX, Image)
                </label>
                {uploadedFileData ? (
                  <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-4 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2">
                    <span className="font-bold">✓ File uploaded:</span>{" "}
                    <span className="truncate">{uploadedFileData.name}</span>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center hover:border-accent transition-all">
                    <UploadButton
                      endpoint="noteUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setUploadedFileData(res[0]);
                        }
                      }}
                      onUploadError={(error) => {
                        alert(`Upload error: ${error.message}`);
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 px-5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={noteSubmitting || !uploadedFileData || !noteTitle}
                  className="rounded-2xl bg-accent px-6 py-2.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-lg cursor-pointer"
                >
                  {noteSubmitting ? "Saving..." : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
