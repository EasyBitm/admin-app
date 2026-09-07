"use client";

import { useEffect, useState } from "react";
import { FileText, Play, X, type LucideIcon } from "lucide-react";
import VideoModal from "./VideoModal";

export default function MediaModalButton({
  url,
  title,
  label,
  kind,
  className,
}: {
  url: string;
  title: string;
  label: string;
  kind: "video" | "pdf";
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const Icon: LucideIcon = kind === "video" ? Play : FileText;

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <Icon size={14} className={kind === "video" ? "fill-current" : undefined} />
        {label}
      </button>

      {open && kind === "video" ? (
        <VideoModal url={url} title={title} onClose={() => setOpen(false)} />
      ) : open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={`Close ${title}`}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            >
              <X size={20} />
            </button>
            <iframe
              src={`${url}#toolbar=1`}
              title={title}
              className="h-[80vh] w-full bg-surface"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
