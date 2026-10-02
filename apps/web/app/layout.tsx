import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REASON AXIS",
  description: "Train. Measure. Improve. Cognitive & Career Skills.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
