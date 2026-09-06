"use client";

import { X } from "lucide-react";

function getYoutubeEmbedUrl(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  return match
    ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&controls=1&rel=0&playsinline=1`
    : url;
}

export default function VideoModal({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="presentation"
    >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute right-65 top-28 z-300 flex h-15 w-15 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
        >
          <X size={20} />
        </button>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={getYoutubeEmbedUrl(url)}
            title={title}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
