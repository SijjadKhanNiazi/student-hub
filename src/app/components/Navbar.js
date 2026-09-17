"use client";

import { useState } from "react";
import Link from "next/link";
import { Show, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  BookOpen,
  Home,
  Calculator,
  Sparkles,
  MessageSquarePlus,
  Search,
  Menu,
  X,
} from "lucide-react";
import ThemeToggle from "./ui/ThemeToggle";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Semesters", href: "/", icon: Home },
    { name: "Requests", href: "/requests", icon: MessageSquarePlus },
    { name: "Lost & Found", href: "/lost-found", icon: Search },
    { name: "Confessions", href: "/confessions", icon: Sparkles },
    { name: "CGPA Calc", href: "/cgpa-calculator", icon: Calculator },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#2C4A3E]/10 dark:border-[#FF79C6]/10 bg-[#FCFBF7]/95 dark:bg-[#14121F]/95 backdrop-blur-xl transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* ─── Logo ─── */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-bold text-lg text-[#FF6B35] dark:text-[#FF79C6] font-satoshi hover:opacity-80 transition-opacity"
          >
            <BookOpen className="h-6 w-6" />
            <span>Mianwali Hub</span>
          </Link>

          {/* ─── Desktop Nav Links ─── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#2C4A3E] dark:text-gray-300 hover:bg-[#2C4A3E]/5 dark:hover:bg-[#FF79C6]/10 hover:text-[#FF6B35] dark:hover:text-[#FF79C6] transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* ─── Right Actions ─── */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Clerk auth – signed in */}
            <Show when="signed-in">
              <UserButton afterSignOutUrl="/" />
            </Show>
            <Show when="signed-out">
              <SignInButton />
            </Show>

            {/* Clerk auth – signed out */}
            <Show when="signed-out">
              <div className="hidden sm:flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="rounded-lg border border-[#2C4A3E]/20 dark:border-[#FF79C6]/30 px-4 py-2 text-sm font-semibold text-[#2C4A3E] dark:text-gray-200 hover:bg-[#2C4A3E]/5 dark:hover:bg-[#FF79C6]/10 transition-colors cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-[#FF6B35] dark:bg-[#FF79C6] hover:opacity-90 transition-opacity cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </Show>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-[#2C4A3E] dark:text-gray-300 hover:bg-[#2C4A3E]/5 dark:hover:bg-[#FF79C6]/10 transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mobile Slide-down ─── */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#2C4A3E]/10 dark:border-[#FF79C6]/10 bg-[#FCFBF7] dark:bg-[#14121F]">
          <nav className="space-y-1 px-4 py-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-[#2C4A3E] dark:text-gray-300 hover:bg-[#2C4A3E]/5 dark:hover:bg-[#FF79C6]/10 hover:text-[#FF6B35] dark:hover:text-[#FF79C6] transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}

            <Show when="signed-out">
              <div className="mt-3 pt-3 border-t border-[#2C4A3E]/10 dark:border-[#FF79C6]/10 flex flex-col gap-2">
                <SignInButton mode="modal">
                  <button className="w-full rounded-lg border border-[#2C4A3E]/20 dark:border-[#FF79C6]/30 px-4 py-3 text-sm font-semibold text-[#2C4A3E] dark:text-gray-200 hover:bg-[#2C4A3E]/5 dark:hover:bg-[#FF79C6]/10 transition-colors cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white bg-[#FF6B35] dark:bg-[#FF79C6] hover:opacity-90 transition-opacity cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </nav>
        </div>
      )}
    </header>
  );
}
