"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type ImageUploadPanelProps = {
  image1: string;
  image2: string;
  image3: string;
  setImage1: (value: string) => void;
  setImage2: (value: string) => void;
  setImage3: (value: string) => void;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 8;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ImageUploadPanel({
  image1,
  image2,
  image3,
  setImage1,
  setImage2,
  setImage3,
}: ImageUploadPanelProps) {
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");

  const coverPreview = useMemo(() => image1 || "", [image1]);

  async function uploadFile(file: File, slot: 1 | 2 | 3) {
    try {
      setUploadMessage("");

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploadMessage("Only JPG, PNG, and WEBP images are allowed.");
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadMessage(`Each image must be ${MAX_FILE_SIZE_MB}MB or less.`);
        return;
      }

      setUploadingSlot(slot);

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `events/${Date.now()}-${slot}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setUploadMessage(uploadError.message);
        setUploadingSlot(null);
        return;
      }

      const { data } = supabase.storage.from("event-images").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      if (slot === 1) setImage1(publicUrl);
      if (slot === 2) setImage2(publicUrl);
      if (slot === 3) setImage3(publicUrl);

      setUploadMessage("Image uploaded successfully.");
      setUploadingSlot(null);
    } catch {
      setUploadMessage("Upload failed. Please try again.");
      setUploadingSlot(null);
    }
  }

  async function onFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
    slot: 1 | 2 | 3
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadFile(file, slot);
  }

  function imageCard(
    label: string,
    slot: 1 | 2 | 3,
    imageUrl: string,
    required: boolean
  ) {
    const isUploading = uploadingSlot === slot;

    return (
      <div className="rounded-2xl border border-[#A259FF]/70 bg-zinc-950/70 p-4">
        <p className="text-sm font-medium text-white">
          {label} {required ? "required" : "optional"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Preferred size: 1600×2000 or larger. Portrait works best for event cards.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Minimum: 1200×1500. JPG, PNG, WEBP. Max 8MB.
        </p>

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => onFileChange(e, slot)}
          className="mt-4 block w-full text-sm text-zinc-300 file:mr-4 file:rounded-xl file:border-0 file:bg-[#A259FF] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#8E44EC]"
        />

        <div className="mt-4 overflow-hidden rounded-2xl border border-[#A259FF]/55 bg-black/40">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${label} preview`}
              className="h-56 w-full object-cover"
            />
          ) : (
            <div className="flex h-56 items-center justify-center text-sm text-zinc-500">
              {isUploading ? "Uploading..." : "Not uploaded"}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#A259FF]/75 bg-black/30 p-5">
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-white">Event Images</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Upload 2 required images, 3 max. The first image becomes the live cover preview.
        </p>
      </div>

      <div className="mb-6 overflow-hidden rounded-[28px] border border-[#A259FF]/70 bg-zinc-950/70">
        {coverPreview ? (
          <img
            src={coverPreview}
            alt="Cover preview"
            className="h-[340px] w-full object-cover"
          />
        ) : (
          <div className="flex h-[340px] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(162,89,255,0.24),transparent_45%),#09090b] text-sm text-zinc-500">
            Cover preview updates after first upload
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {imageCard("Image 1", 1, image1, true)}
        {imageCard("Image 2", 2, image2, true)}
        {imageCard("Image 3", 3, image3, false)}
      </div>

      {uploadMessage ? (
        <div className="mt-4 rounded-xl border border-[#A259FF]/55 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-200">
          {uploadMessage}
        </div>
      ) : null}
    </div>
  );
}
