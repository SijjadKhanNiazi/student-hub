import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./components/Navbar";
import "./globals.css";
import ThemeProvider from "./theme-provider";
import { plusJakartaSans, inter } from "./fonts";

export const metadata = {
  title: "Mianwali Students Hub",
  description:
    "Academic community platform for local college and university students in Mianwali — notes, confessions, lost & found, GPA calculator and more.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`h-full ${plusJakartaSans.variable} ${inter.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col transition-colors">
          <ThemeProvider>
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <footer className="border-t border-[#2C4A3E]/10 dark:border-[#FF79C6]/10 py-8 text-center transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-sm font-medium text-[#2C4A3E]/60 dark:text-gray-500">
                  © {new Date().getFullYear()} Mianwali Students Hub — Built
                  with ❤️ for students.
                </p>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
