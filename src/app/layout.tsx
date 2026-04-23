import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Providers } from "@/components/Web3Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CollabOS — Autonomous Builder Economy",
  description:
    "Real-time reputation scoring and grant streaming for builder squads on Monad Testnet. Powered by on-chain oracles.",
  keywords: ["CollabOS", "Monad", "Web3", "Builder Economy", "DAO", "Grants"],
  openGraph: {
    title: "CollabOS — Autonomous Builder Economy",
    description: "Real-time reputation scoring and grant streaming on Monad Testnet",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Web3Providers>{children}</Web3Providers>
      </body>
    </html>
  );
}
