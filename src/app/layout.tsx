import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/providers/query-provider";
import { ErrorBoundary } from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uganda Community Notice Board — Civic Engagement Platform",
  description:
    "Uganda's national civic communication, accountability, and public engagement platform. Report issues, track government projects, engage with your community, and stay informed with real-time updates from the national level down to the village (LC1) level.",
  keywords: [
    "Uganda",
    "Community Notice Board",
    "Civic Engagement",
    "Public Accountability",
    "Issue Reporting",
    "Government Projects",
    "LC1",
    "District",
    "Village",
    "Citizen Participation",
  ],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='33' fill='%2316a34a'/><rect y='33' width='100' height='34' fill='%23facc15'/><rect y='67' width='100' height='33' fill='%23dc2626'/><circle cx='50' cy='50' r='12' fill='%2316a34a'/></svg>",
  },
  openGraph: {
    title: "Uganda Community Notice Board",
    description:
      "Empowering citizens through civic engagement, transparency, and real-time community updates",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ErrorBoundary>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
