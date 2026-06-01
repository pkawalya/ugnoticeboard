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
      { url: "/favicon.ico", sizes: "48x48" },
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
        {/* Inline CSS preloader — shows Uganda flag before React hydrates */}
        <style dangerouslySetInnerHTML={{ __html: `
          #ug-preloader {
            position: fixed; inset: 0; z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            background: #ffffff; transition: opacity 0.3s ease;
          }
          .dark #ug-preloader, [data-theme="dark"] #ug-preloader { background: #030712; }
          #ug-preloader.hide { opacity: 0; pointer-events: none; }
          #ug-preloader-inner { text-align: center; }
          #ug-flag-box {
            display: inline-block; border-radius: 6px; overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.12);
            animation: ug-flag-in 0.5s ease-out both;
          }
          #ug-flag-stripes { display: flex; flex-direction: column; width: 88px; height: 56px; }
          #ug-flag-stripes > div { flex: 1; }
          #ug-spinner {
            margin: 16px auto 12px; width: 28px; height: 28px;
            border: 3px solid #e5e7eb; border-top-color: #FECB00;
            border-right-color: #DE2010; border-radius: 50%;
            animation: ug-spin 0.8s linear infinite;
          }
          #ug-preloader-text {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 13px; font-weight: 600; color: #6b7280;
            animation: ug-text-pulse 2s ease-in-out infinite;
          }
          #ug-preloader-bar {
            margin: 16px auto 0; width: 120px; height: 4px;
            border-radius: 4px; overflow: hidden; display: flex;
          }
          #ug-preloader-bar > div { flex: 1; }
          @keyframes ug-flag-in {
            0% { opacity: 0; transform: scale(0.85) translateY(8px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes ug-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes ug-text-pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        ` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Inline HTML preloader — visible before React hydrates */}
        <div id="ug-preloader">
          <div id="ug-preloader-inner">
            <div id="ug-flag-box">
              <div id="ug-flag-stripes">
                <div style={{ background: '#000000' }}></div>
                <div style={{ background: '#FECB00' }}></div>
                <div style={{ background: '#DE2010' }}></div>
                <div style={{ background: '#000000' }}></div>
                <div style={{ background: '#FECB00' }}></div>
                <div style={{ background: '#DE2010' }}></div>
              </div>
            </div>
            <div id="ug-spinner"></div>
            <div id="ug-preloader-text">Loading Uganda Notice Board</div>
            <div id="ug-preloader-bar">
              <div style={{ background: '#000000' }}></div>
              <div style={{ background: '#FECB00' }}></div>
              <div style={{ background: '#DE2010' }}></div>
              <div style={{ background: '#000000' }}></div>
              <div style={{ background: '#FECB00' }}></div>
              <div style={{ background: '#DE2010' }}></div>
            </div>
          </div>
        </div>
        <ErrorBoundary>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ErrorBoundary>
        <Toaster />
        {/* Script to dismiss the inline preloader once React mounts */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var t=setInterval(function(){
              var p=document.getElementById('ug-preloader');
              var app=document.querySelector('[data-react-root]')||document.getElementById('__next');
              if(!p)return;
              if(app&&app.children.length>0||document.readyState==='complete'){
                p.classList.add('hide');
                setTimeout(function(){if(p.parentNode)p.parentNode.removeChild(p);},400);
                clearInterval(t);
              }
            },100);
            setTimeout(function(){
              var p=document.getElementById('ug-preloader');
              if(p){p.classList.add('hide');setTimeout(function(){if(p.parentNode)p.parentNode.removeChild(p);},400);}
              clearInterval(t);
            },8000);
          })();
        ` }} />
      </body>
    </html>
  );
}
