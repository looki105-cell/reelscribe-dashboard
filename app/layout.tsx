import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReelScribe",
  description: "Transcribe Instagram Reels into markdown",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
