import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Providers from "@/components/providers";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crucible — Design it. Ship it. Defend it.",
  description:
    "A simulation-based learning platform where students design cloud architectures, review pull requests for subtle bugs, and triage production incidents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.className} antialiased bg-black text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
