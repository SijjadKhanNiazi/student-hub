"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";

export default function RegisterForm() {
  const { isSignedIn, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photoData, setPhotoData] = useState("");
  const router = useRouter();

  // Show loading state while Clerk checks authentication
  if (!isLoaded) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoData(reader.result);
    reader.onerror = () =>
      setError("Couldn't read that image, try another file.");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const body = photoData ? { photo: photoData } : {};
      const res = await fetch("/api/competitions/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // BUG FIX: other routes in this app return the error as
        // `{ error: "..." }`, not `{ message: "..." }`. Reading only
        // `errData.message` meant real backend errors were swallowed and
        // the user just saw "Failed to register" with no useful detail.
        throw new Error(data.error || data.message || "Failed to register");
      }
      setSuccess("Successfully registered for the competition!");
      setTimeout(() => router.refresh(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600">{error}</p>}
          {success && <p className="text-green-600">{success}</p>}
          <label className="block">
            <span className="text-gray-700">Candidate Photo (optional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-white file:bg-[#FF6B35] hover:file:bg-[#FF79C6]"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register for Competition"}
          </button>
        </form>
      ) : (
        <div className="text-center space-y-3">
          <p className="text-gray-700">
            Please sign in to register for the competition.
          </p>
          <SignInButton mode="modal">
            <button className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:opacity-90 transition">
              Sign In
            </button>
          </SignInButton>
        </div>
      )}
    </>
  );
}
