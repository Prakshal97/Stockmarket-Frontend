import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlphaIntel | NSE/BSE AI Agent",
  description: "Real-time AI analysis of NSE/BSE corporate announcements",
  icons: {
    icon: "/alphaintel.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
