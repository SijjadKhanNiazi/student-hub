import Link from "next/link";
import {
  Rocket,
  Users,
  ShieldAlert,
  Award,
  Layers,
  CalendarCheck,
  CheckCircle2,
  MessageCircle,
  FileText,
  Cpu,
  BarChart3,
} from "lucide-react";

export default function FypSurvivalGuide() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-accent p-8 sm:p-12 text-white shadow-2xl text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-md shadow-inner text-white animate-float mb-2">
              <Rocket className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-satoshi tracking-tight">
              The Ultimate FYP Survival Guide
            </h1>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              Navigating your Final Year Project can feel overwhelming, but
              breaking it down phase by phase makes it manageable. This
              comprehensive guide covers everything you need to know—from
              initial project selection to final submission.
            </p>
          </div>
        </div>

        {/* Timeline / Guides Grid */}
        <div className="space-y-6">
          {/* Phase 1 */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xl shadow-zinc-100 dark:shadow-none transition-all hover:border-accent/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-accent/10 text-accent font-bold text-lg">
                01
              </div>
              <div>
                <h2 className="text-xl font-bold font-satoshi text-zinc-900 dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" /> Team Formation &
                  Project Selection
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 p-5 border border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-accent" /> Team Size
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Aim for{" "}
                  <strong className="text-zinc-900 dark:text-white">
                    3 team members
                  </strong>
                  . Fewer or more often leads to coordination friction and
                  workload imbalance.
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 p-5 border border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-accent" /> AI / ML / DL Mandate
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Must incorporate AI, ML, or DL components. Without
                  automation/intelligence, proposals risk outright rejection.
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 p-5 border border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-accent" /> The Backup
                  Plan
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Keep at least{" "}
                  <strong className="text-zinc-900 dark:text-white">
                    2 ideas
                  </strong>{" "}
                  ready. First-choice rejection rates hover around 80% during
                  defenses.
                </p>
              </div>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xl shadow-zinc-100 dark:shadow-none transition-all hover:border-accent/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-accent/10 text-accent font-bold text-lg">
                02
              </div>
              <div>
                <h2 className="text-xl font-bold font-satoshi text-zinc-900 dark:text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" /> The First Project
                  Defense
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  The official kick-off journey with your evaluation panel.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 p-5 border border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">
                    The Panel & Focus
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Evaluated by an external examiner + university professors.
                    They test your conceptual grip, vision clarity, and depth
                    through direct Q&A.
                  </p>
                </div>

                <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 p-5 border border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">
                    Benchmarks & Scope
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Demonstrate how your solution beats existing competitors.
                    Scope is checked via MS Project{" "}
                    <strong className="text-zinc-900 dark:text-white">
                      Gantt Charts
                    </strong>
                    .
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-accent/5 dark:bg-accent/10 p-5 border border-accent/20">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-accent" /> Key UML Artifacts
                  Examined
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                  Use tools like Visual Paradigm Online or StarUML for
                  structural designs:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-xl bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-xs">
                    Use Case Diagram
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-xs">
                    Class Diagram
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-xs">
                    Architectural Diagram
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 3 & 4 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Semester 7 */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xl shadow-zinc-100 dark:shadow-none flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-2xl bg-accent/10 text-accent font-bold">
                    03
                  </div>
                  <h2 className="text-lg font-bold font-satoshi text-zinc-900 dark:text-white">
                    Semester 7: Frontend & Interim Viva
                  </h2>
                </div>
                <ul className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-zinc-900 dark:text-white">
                        Milestone Goal:
                      </strong>{" "}
                      Complete the fully functional frontend of your
                      application.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-zinc-900 dark:text-white">
                        Deliverables:
                      </strong>{" "}
                      Frontend implementation, Part 1 of FYP report, and SRS
                      document.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-zinc-900 dark:text-white">
                        Evaluation:
                      </strong>{" "}
                      Presentation & viva with an external teacher and
                      university faculty (no written exam).
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Semester 8 */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xl shadow-zinc-100 dark:shadow-none flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-2xl bg-accent/10 text-accent font-bold">
                    04
                  </div>
                  <h2 className="text-lg font-bold font-satoshi text-zinc-900 dark:text-white">
                    Semester 8: Full Stack & Final Viva
                  </h2>
                </div>
                <ul className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-2">
                    <CalendarCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-zinc-900 dark:text-white">
                        Milestone Goal:
                      </strong>{" "}
                      Wrap up full-stack implementation, system testing, and
                      documentation.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CalendarCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-zinc-900 dark:text-white">
                        Final Viva:
                      </strong>{" "}
                      Smoother and more straightforward compared to earlier
                      milestone defenses.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CalendarCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-zinc-900 dark:text-white">
                        Hardcopies:
                      </strong>{" "}
                      Print{" "}
                      <strong className="text-zinc-900 dark:text-white">
                        3 bound copies
                      </strong>{" "}
                      matching exact university color specifications.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Need Help / WhatsApp CTA Section */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 sm:p-12 text-center shadow-xl space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold font-satoshi text-zinc-900 dark:text-white">
              Need Help with Your FYP?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              For any guidance, mentorship, or troubleshooting assistance with
              your project architecture, ideas, or defense preparation, feel
              free to reach out. Always here to help out our juniors!
            </p>
          </div>

          <div>
            <a
              href="https://wa.me/923144919624"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white px-8 py-4 text-sm font-bold shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <MessageCircle className="h-5 w-5 fill-current" />
              <span>Contact via WhatsApp (03144919624)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
