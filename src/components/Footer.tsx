import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

const footerLinks = {
  Explore: [
    { label: "Home", href: "/" },
    { label: "Semesters", href: "/#semesters" },
    { label: "CMAT preparation", href: "/cmat" },
    { label: "Notices", href: "/notices" },
  ],
  Community: [
    { label: "Why easyBITM?", href: "/#why" },
    { label: "Support us", href: "/#contact" },
    { label: "Send feedback", href: "mailto:easybitm@gmail.com" },
  ],
};

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/easybitm/", Icon: FaInstagram },
  { label: "Facebook", href: "https://www.facebook.com/easybitm/", Icon: FaFacebookF },
  { label: "YouTube", href: "https://www.youtube.com/@easybitm", Icon: FaYoutube },
  { label: "X (formerly Twitter)", href: "https://x.com/easybitm", Icon: FaXTwitter },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/easybitm/", Icon: FaLinkedinIn },
  { label: "GitHub", href: "https://github.com/easybitm", Icon: FaGithub },
];

export default function Footer() {
  return (
    <footer className="border-t border-border" aria-labelledby="footer-heading">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-12 md:grid-cols-[1.3fr_2fr]">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center" aria-label="easyBITM home">
            <Image
              src="/logo.png"
              alt="easyBITM"
              width={96}
              height={28}
              className="hidden [html[data-theme='dark']_&]:block"
            />
            <Image
              src="/logo-light.png"
              alt="easyBITM"
              width={128}
              height={32}
              className="hidden [html[data-theme='light']_&]:block"
            />
          </Link>
          <h2 id="footer-heading" className="sr-only">easyBITM footer</h2>
          <p className="mt-5 max-w-xs text-sm leading-6 text-muted">
            A free, student-focused resource hub for Bachelor in Information
            Technology and Management learners.
          </p>
          <div className="mt-6 flex flex-wrap gap-2" aria-label="Social media links">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`easyBITM on ${label}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:bg-accent hover:text-white"
              >
                <Icon size={17} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold">{title}</h3>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-muted">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    {href.startsWith("mailto:") ? (
                      <a href={href} className="transition-colors hover:text-foreground">
                        {label}
                      </a>
                    ) : (
                      <Link href={href} className="transition-colors hover:text-foreground">
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-2 px-6 py-4 text-xs text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} easyBITM. Built for BITM students.</p>
          <a href="mailto:easybitm@gmail.com" className="inline-flex items-center gap-2 hover:text-foreground">
            <Mail size={14} aria-hidden="true" />
            easybitm@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
