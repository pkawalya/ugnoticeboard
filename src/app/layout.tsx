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
    icon: [
      { url: "/favicon.ico", sizes: "256x256" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
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
      <head>
        {/* Global chunk load error handler — auto-reloads on stale chunks after deployment */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                function isChunkError(e){
                  var m=e&&e.message||'';
                  return m.indexOf('Loading chunk')!==-1||m.indexOf('Failed to load chunk')!==-1||m.indexOf('Loading CSS chunk')!==-1||m.indexOf('dynamically imported module')!==-1;
                }
                window.addEventListener('error',function(e){
                  if(isChunkError(e.error||e)){window.location.reload();}
                });
                window.addEventListener('unhandledrejection',function(e){
                  if(e.reason&&isChunkError(e.reason)){e.preventDefault();window.location.reload();}
                });
              })();
            `,
          }}
        />
      </head>
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
