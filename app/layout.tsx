import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = { title: "Fyloo Pin Scheduler", description: "Single-user Pinterest scheduling app for Fyloo" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <span style={{ fontWeight: 800, color: "#b3001b" }}>Fyloo Pin Scheduler</span>
          <Link href="/">Connect</Link>
          <Link href="/boards">Boards</Link>
          <Link href="/compose">Composer</Link>
          <Link href="/queue">Queue</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
