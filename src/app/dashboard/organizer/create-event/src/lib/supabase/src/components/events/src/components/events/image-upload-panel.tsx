"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ImageUploadPanel({
  image1,
  image2,
  image3,
  setImage1,
  setImage2,
  setImage3
}: any) {

  const [uploading, setUploading] = useState(false);

  async function upload(file: File, slot: number) {

    if (!file) return;

    const ext = file.name.split(".").pop();
    const path = `events/${Date.now()}-${slot}.${ext}`;

    setUploading(true);

    const { error } = await supabase.storage
      .from("event-images")
      .upload(path, file);

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("event-images")
      .getPublicUrl(path);

    const url = data.publicUrl;

    if (slot === 1) setImage1(url);
    if (slot === 2) setImage2(url);
    if (slot === 3) setImage3(url);

    setUploading(false);
  }

  return (
    <div className="rounded-xl border border-purple-500/40 p-6">

      <h3 className="text-lg font-semibold mb-2">
        Event Images
      </h3>

      <p className="text-sm text-zinc-400 mb-6">
        Upload 2 required images, 3 max.  
        Preferred size: <b>1600×2000</b>.  
        Minimum: <b>1200×1500</b>.  
        JPG / PNG / WEBP only. Max 8MB.
      </p>

      <div className="grid grid-cols-3 gap-4">

        <input
          type="file"
          accept="image/*"
          onChange={(e)=> upload(e.target.files![0],1)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e)=> upload(e.target.files![0],2)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e)=> upload(e.target.files![0],3)}
        />

      </div>

      {uploading && (
        <p className="text-sm text-purple-400 mt-3">
          Uploading image...
        </p>
      )}

    </div>
  );
}