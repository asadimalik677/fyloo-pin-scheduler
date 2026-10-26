import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Fyloo Pin Scheduler — Modern Pinterest Automation SaaS",
  description: "Automate pin publishing, bulk scheduling, keyword research, and analytics on autopilot.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
