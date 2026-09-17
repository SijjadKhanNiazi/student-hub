import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./components/Navbar";
import "./globals.css";
import ThemeProvider from "./theme-provider";
import { plusJakartaSans, inter } from "./fonts";

export const metadata = {
  title: "Mianwali Students Hub — Academic Community Platform",
  description:
    "An open academic community platform built for students in Mianwali — access semester notes, post study requests, confessions, lost & found, and calculate CGPA.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`h-full ${plusJakartaSans.variable} ${inter.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col font-sans antialiased transition-colors bg-white dark:bg-[#14121F] text-[#2C4A3E] dark:text-gray-100">
          <ThemeProvider>
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <footer className="border-t border-[#2C4A3E]/10 dark:border-[#FF79C6]/10 py-10 text-center transition-colors bg-[#2C4A3E]/[0.02] dark:bg-[#1a1530]/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
                <p className="text-sm font-medium text-[#2C4A3E]/70 dark:text-gray-400">
                  © {new Date().getFullYear()} Mianwali Students Hub — Built
                  with ❤️ for students.
                </p>
                <p className="text-xs text-[#2C4A3E]/50 dark:text-gray-500 font-medium">
                  Designed & Developed by{" "}
                  <span className="font-bold text-[#FF6B35] dark:text-[#FF79C6]">
                    Sijjad
                  </span>
                </p>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
