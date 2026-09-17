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
    if (!confirm(`Are you sure you want to delete folder "${folderName}" and all notes inside it?`)) return;

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
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/semesters/${semesterId}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors mb-3"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Subjects
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{subject?.name || "Subject Details"}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Semester {semesterId} • {folders.length} Folders
            </p>
          </div>

          {isSignedIn && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFolderModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm cursor-pointer"
              >
                <FolderPlus className="h-4 w-4 text-gray-500" /> New Folder
              </button>

              {selectedFolderId && (
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                >
                  <UploadCloud className="h-4 w-4" /> Upload Note
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Folder Tabs & File List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folders Sidebar / List */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Folders</h2>

          {folders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-500">
              No folders created yet.
            </div>
          ) : (
            folders.map((f) => {
              const isFolderOwner = user && f.createdBy?.clerkId === user.id;
              return (
                <div
                  key={f._id}
                  className={`group flex items-center justify-between rounded-lg p-2.5 text-sm font-medium transition-colors border ${
                    selectedFolderId === f._id
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <button
                    onClick={() => setSelectedFolderId(f._id)}
                    className="flex-1 flex items-center gap-2.5 overflow-hidden text-left cursor-pointer"
                  >
                    <Folder className={`h-4 w-4 flex-shrink-0 ${selectedFolderId === f._id ? "text-blue-600" : "text-gray-400"}`} />
                    <span className="truncate">{f.name}</span>
                  </button>

                  {isFolderOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(f._id, f.name);
                      }}
                      title="Delete folder"
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Notes View Area */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {folders.find((f) => f._id === selectedFolderId)?.name || "Select a folder"}
            </h2>

            {!selectedFolderId ? (
              <div className="py-12 text-center text-sm text-gray-500">Please select or create a folder to view notes.</div>
            ) : loadingNotes ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : notes.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg">
                No notes found in this folder.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notes.map((note) => {
                  const isNoteOwner = user && note.uploadedBy?.clerkId === user.id;
                  return (
                    <div key={note._id} className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-medium text-sm text-gray-900 truncate">{note.title}</h4>
                          <p className="text-xs text-gray-500 truncate">
                            {note.fileName} • Uploaded by {note.uploadedBy?.firstName || "User"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={note.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </a>

                        {isNoteOwner && (
                          <button
                            onClick={() => handleDeleteNote(note._id, note.title)}
                            title="Delete note"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
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

      {/* New Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Create Folder</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                required
                placeholder="e.g. Past Papers, Midterm Notes"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={folderSubmitting}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Upload Study Material</h3>
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 3 Summary Notes"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document (PDF, DOCX, Image)</label>
                {uploadedFileData ? (
                  <div className="rounded-md bg-green-50 p-3 text-xs text-green-700 border border-green-200">
                    ✔ File uploaded: {uploadedFileData.name}
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
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

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={noteSubmitting || !uploadedFileData || !noteTitle}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
