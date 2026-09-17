"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  BookOpen,
  Home,
  Calculator,
  Sparkles,
  MessageSquarePlus,
  Search,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import ThemeToggle from "./ui/ThemeToggle";
import Image from "next/image";

const navLinks = [
  { name: "Semesters", href: "/", icon: Home },
  { name: "Requests", href: "/requests", icon: MessageSquarePlus },
  { name: "Alumni Directory", href: "/alumni", icon: GraduationCap },
  { name: "Lost & Found", href: "/lost-found", icon: Search },
  { name: "Confessions", href: "/confessions", icon: Sparkles },
  { name: "CGPA Calc", href: "/cgpa-calculator", icon: Calculator },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled
          ? "color-mix(in srgb, var(--brand-bg) 96%, transparent)"
          : "var(--brand-bg)",
        borderBottom: `1px solid color-mix(in srgb, var(--brand-struct) ${scrolled ? "10" : "7"}%, transparent)`,
        backdropFilter: scrolled ? "blur(16px)" : "none",
        boxShadow: scrolled
          ? "0 1px 12px color-mix(in srgb, var(--brand-struct) 6%, transparent)"
          : "none",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="flex h-15 items-center justify-between gap-4"
          style={{ height: "60px" }}
        >
          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div
              className="rounded-xl overflow-hidden shrink-0"
              style={{
                boxShadow:
                  "0 0 0 1.5px color-mix(in srgb, var(--brand-struct) 10%, transparent)",
              }}
            >
              <Image
                src="/images/logo.jpg"
                alt="Mianwali Hub"
                width={32}
                height={32}
                className="h-8 w-8 object-cover"
              />
            </div>
            <span
              className="font-mono font-bold text-base tracking-tight"
              style={{ color: "var(--brand-accent)" }}
            >
              Mianwali Hub
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: isActive
                      ? "var(--brand-accent)"
                      : "color-mix(in srgb, var(--brand-struct) 70%, transparent)",
                    backgroundColor: isActive
                      ? "color-mix(in srgb, var(--brand-accent) 8%, transparent)"
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor =
                        "color-mix(in srgb, var(--brand-struct) 6%, transparent)";
                      e.currentTarget.style.color = "var(--brand-struct)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color =
                        "color-mix(in srgb, var(--brand-struct) 70%, transparent)";
                    }
                  }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{link.name}</span>
                  {/* Active underline dot */}
                  {isActive && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                      style={{ backgroundColor: "var(--brand-accent)" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            {/* Signed in */}
            <Show when="signed-in">
              <UserButton />
            </Show>

            {/* Signed out — desktop only */}
            <Show when="signed-out">
              <div className="hidden sm:flex items-center gap-2">
                <SignInButton mode="modal">
                  <button
                    className="rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--brand-struct) 18%, transparent)",
                      color: "var(--brand-struct)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "color-mix(in srgb, var(--brand-struct) 6%, transparent)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                    style={{ backgroundColor: "var(--brand-accent)" }}
                  >
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </Show>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg transition-colors cursor-pointer"
              style={{ color: "var(--brand-struct)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "color-mix(in srgb, var(--brand-struct) 7%, transparent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: open ? "420px" : "0px",
          opacity: open ? 1 : 0,
          borderTop: open
            ? `1px solid color-mix(in srgb, var(--brand-struct) 8%, transparent)`
            : "none",
        }}
      >
        <div
          className="px-4 py-3 space-y-1"
          style={{ backgroundColor: "var(--brand-bg)" }}
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  color: isActive
                    ? "var(--brand-accent)"
                    : "var(--brand-struct)",
                  backgroundColor: isActive
                    ? "color-mix(in srgb, var(--brand-accent) 8%, transparent)"
                    : "transparent",
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.name}
                {isActive && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: "var(--brand-accent)" }}
                  />
                )}
              </Link>
            );
          })}

          {/* Mobile auth */}
          <Show when="signed-out">
            <div
              className="mt-2 pt-3 flex flex-col gap-2"
              style={{
                borderTop: `1px solid color-mix(in srgb, var(--brand-struct) 8%, transparent)`,
              }}
            >
              <SignInButton mode="modal">
                <button
                  className="w-full rounded-xl border py-2.5 text-sm font-semibold transition-colors cursor-pointer"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--brand-struct) 18%, transparent)",
                    color: "var(--brand-struct)",
                  }}
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  className="w-full rounded-xl py-2.5 text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "var(--brand-accent)" }}
                >
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
