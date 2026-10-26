import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Fyloo Pin Scheduler — Artisanal Pinterest Automation",
  description: "Handcrafted pin publishing and scheduling on autopilot for maker and artisan shops.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
