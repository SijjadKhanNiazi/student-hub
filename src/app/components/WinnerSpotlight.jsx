"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Award, ChevronRight } from "lucide-react";

function relativeTime(isoDate) {
  if (!isoDate) return "";
  const diff = new Date() - new Date(isoDate);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function InitialsAvatar({ name, size = 128, className = "" }) {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/5 text-white font-bold ${className}`}
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size / 3.2 }}>{initials || "?"}</span>
    </div>
  );
}

function ChampionCard({ champion }) {
  if (!champion) return null;
  const { winner, score, opponent, completedAt } = champion;

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-4 sm:p-6 md:p-8 text-white shadow-2xl shadow-orange-500/35">
      <div className="absolute -top-10 sm:-top-16 -right-10 sm:-right-16 h-40 sm:h-56 w-40 sm:w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-10 sm:-bottom-20 -left-6 sm:-left-10 h-44 sm:h-64 w-44 sm:w-64 rounded-full bg-yellow-300/10 blur-3xl" />

      <div className="relative flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-10">
        {/* Champion Avatar + Trophy */}
        <div className="relative shrink-0">
          <div className="absolute -top-2 sm:-top-3 -right-1 sm:-right-2 z-10 flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-yellow-300 text-amber-900 shadow-lg sm:animate-pulse">
            <Trophy className="h-4 w-4 sm:h-6 sm:w-6" strokeWidth={2.5} />
          </div>
          <div className="rounded-full ring-4 ring-white/60 ring-offset-4 ring-offset-orange-500/30">
            {winner.imageUrl ? (
              <Image
                src={winner.imageUrl}
                alt={winner.name}
                width={96}
                height={96}
                className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full object-cover"
                priority
              />
            ) : (
              <InitialsAvatar
                name={winner.name}
                size={80}
                className="sm:!w-28 sm:!h-28 md:!w-32 md:!h-32"
              />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 w-full text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-2.5 py-1 text-[10px] sm:text-xs font-semibold tracking-wider uppercase">
            🏆 Champion of the Week
          </div>
          <h3 className="mt-2 sm:mt-3 text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow-sm break-words">
            {winner.name}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-white/80">
            Won the 1v1 competition · {relativeTime(completedAt)}
          </p>

          {opponent || (score && score.winnerVotes + score.loserVotes > 0) ? (
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-xs sm:text-sm">
              {score && score.winnerVotes + score.loserVotes > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-black/25 px-3 sm:px-4 py-1.5 sm:py-2 font-semibold">
                  <span className="text-yellow-200">{score.winnerVotes}</span>
                  <span className="sr-only">votes versus</span>
                  <span className="text-white/50">vs</span>
                  <span className="text-white/80">{score.loserVotes}</span>
                </div>
              )}
              {opponent && (
                <div className="rounded-xl bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 max-w-full truncate">
                  Defeated{" "}
                  <span className="font-semibold break-words">{opponent}</span>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <Link
          href="/competitions"
          className="shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-orange-700 shadow-lg hover:bg-yellow-50 hover:-translate-y-0.5 transition-all mt-1 md:mt-0"
        >
          Enter Next Competition <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function RunnerUpCard({ entry, rank }) {
  if (!entry) return null;
  const { winner, completedAt, score } = entry;
  const medalColor =
    rank === 1
      ? "from-slate-300 to-slate-500"
      : rank === 2
        ? "from-amber-700 to-amber-900"
        : "from-indigo-400 to-indigo-600";
  const medalLabel = rank === 1 ? "🥈" : rank === 2 ? "🥉" : `#${rank + 1}`;

  return (
    <div className="group relative w-full rounded-2xl border border-white/10 bg-[#2C4A3E]/40 sm:bg-white/5 backdrop-blur p-3 sm:p-4 text-white hover:border-white/30 hover:bg-white/10 transition-all">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative shrink-0">
          <div
            className={`absolute -top-1.5 -right-1.5 z-10 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-gradient-to-br ${medalColor} text-[10px] sm:text-[11px] font-bold text-white shadow`}
          >
            {medalLabel}
          </div>
          {winner.imageUrl ? (
            <Image
              src={winner.imageUrl}
              alt={winner.name}
              width={56}
              height={56}
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover ring-2 ring-white/20"
            />
          ) : (
            <InitialsAvatar
              name={winner.name}
              size={56}
              className="sm:!w-16 sm:!h-16 ring-2 ring-white/20"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold truncate text-sm sm:text-base">
            {winner.name}
          </p>
          <p className="text-[11px] sm:text-xs text-white/60">
            {relativeTime(completedAt)}
          </p>
          {score && score.winnerVotes + score.loserVotes > 0 && (
            <p className="mt-0.5 text-[11px] sm:text-xs text-white/70">
              <span className="font-semibold text-green-300">
                {score.winnerVotes}
              </span>{" "}
              · won{" "}
              <span className="font-semibold">
                {score.winnerVotes}–{score.loserVotes}
              </span>
            </p>
          )}
        </div>

        <Award className="h-4 w-4 sm:h-5 sm:w-5 text-white/40 group-hover:text-white/70 transition-colors hidden sm:block" />
      </div>
    </div>
  );
}

export default function WinnerSpotlight({ hydrated }) {
  const [winners, setWinners] = useState(
    Array.isArray(hydrated?.winners) ? hydrated.winners : [],
  );
  const [loaded, setLoaded] = useState(Boolean(hydrated && hydrated.winners));

  useEffect(() => {
    if (loaded) return;
    const fetchWinners = async () => {
      try {
        const res = await fetch("/api/competitions/latest");
        if (!res.ok) {
          setLoaded(true);
          return;
        }
        const data = await res.json();
        if (data.success && Array.isArray(data.winners)) {
          setWinners(data.winners);
        }
      } catch {
        /* ignore */
      } finally {
        setLoaded(true);
      }
    };
    fetchWinners();
  }, [loaded]);

  if (!loaded) return null;
  if (!winners || winners.length === 0) return null;

  const champion = winners[0];
  const runnerUps = winners.slice(1);

  return (
    <section className="w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 w-full">
        <div className="flex flex-col items-start text-left max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#FF6B35]/20 bg-[#FF6B35]/10 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-[#FF6B35] dark:text-[#FF79C6] dark:border-[#FF79C6]/20 dark:bg-[#FF79C6]/10">
            <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Competition Hall of Fame
          </div>

          {/* Heading */}
          <h2 className="mt-2 text-xl sm:text-2xl md:text-3xl font-extrabold text-[#2C4A3E] dark:text-white font-satoshi leading-tight">
            Our Latest Winners
          </h2>

          {/* Description */}
          <p className="mt-1.5 text-xs sm:text-sm text-[#2C4A3E]/60 dark:text-gray-400">
            Recognizing the top-voted students from our weekly 1v1 competitions.
            Register, get matched, and claim your place here.
          </p>
        </div>
        <Link
          href="/competitions"
          className="sm:hidden inline-flex items-center justify-center gap-1.5 text-sm font-bold text-[#FF6B35] dark:text-[#FF79C6] hover:underline underline-offset-4 self-start"
        >
          View all <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href="/competitions"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-[#FF6B35] dark:text-[#FF79C6] hover:underline underline-offset-4"
        >
          View all <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <ChampionCard champion={champion} />

      {runnerUps.length > 0 && (
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between pt-1">
            <h4 className="text-sm sm:text-base font-bold text-[#2C4A3E] dark:text-white">
              Recent Winners
            </h4>
          </div>

          {/* Mobile: Horizontal Carousel */}
          <div className=" -mx-4 px-4 overflow-x-auto snap-x snap-mandatory pb-2">
            <div className="flex gap-3 min-w-max pr-4">
              {runnerUps.map((entry, i) => (
                <div
                  key={entry.id || entry.winner?.id || `runner-m-${i}`}
                  className="w-[78%] shrink-0 snap-start"
                >
                  <RunnerUpCard entry={entry} rank={i + 1} />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Grid View (Fixed and forced layout) */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {runnerUps.map((entry, i) => (
              <RunnerUpCard
                key={entry.id || entry.winner?.id || `runner-d-${i}`}
                entry={entry}
                rank={i + 1}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
