import Link from "next/link";
import Image from "next/image";
// Removed client-side React hooks import
import {
  ArrowRight,
  FolderKanban,
  MessageSquarePlus,
  Search,
  Sparkles,
  Calculator,
  BookOpen,
  Users,
  Rocket,
  Trophy,
} from "lucide-react";
import dbConnect from "@/lib/mongodb";
import Subject from "@/lib/models/Subject";
import User from "@/lib/models/User";
import CompetitionMatch from "@/lib/models/CompetitionMatch";
import WinnerSpotlight from "@/app/components/WinnerSpotlight";

async function getSemesters() {
  try {
    await dbConnect();
    const subjectCounts = await Subject.aggregate([
      { $group: { _id: "$semester", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    subjectCounts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    return Array.from({ length: 8 }, (_, i) => {
      const num = i + 1;
      return {
        id: num,
        number: num,
        name: `Semester ${num}`,
        subjectCount: countMap[num] || 0,
      };
    });
  } catch (error) {
    console.error("Failed to fetch semesters:", error);
    return Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      number: i + 1,
      name: `Semester ${i + 1}`,
      subjectCount: 0,
    }));
  }
}

const SPOTLIGHT_HOURS = 48 * 7;
const MAX_SPOTLIGHT = 5;

async function getRecentWinners() {
  try {
    await dbConnect();
    const cutoff = new Date(Date.now() - SPOTLIGHT_HOURS * 60 * 60 * 1000);
    const matches = await CompetitionMatch.find({
      status: "Completed",
      winner: { $ne: null },
      updatedAt: { $gte: cutoff },
    })
      .sort({ updatedAt: -1 })
      .limit(MAX_SPOTLIGHT)
      .populate("winner", "firstName lastName imageUrl email")
      .populate("player1", "firstName lastName email")
      .populate("player2", "firstName lastName email")
      .populate("votes.candidate", "_id")
      .lean();

    if (!matches || matches.length === 0) return [];

    return matches
      .map((match) => {
        const w = match.winner;
        if (!w) return null;
        const fullName =
          `${w.firstName || ""} ${w.lastName || ""}`.trim() ||
          w.email ||
          "Winner";
        const winnerId = w._id?.toString();
        const p1Id =
          match.player1?._id?.toString() || match.player1?.toString();
        const p2Id =
          match.player2?._id?.toString() || match.player2?.toString();
        const loserDoc =
          winnerId === p1Id
            ? typeof match.player2 === "object" && match.player2 !== null
              ? match.player2
              : null
            : typeof match.player1 === "object" && match.player1 !== null
            ? match.player1
            : null;
        let opponent = null;
        if (loserDoc) {
          const n =
            `${loserDoc.firstName || ""} ${loserDoc.lastName || ""}`.trim() ||
            loserDoc.email;
          if (n) opponent = n;
        }
        const getCId = (c) =>
          typeof c === "object" && c !== null
            ? c._id?.toString()
            : c?.toString();
        const p1Votes = (match.votes || []).filter(
          (v) => getCId(v.candidate) === p1Id,
        ).length;
        const p2Votes = (match.votes || []).filter(
          (v) => getCId(v.candidate) === p2Id,
        ).length;
        return {
          id: match._id.toString(),
          completedAt: match.updatedAt,
          winner: {
            id: w._id.toString(),
            name: fullName,
            imageUrl: w.imageUrl || null,
            email: w.email || null,
          },
          score: {
            winnerVotes: winnerId === p1Id ? p1Votes : p2Votes,
            loserVotes: winnerId === p1Id ? p2Votes : p1Votes,
          },
          opponent,
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.error("Homepage: failed to fetch recent winners", err);
    return [];
  }
}

export default async function HomePage() {
  const [semesters, winners] = await Promise.all([
    getSemesters(),
    getRecentWinners(),
  ]);

  const totalSubjects = semesters.reduce((a, s) => a + s.subjectCount, 0);

  /* Feature cards that link to each section of the app */
  const features = [
    {
      title: "Study Requests",
      description:
        "Post a request like Mujhe yeh chahiye and let classmates help you find the notes you need.",
      href: "/requests",
      icon: MessageSquarePlus,
      color: "from-emerald-500 to-teal-600",
      darkColor: "dark:from-emerald-400 dark:to-teal-500",
    },
    {
      title: "Lost & Found",
      description:
        "Lost something on campus? Post it here. Found something? Help reunite it with its owner.",
      href: "/lost-found",
      icon: Search,
      color: "from-blue-500 to-indigo-600",
      darkColor: "dark:from-blue-400 dark:to-indigo-500",
    },
    {
      title: "Confessions",
      description:
        "Share campus confessions anonymously, react with likes, and give advice to fellow students.",
      href: "/confessions",
      icon: Sparkles,
      color: "from-purple-500 to-pink-600",
      darkColor: "dark:from-purple-400 dark:to-pink-500",
    },
    {
      title: "CGPA Calculator",
      description:
        "Calculate your Semester GPA and Cumulative CGPA with precision using the 4.00 grading scale.",
      href: "/cgpa-calculator",
      icon: Calculator,
      color: "from-amber-500 to-orange-600",
      darkColor: "dark:from-amber-400 dark:to-orange-500",
    },
    {
      title: "FYP Survival Guide",
      description:
        "Master your Final Year Project phase by phase—from team formation and defenses to sample PPTs and final submission.",
      href: "/fyp-guide",
      icon: Rocket,
      color: "from-rose-500 to-red-600",
      darkColor: "dark:from-rose-400 dark:to-red-500",
    },
    {
      title: "Competition",
      description:
        "Enter the voting competition, register and vote for the best submission.",
      href: "/competitions",
      icon: Trophy,
      color: "from-pink-500 to-rose-600",
      darkColor: "dark:from-pink-400 dark:to-rose-500",
    },
    {
      title: "Alumni & Senior Career Guidance",
      description:
        "Connect with pass-out seniors for mentorship, FYP direction, tech stack advice, and remote job referrals.",
      href: "/alumni",
      icon: Users,
      color: "from-indigo-500 to-cyan-600",
      darkColor: "dark:from-indigo-400 dark:to-cyan-500",
    },
  ];

  return (
    <div className="space-y-0">
      {/* ═══════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2C4A3E] via-[#1a2d26] to-[#0f1c17] dark:from-[#14121F] dark:via-[#1a1530] dark:to-[#231E3D] py-20 sm:py-28 lg:py-36">
        {/* Decorative background circles */}
        <div className="absolute top-[-80px] right-[-80px] h-[300px] w-[300px] rounded-full bg-[#FF6B35]/10 dark:bg-[#FF79C6]/10 blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-60px] h-[250px] w-[250px] rounded-full bg-[#FF6B35]/5 dark:bg-[#FF79C6]/5 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/80 mb-8">
            <BookOpen className="h-3.5 w-3.5" />
            Open Academic Community for Mianwali Students
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight font-satoshi leading-tight">
            Elevate Your{" "}
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#ff9f35] dark:from-[#FF79C6] dark:to-[#c084fc] bg-clip-text text-transparent">
              Academic Journey
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-white/70 leading-relaxed">
            Browse semester-wise notes, download study materials, post requests,
            share confessions, and calculate your CGPA — all in one premium
            student hub.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#semesters"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] dark:bg-[#FF79C6] px-8 py-4 text-base font-bold text-white hover:opacity-90 transition-opacity shadow-lg shadow-[#FF6B35]/25 dark:shadow-[#FF79C6]/25"
            >
              Browse Notes <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/confessions"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-bold text-white hover:bg-white/10 transition-colors"
            >
              <Sparkles className="h-5 w-5" /> Campus Confessions
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { label: "Semesters", value: "8" },
              { label: "Subjects", value: totalSubjects.toString() },
              { label: "Features", value: "5+" },
              { label: "Cost", value: "Free" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/5 border border-white/10 p-4"
              >
                <p className="text-2xl sm:text-3xl font-extrabold text-white font-satoshi">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          WINNER SPOTLIGHT (Hall of Fame)
      ═══════════════════════════════════════════════ */}
      {winners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-10 pb-16">
          <WinnerSpotlight hydrated={{ winners }} />
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          FEATURES GRID
      ═══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2C4A3E] dark:text-white font-satoshi">
            Everything You Need
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-[#2C4A3E]/60 dark:text-gray-400">
            A complete academic toolkit designed for students of Mianwali.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <Link
                key={feat.title}
                href={feat.href}
                className="group relative flex flex-col rounded-2xl border border-[#2C4A3E]/10 dark:border-[#FF79C6]/10 bg-white dark:bg-[#1a1530] p-6 hover:border-[#FF6B35]/40 dark:hover:border-[#FF79C6]/40 transition-all duration-300 card-glow"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feat.color} ${feat.darkColor} text-white mb-5`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#2C4A3E] dark:text-white group-hover:text-[#FF6B35] dark:group-hover:text-[#FF79C6] transition-colors">
                  {feat.title}
                </h3>
                <p className="mt-2 text-sm text-[#2C4A3E]/60 dark:text-gray-400 leading-relaxed flex-1">
                  {feat.description}
                </p>
                <div className="mt-5 flex items-center text-sm font-bold text-[#FF6B35] dark:text-[#FF79C6] group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="ml-1.5 h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SEMESTERS GRID
      ═══════════════════════════════════════════════ */}
      <section
        id="semesters"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2C4A3E] dark:text-white font-satoshi">
              Browse Semesters
            </h2>
            <p className="mt-2 text-[#2C4A3E]/60 dark:text-gray-400">
              Find your course materials organised by semester.
            </p>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35] dark:text-[#FF79C6] bg-[#FF6B35]/10 dark:bg-[#FF79C6]/10 px-4 py-1.5 rounded-full">
            8 Semesters Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {semesters.map((sem) => (
            <Link
              key={sem.id}
              href={`/semesters/${sem.id}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#2C4A3E]/10 dark:border-[#FF79C6]/10 bg-white dark:bg-[#1a1530] p-6 hover:border-[#FF6B35]/40 dark:hover:border-[#FF79C6]/40 transition-all duration-300 card-glow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#2C4A3E]/10 dark:bg-white/10 text-[#2C4A3E] dark:text-white font-bold text-xl group-hover:bg-[#FF6B35] dark:group-hover:bg-[#FF79C6] group-hover:text-white transition-colors duration-300 font-satoshi">
                    {sem.id}
                  </span>
                  <FolderKanban className="h-6 w-6 text-gray-400 group-hover:text-[#FF6B35] dark:group-hover:text-[#FF79C6] transition-colors duration-300" />
                </div>
                <h3 className="mt-5 font-bold text-xl text-[#2C4A3E] dark:text-white group-hover:text-[#FF6B35] dark:group-hover:text-[#FF79C6] font-satoshi transition-colors duration-300">
                  Semester {sem.id}
                </h3>
                <p className="mt-1.5 text-sm text-[#2C4A3E]/50 dark:text-gray-500">
                  {sem.subjectCount}{" "}
                  {sem.subjectCount === 1 ? "Subject" : "Subjects"} available
                </p>
              </div>

              <div className="mt-6 flex items-center text-sm font-bold text-[#FF6B35] dark:text-[#FF79C6] group-hover:translate-x-2 transition-transform duration-300">
                <span>View Subjects</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-accent py-20 lg:py-24 transition-colors">
        {/* Subtle background pattern / glow overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Icon with glowing backdrop */}
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-md mb-6 shadow-inner text-white animate-float">
            <Users className="h-8 w-8" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-satoshi tracking-tight max-w-2xl mx-auto">
            Join the Mianwali Student Community
          </h2>

          <p className="mt-4 max-w-xl mx-auto text-white/90 text-base sm:text-lg leading-relaxed">
            Sign up to upload notes, post confessions, make study requests, and
            help fellow students grow together.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-bold text-zinc-900 hover:bg-zinc-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
