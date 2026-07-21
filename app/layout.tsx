import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReelScribe",
  description: "Transcribe Instagram Reels into markdown",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
