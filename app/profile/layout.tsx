import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Profile",
  description: "Sign in to manage your easyBITM profile and study progress.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
