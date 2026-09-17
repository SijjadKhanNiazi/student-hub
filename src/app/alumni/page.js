"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import {
  GraduationCap,
  Briefcase,
  Search,
  Plus,
  Mail,
  Edit3,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Globe,
  Award,
  Phone,
  UserCheck,
} from "lucide-react";
import Image from "next/image";

function LinkedInIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24Z" />
    </svg>
  );
}

function GitHubIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

const GUIDANCE_AREAS = [
  "FYP Guidance",
  "Career Advice",
  "Remote Jobs",
  "Resume Review",
  "Interview Prep",
];

const DOMAINS = [
  "All Domains",
  "BS Computer Science",
  "BS Software Engineering",
  "BS Electrical Engineering",
  "BS Civil Engineering",
  "BBA / Business",
  "Other / Natural Sciences",
];

export default function AlumniPage() {
  const { user, isSignedIn } = useUser();

  const [alumniList, setAlumniList] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuidance, setSelectedGuidance] = useState("All");
  const [selectedDomain, setSelectedDomain] = useState("All Domains");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formDegree, setFormDegree] = useState("BS Computer Science");
  const [formGraduationYear, setFormGraduationYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [formCurrentRole, setFormCurrentRole] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formLinkedInUrl, setFormLinkedInUrl] = useState("");
  const [formGithubUrl, setFormGithubUrl] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formExpertise, setFormExpertise] = useState("");
  const [formGuidanceAreas, setFormGuidanceAreas] = useState([
    "FYP Guidance",
    "Career Advice",
  ]);
  const [formBio, setFormBio] = useState("");
  const [formIsAvailable, setFormIsAvailable] = useState(true);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedGuidance !== "All")
        params.append("guidanceArea", selectedGuidance);
      if (selectedDomain !== "All Domains")
        params.append("degree", selectedDomain.replace("All Domains", ""));

      const res = await fetch(`/api/alumni?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setAlumniList(data.alumni || []);
        setMyProfile(data.myProfile || null);
        setCurrentUserId(data.currentUserId || null);
      }
    } catch (err) {
      console.error("Error fetching alumni:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [selectedGuidance, selectedDomain]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAlumni();
  };

  // Open modal prefilled with my profile data if editing
  const openModal = () => {
    setErrorMsg("");
    if (myProfile) {
      setFormName(myProfile.name || "");
      setFormDegree(myProfile.degree || "BS Computer Science");
      setFormGraduationYear(
        myProfile.graduationYear || new Date().getFullYear().toString(),
      );
      setFormCurrentRole(myProfile.currentRole || "");
      setFormCompany(myProfile.company || "");
      setFormLinkedInUrl(myProfile.linkedInUrl || "");
      setFormGithubUrl(myProfile.githubUrl || "");
      setFormEmail(
        myProfile.email || user?.primaryEmailAddress?.emailAddress || "",
      );
      setFormPhone(myProfile.phone || "");
      setFormExpertise(
        Array.isArray(myProfile.expertise)
          ? myProfile.expertise.join(", ")
          : myProfile.expertise || "",
      );
      setFormGuidanceAreas(myProfile.guidanceAreas || []);
      setFormBio(myProfile.bio || "");
      setFormIsAvailable(myProfile.isAvailableForMentorship !== false);
    } else {
      setFormName(
        user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
      );
      setFormDegree("BS Computer Science");
      setFormGraduationYear("2024");
      setFormCurrentRole("");
      setFormCompany("");
      setFormLinkedInUrl("");
      setFormGithubUrl("");
      setFormEmail(user?.primaryEmailAddress?.emailAddress || "");
      setFormPhone("");
      setFormExpertise("React, Node.js, Python");
      setFormGuidanceAreas(["FYP Guidance", "Career Advice"]);
      setFormBio("");
      setFormIsAvailable(true);
    }
    setShowModal(true);
  };

  const handleGuidanceCheckbox = (area) => {
    if (formGuidanceAreas.includes(area)) {
      setFormGuidanceAreas(formGuidanceAreas.filter((a) => a !== area));
    } else {
      setFormGuidanceAreas([...formGuidanceAreas, area]);
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (
      !formName.trim() ||
      !formDegree.trim() ||
      !formGraduationYear.trim() ||
      !formCurrentRole.trim()
    ) {
      setErrorMsg("Please fill in Name, Degree, Batch Year, and Current Role.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          degree: formDegree,
          graduationYear: formGraduationYear,
          currentRole: formCurrentRole,
          company: formCompany,
          linkedInUrl: formLinkedInUrl,
          githubUrl: formGithubUrl,
          email: formEmail,
          phone: formPhone,
          expertise: formExpertise,
          guidanceAreas: formGuidanceAreas,
          bio: formBio,
          isAvailableForMentorship: formIsAvailable,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchAlumni();
      } else {
        setErrorMsg(data.error || "Failed to save profile.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!myProfile?._id) return;
    if (
      !confirm(
        "Are you sure you want to remove your profile from the directory?",
      )
    )
      return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/alumni/${myProfile._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMyProfile(null);
        setShowModal(false);
        fetchAlumni();
      } else {
        alert(data.error || "Failed to delete profile.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* ── Hero Header ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border transition-all"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--brand-accent) 6%, var(--brand-bg))",
          borderColor:
            "color-mix(in srgb, var(--brand-accent) 20%, transparent)",
        }}
      >
        <div
          className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ backgroundColor: "var(--brand-accent)" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--brand-accent) 15%, transparent)",
                color: "var(--brand-accent)",
              }}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Alumni & Senior Guidance Network</span>
            </div>

            <h1
              className="text-2xl sm:text-4xl font-extrabold tracking-tight"
              style={{ color: "var(--brand-struct)" }}
            >
              Connect with Experienced Seniors & Alumni
            </h1>

            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{
                color:
                  "color-mix(in srgb, var(--brand-struct) 75%, transparent)",
              }}
            >
              Get career advice, FYP guidance, resume feedback, and remote job
              referral leads directly from seniors who graduated from your
              university!
            </p>
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            {isSignedIn ? (
              <button
                onClick={openModal}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                style={{ backgroundColor: "var(--brand-accent)" }}
              >
                {myProfile ? (
                  <>
                    <Edit3 className="h-5 w-5" />
                    <span>Edit My Profile</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>Join Alumni Directory</span>
                  </>
                )}
              </button>
            ) : (
              <SignInButton mode="modal">
                <button
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-white shadow-lg transition-all cursor-pointer"
                  style={{ backgroundColor: "var(--brand-accent)" }}
                >
                  <Plus className="h-5 w-5" />
                  <span>Sign In to Join Directory</span>
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>

      {/* ── Search & Filters Bar ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 w-full"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, role, company, skill, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
              style={{
                backgroundColor: "var(--brand-bg)",
                borderColor:
                  "color-mix(in srgb, var(--brand-struct) 15%, transparent)",
                color: "var(--brand-struct)",
              }}
            />
          </form>

          {/* Degree Filter Dropdown */}
          <div className="w-full sm:w-auto shrink-0">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border text-sm font-medium outline-none cursor-pointer transition-all"
              style={{
                backgroundColor: "var(--brand-bg)",
                borderColor:
                  "color-mix(in srgb, var(--brand-struct) 15%, transparent)",
                color: "var(--brand-struct)",
              }}
            >
              {DOMAINS.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Guidance Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedGuidance("All")}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
            style={{
              backgroundColor:
                selectedGuidance === "All"
                  ? "var(--brand-accent)"
                  : "color-mix(in srgb, var(--brand-struct) 8%, transparent)",
              color:
                selectedGuidance === "All" ? "#ffffff" : "var(--brand-struct)",
            }}
          >
            All Guidance Areas
          </button>
          {GUIDANCE_AREAS.map((area) => {
            const isSelected = selectedGuidance === area;
            return (
              <button
                key={area}
                onClick={() => setSelectedGuidance(area)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
                style={{
                  backgroundColor: isSelected
                    ? "var(--brand-accent)"
                    : "color-mix(in srgb, var(--brand-struct) 8%, transparent)",
                  color: isSelected ? "#ffffff" : "var(--brand-struct)",
                }}
              >
                {area}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Alumni Cards List ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={{ color: "var(--brand-accent)" }}
          />
          <p
            className="text-sm font-medium"
            style={{
              color: "color-mix(in srgb, var(--brand-struct) 60%, transparent)",
            }}
          >
            Loading Alumni Profiles...
          </p>
        </div>
      ) : alumniList.length === 0 ? (
        <div
          className="rounded-3xl border p-12 text-center space-y-4 max-w-lg mx-auto"
          style={{
            borderColor:
              "color-mix(in srgb, var(--brand-struct) 12%, transparent)",
            backgroundColor: "var(--brand-bg)",
          }}
        >
          <div
            className="h-16 w-16 mx-auto rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--brand-accent) 10%, transparent)",
              color: "var(--brand-accent)",
            }}
          >
            <UserCheck className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3
              className="text-lg font-bold"
              style={{ color: "var(--brand-struct)" }}
            >
              No Seniors Found
            </h3>
            <p
              className="text-xs sm:text-sm"
              style={{
                color:
                  "color-mix(in srgb, var(--brand-struct) 65%, transparent)",
              }}
            >
              No alumni match your current search or filter. Be the first senior
              to share your experience!
            </p>
          </div>
          {isSignedIn && (
            <button
              onClick={openModal}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white transition-all cursor-pointer inline-flex items-center gap-2"
              style={{ backgroundColor: "var(--brand-accent)" }}
            >
              <Plus className="h-4 w-4" />
              <span>Add Your Profile</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumniList.map((alumnus) => {
            const isOwner =
              currentUserId &&
              alumnus.user?._id &&
              alumnus.user._id.toString() === currentUserId;

            return (
              <div
                key={alumnus._id}
                className="flex flex-col justify-between rounded-2xl border p-5 transition-all hover:shadow-lg hover:-translate-y-1 relative group"
                style={{
                  backgroundColor: "var(--brand-bg)",
                  borderColor:
                    "color-mix(in srgb, var(--brand-struct) 14%, transparent)",
                }}
              >
                <div className="space-y-4">
                  {/* Card Header: Avatar & Basic Details */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100 flex items-center justify-center font-bold text-lg text-gray-600">
                        {alumnus.user?.imageUrl ? (
                          <Image
                            src={alumnus.user.imageUrl}
                            alt={alumnus.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span>{alumnus.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h3
                          className="font-bold text-base leading-snug flex items-center gap-1.5"
                          style={{ color: "var(--brand-struct)" }}
                        >
                          <span>{alumnus.name}</span>
                          {alumnus.isAvailableForMentorship && (
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              title="Available for Mentorship"
                              style={{ backgroundColor: "#22c55e" }}
                            />
                          )}
                        </h3>
                        <div
                          className="flex items-center gap-1.5 text-xs font-medium"
                          style={{
                            color:
                              "color-mix(in srgb, var(--brand-struct) 65%, transparent)",
                          }}
                        >
                          <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {alumnus.degree} ({alumnus.graduationYear})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Owner Badge */}
                    {isOwner && (
                      <button
                        onClick={openModal}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shrink-0"
                        style={{
                          borderColor: "var(--brand-accent)",
                          color: "var(--brand-accent)",
                          backgroundColor:
                            "color-mix(in srgb, var(--brand-accent) 8%, transparent)",
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {/* Current Role & Company */}
                  <div
                    className="p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--brand-struct) 5%, transparent)",
                      color: "var(--brand-struct)",
                    }}
                  >
                    <Briefcase className="h-4 w-4 shrink-0 text-amber-500" />
                    <span className="truncate">
                      {alumnus.currentRole}
                      {alumnus.company ? ` @ ${alumnus.company}` : ""}
                    </span>
                  </div>

                  {/* Guidance Areas Tags */}
                  {alumnus.guidanceAreas &&
                    alumnus.guidanceAreas.length > 0 && (
                      <div className="space-y-1.5">
                        <div
                          className="text-[11px] font-bold tracking-wider uppercase"
                          style={{
                            color:
                              "color-mix(in srgb, var(--brand-struct) 50%, transparent)",
                          }}
                        >
                          Can Help With:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {alumnus.guidanceAreas.map((area) => (
                            <span
                              key={area}
                              className="px-2.5 py-1 rounded-md text-[11px] font-medium"
                              style={{
                                backgroundColor:
                                  "color-mix(in srgb, var(--brand-accent) 12%, transparent)",
                                color: "var(--brand-accent)",
                              }}
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Skills / Expertise */}
                  {alumnus.expertise && alumnus.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {alumnus.expertise.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded text-[10px] font-mono border"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--brand-struct) 15%, transparent)",
                            color:
                              "color-mix(in srgb, var(--brand-struct) 70%, transparent)",
                          }}
                        >
                          #{skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Advice Note / Bio */}
                  {alumnus.bio && (
                    <p
                      className="text-xs italic line-clamp-3 p-3 rounded-xl border-l-2"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--brand-struct) 3%, transparent)",
                        borderColor: "var(--brand-accent)",
                        color:
                          "color-mix(in srgb, var(--brand-struct) 75%, transparent)",
                      }}
                    >
                      &ldquo;{alumnus.bio}&rdquo;
                    </p>
                  )}
                </div>

                {/* Card Footer: Social & Contact Links */}
                <div
                  className="mt-5 pt-3 border-t flex items-center justify-between gap-2"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--brand-struct) 10%, transparent)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    {alumnus.linkedInUrl && (
                      <a
                        href={
                          alumnus.linkedInUrl.startsWith("http")
                            ? alumnus.linkedInUrl
                            : `https://${alumnus.linkedInUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        title="LinkedIn Profile"
                      >
                        <LinkedInIcon className="h-3.5 w-3.5" />
                        <span>LinkedIn</span>
                      </a>
                    )}

                    {alumnus.githubUrl && (
                      <a
                        href={
                          alumnus.githubUrl.startsWith("http")
                            ? alumnus.githubUrl
                            : `https://${alumnus.githubUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="GitHub Profile"
                      >
                        <GitHubIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {alumnus.email && (
                      <a
                        href={`mailto:${alumnus.email}?subject=Mentorship / Guidance Inquiry from Mianwali Student Hub`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--brand-struct) 20%, transparent)",
                          color: "var(--brand-struct)",
                        }}
                        title={`Email ${alumnus.name}`}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Contact</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Profile Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div
            className="w-full max-w-xl rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 my-8 transition-all"
            style={{
              backgroundColor: "var(--brand-bg)",
              borderColor:
                "color-mix(in srgb, var(--brand-struct) 18%, transparent)",
            }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between border-b pb-4"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--brand-struct) 10%, transparent)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="p-2 rounded-xl text-white"
                  style={{ backgroundColor: "var(--brand-accent)" }}
                >
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "var(--brand-struct)" }}
                  >
                    {myProfile
                      ? "Edit Senior Profile"
                      : "Join Senior Directory"}
                  </h2>
                  <p
                    className="text-xs"
                    style={{
                      color:
                        "color-mix(in srgb, var(--brand-struct) 65%, transparent)",
                    }}
                  >
                    Share your experience to mentor students and juniors.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                {errorMsg}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmitProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label
                    className="text-xs font-bold"
                    style={{ color: "var(--brand-struct)" }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ali Raza"
                    className="w-full px-3.5 py-2 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: "var(--brand-bg)",
                      borderColor:
                        "color-mix(in srgb, var(--brand-struct) 18%, transparent)",
                      color: "var(--brand-struct)",
                    }}
                  />
                </div>

                {/* Graduation / Batch Year */}
                <div className="space-y-1">
                  <label
                    className="text-xs font-bold"
                    style={{ color: "var(--brand-struct)" }}
                  >
                    Batch / Graduation Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={formGraduationYear}
                    onChange={(e) => setFormGraduationYear(e.target.value)}
                    placeholder="e.g. 2024 or 2025"
                    className="w-full px-3.5 py-2 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: "var(--brand-bg)",
                      borderColor:
                        "color-mix(in srgb, var(--brand-struct) 18%, transparent)",
                      color: "var(--brand-struct)",
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Degree / Department */}
                <div className="space-y-1">
                  <label
                    className="text-xs font-bold"
                    style={{ color: "var(--brand-struct)" }}
                  >
                    Degree / Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDegree}
                    onChange={(e) => setFormDegree(e.target.value)}
                    placeholder="e.g. BS Computer Science"
                    className="w-full px-3.5 py-2 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: "var(--brand-bg)",
                      borderColor:
                        "color-mix(in srgb, var(--brand-struct) 18%, transparent)",
                      color: "var(--brand-struct)",
                    }}
                  />
                </div>

                {/* Current Role */}
                <div className="space-y-1">
                  <label
                    className="text-xs font-bold"
                    style={{ color: "var(--brand-struct)" }}
                  >
                    Current Role / Field *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCurrentRole}
                    onChange={(e) => setFormCurrentRole(e.target.value)}
                    placeholder="e.g. Frontend Developer"
                    className="w-full px-3.5 py-2 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: "var(--brand-bg)",
                      borderColor:
                        "color-mix(in srgb, var(--brand-struct) 18%, transparent)",
                      color: "var(--brand-struct)",
                    }}
                  />
                </div>
              </div>

              {/* Company */}
              <div className="space-y-1">
                <label
                  className="text-xs font-bold"
                  style={{ color: "var(--brand-struct)" }}
                >
                  Company / Organization (Optional)
                </label>
                <input
                  type="text"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="e.g. Tech Solutions / Remote / Freelance"
                  className="w-full px-3.5 py-2 rounded-xl border text-sm outline-none"
                  style={{
                    backgroundColor: "var(--brand-bg)",
                    borderColor:
                      "color-mix(in srgb, var(--brand-struct) 18%, transparent)",
                    color: "var(--brand-struct)",
                  }}
                />
              </div>

              {/* Links: LinkedIn & GitHub */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    className="text-xs font-bold"
                    style={{ color: "var(--brand-struct)" }}
                  >
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={formLinkedInUrl}
                    onChange={(e) => setFormLinkedInUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: "var(--brand-bg)",
                      borderColor:
                        "color-mix(in srgb, var(--brand-struct) 18%, transparent)",
                      color: "var(--brand-struct)",
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label
                    className="text-xs font-bold"
                    style={{ color: "var(--brand-struct)" }}
                  >
                    GitHub / Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={formGithubUrl}
                    onChange={(e) => setFormGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-3.5 py-2 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: "var(--brand-bg)",
                      borderColor:
                        "color-mix(in srgb, var(--brand-struct) 18%, transparent)",
                      color: "var(--brand-struct)",
                    }}
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    className="text-xs font-bold"
                    style={{ color: "var(--brand-struct)" }}
                  >
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-3.5 py-2 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: "var(--brand-bg)",
                      borderColor:
                        "color-mix(in srgb, var(--brand-struct) 18%, transparent)",
                      color: "var(--brand-struct)",
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label
                    className="text-xs font-bold"
                    style={{ color: "var(--brand-struct)" }}
                  >
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full px-3.5 py-2 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: "var(--brand-bg)",
                      borderColor:
                        "color-mix(in srgb, var(--brand-struct) 18%, transparent)",
                      color: "var(--brand-struct)",
                    }}
                  />
                </div>
              </div>

              {/* Guidance Areas Checkboxes */}
              <div className="space-y-2">
                <label
                  className="text-xs font-bold block"
                  style={{ color: "var(--brand-struct)" }}
                >
                  Areas You Can Guide Juniors In:
                </label>
                <div className="flex flex-wrap gap-2">
                  {GUIDANCE_AREAS.map((area) => {
                    const active = formGuidanceAreas.includes(area);
                    return (
                      <button
                        type="button"
                        key={area}
                        onClick={() => handleGuidanceCheckbox(area)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5"
                        style={{
                          backgroundColor: active
                            ? "color-mix(in srgb, var(--brand-accent) 15%, transparent)"
                            : "transparent",
                          borderColor: active
                            ? "var(--brand-accent)"
                            : "color-mix(in srgb, var(--brand-struct) 20%, transparent)",
                          color: active
                            ? "var(--brand-accent)"
                            : "var(--brand-struct)",
                        }}
                      >
                        {active && (
                          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>{area}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skills / Expertise */}
              <div className="space-y-1">
                <label
                  className="text-xs font-bold"
                  style={{ color: "var(--brand-struct)" }}
                >
                  Skills / Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={formExpertise}
                  onChange={(e) => setFormExpertise(e.target.value)}
                  placeholder="e.g. React, Next.js, Python, Figma, Circuit Design"
                  className="w-full px-3.5 py-2 rounded-xl border text-sm outline-none"
                  style={{
                    backgroundColor: "var(--brand-bg)",
                    borderColor:
                      "color-mix(in srgb, var(--brand-struct) 18%, transparent)",
                    color: "var(--brand-struct)",
                  }}
                />
              </div>

              {/* Short Bio / Advice Note */}
              <div className="space-y-1">
                <label
                  className="text-xs font-bold"
                  style={{ color: "var(--brand-struct)" }}
                >
                  Advice Note for Juniors / Short Bio
                </label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Share a short tip or note for juniors reaching out..."
                  className="w-full px-3.5 py-2 rounded-xl border text-sm outline-none resize-none"
                  style={{
                    backgroundColor: "var(--brand-bg)",
                    borderColor:
                      "color-mix(in srgb, var(--brand-struct) 18%, transparent)",
                    color: "var(--brand-struct)",
                  }}
                />
              </div>

              {/* Mentorship Availability Toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formIsAvailable}
                  onChange={(e) => setFormIsAvailable(e.target.checked)}
                  className="rounded h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                />
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--brand-struct)" }}
                >
                  Available for mentorship inquiries
                </span>
              </label>

              {/* Modal Actions */}
              <div
                className="flex items-center justify-between pt-4 border-t"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--brand-struct) 10%, transparent)",
                }}
              >
                {myProfile ? (
                  <button
                    type="button"
                    onClick={handleDeleteProfile}
                    disabled={deleting}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{deleting ? "Removing..." : "Remove Profile"}</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--brand-struct) 20%, transparent)",
                      color: "var(--brand-struct)",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
                    style={{ backgroundColor: "var(--brand-accent)" }}
                  >
                    {submitting && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    <span>{submitting ? "Saving..." : "Save Profile"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
