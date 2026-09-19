"use client";
import { useEffect, useState } from "react";

/**
 * Drop this into your homepage (app/page.js) wherever you want the latest
 * competition winner to appear:
 *
 *   import WinnerBanner from "@/components/WinnerBanner";
 *   ...
 *   <WinnerBanner />
 *
 * Renders nothing if no competition has finished yet.
 */
export default function WinnerBanner() {
  const [comp, setComp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/competitions/latest")
      .then((res) => res.json())
      .then((data) => setComp(data.competition))
      .catch(() => setComp(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !comp) return null;

  const winner = comp.winner; // populated user object, or null on a tie

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 rounded-2xl border border-[#FF6B35]/30 bg-[#FF6B35]/5 text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-[#FF6B35] mb-2">
        Latest Competition Result
      </p>
      {winner ? (
        <div className="flex flex-col items-center gap-2">
          <img
            src={winner.imageUrl || "/default-avatar.png"}
            alt={`${winner.firstName} ${winner.lastName}`}
            className="w-16 h-16 rounded-full object-cover"
          />
          <p className="text-lg font-semibold">
            🏆 {winner.firstName} {winner.lastName} won the last round!
          </p>
        </div>
      ) : (
        <p className="text-lg font-semibold">
          The last round ended in a tie between {comp.player1?.firstName} and{" "}
          {comp.player2?.firstName}!
        </p>
      )}
    </div>
  );
}
