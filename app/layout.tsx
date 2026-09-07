import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "easyBITM | Bachelor in Information Technology and Management",
    template: "%s | easyBITM",
  },
  description:
    "easyBITM is a resource hub for BITM students, offering semester resources, CMAT preparation materials, notices, and helpful academic information.",

  keywords: [
    "easyBITM",
    "BITM",
    "Bachelor in Information Technology and Management",
    "Tribhuvan University BITM",
    "BITM Nepal",
    "BITM notes",
    "BITM resources",
    "CMAT preparation",
  ],

  verification: {
    google: "59RFzlcrOVtSGe2gMoP7DuElt7iAECAR00951ECan0s",
  },

  openGraph: {
    title: "easyBITM | BITM Resources & Study Hub",
    description:
      "Resources, semester materials, CMAT preparation, and notices for BITM students.",
    type: "website",
    siteName: "easyBITM",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}