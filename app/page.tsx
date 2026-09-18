import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { getSemesters } from "../src/lib/data";
import darkthemeImage from "./dark-theme.png";
import bitmHomepageImage from "./bitmhomepage.png";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BITM Notes, Resources & Study Materials",
  description:
    "Find organized notes, lessons, syllabi, videos, and question papers for Bachelor in Information Technology and Management students.",
  openGraph: {
    title: "BITM Notes, Resources & Study Materials | easyBITM",
    description:
      "Organized semester resources and study materials for BITM students.",
  },
};

export default async function Home() {
  const semesters = await getSemesters({ includeHidden: true });
  const visibleSemesters = semesters.filter((s) => s.is_visible);
  const stats = [
    { label: "Semesters Covered", value: `${visibleSemesters.length || 8}` },
    { label: "Cost to Use", value: "Free" },
  ];

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1">

        <section className="flex flex-col items-center justify-center flex-1 px-4 py-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 sm:text-5xl">
            Go to ADMIN PANEL 
          </h1>
		  <Link href="/admin" className="mt-6 px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Access Admin Panel
          </Link>
        </section>
      </div>
    </div>
  );
}
