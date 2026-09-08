"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, X } from "lucide-react";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  userId: string;
  onAvatarChange?: (url: string | null) => void;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-10 w-10 text-sm",
  md: "h-16 w-16 text-xl",
  lg: "h-24 w-24 text-3xl",
};

const avatarSizeMap = {
  sm: "h-10 w-10 rounded-full object-cover ring-2 ring-border",
  md: "h-16 w-16 rounded-full object-cover ring-2 ring-border",
  lg: "h-24 w-24 rounded-full object-cover ring-2 ring-border",
};

export default function ProfileAvatar({
  avatarUrl,
  userId,
  onAvatarChange,
  size = "md",
}: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [hover, setHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file.");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
        return;
      }

      setUploading(true);

      try {
        const { uploadAvatar } = await import("../lib/profiles");
        const url = await uploadAvatar(file, userId);

        onAvatarChange?.(url);
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to upload avatar. Please try again.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [userId, onAvatarChange]
  );

  return (
    <div className="relative inline-block">
      {/* Avatar Image */}
      {avatarUrl ? (
        <>
          <img
            src={avatarUrl}
            alt="Profile"
            className={avatarSizeMap[size]}
          />
          {/* Hover overlay */}
          <div
            className={`absolute inset-0 cursor-pointer rounded-full bg-black/50 flex items-center justify-center opacity-0 transition-opacity ${
              hover ? "opacity-100" : ""
            }`}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer flex items-center gap-1.5 text-white text-sm font-medium hover-red"
            >
              <Camera size={16} />
              Change
            </label>
          </div>
        </>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`inline-flex items-center justify-center rounded-full bg-surface-2 border border-border text-muted hover:border-accent transition-colors ${
            sizeMap[size]
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {uploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          ) : (
            <>
              <Camera size={size === "sm" ? 14 : size === "md" ? 18 : 24} />
              <span className="ml-1.5">Add</span>
            </>
          )}
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {/* Delete button (shown when avatar exists and hovered) */}
      {avatarUrl && (
        <button
          onClick={async () => {
            if (!confirm("Remove your profile picture?")) return;
            try {
              const { deleteAvatar } = await import("../lib/profiles");
              await deleteAvatar(avatarUrl);
              onAvatarChange?.(null);
            } catch (err) {
              console.error("Delete failed:", err);
              alert("Failed to remove avatar.");
            }
          }}
          className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-red text-white flex items-center justify-center text-xs shadow-md transition-opacity hover:opacity-90"
          title="Remove avatar"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}
