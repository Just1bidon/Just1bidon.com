"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LinkPreviewData {
  title: string | null;
  favicon: string | null;
  hostname: string | null;
}

interface LinkPreviewCardProps {
  link: string;
  fallbackName?: string;
  fallbackImage?: string;
  internalRoute?: string;
}

const FALLBACK_IMAGE = "/Just1bidon_head/Just1bidon_head.jpg"; // à placer dans public/
const FALLBACK_FAVICON = "/Just1bidon_head/Just1bidon_head.jpg"; // à placer dans public/

export default function LinkPreviewCard({
  link,
  fallbackName,
  fallbackImage = FALLBACK_IMAGE,
  internalRoute = "/",
}: LinkPreviewCardProps) {
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/link-preview?url=${encodeURIComponent(link)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Erreur API");
        return res.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [link]);

  const thumioUrl = `https://image.thum.io/get/${encodeURIComponent(link)}`;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a")) return;
    router.push(internalRoute);
  };

  if (loading) {
    return (
      <div
        className="w-full max-w-sm rounded-xl shadow-lg bg-gray-200 animate-pulse"
        style={{ aspectRatio: "6/5" }}
      />
    );
  }

  if (error || !data) {
    return (
      <div
        className="w-full max-w-sm rounded-xl flex flex-col items-center justify-center shadow-lg p-4 cursor-pointer bg-gray-100"
        onClick={handleCardClick}
      >
        <div className="w-full aspect-[6/4] mb-2">
          <img
            src={fallbackImage}
            alt="aperçu"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <img
            src={FALLBACK_FAVICON}
            alt="favicon"
            className="w-8 h-8 rounded-full border border-gray-300"
          />
          <span className="font-semibold text-lg">
            {fallbackName || "Lien externe"}
          </span>
        </div>
        <span className="text-gray-500 text-sm mt-1">
          {link.replace(/^https?:\/\//, "").split("/")[0]}
        </span>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-sm rounded-xl shadow-lg overflow-hidden cursor-pointer bg-black flex flex-col"
      onClick={handleCardClick}
      tabIndex={0}
      aria-label={`Aperçu du site ${
        data.title || fallbackName || data.hostname
      }`}
    >
      {/* Image de preview via thum.io */}
      <div className="w-full aspect-[6/4] relative">
        <img
          src={imgError ? fallbackImage : thumioUrl}
          alt={data.title || fallbackName || "aperçu"}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
      {/* Barre infos sous l'image */}
      <div className="w-full flex items-start gap-3 px-4 py-3 bg-black/90">
        <img
          src={data.favicon || FALLBACK_FAVICON}
          alt="favicon"
          className="w-10 h-10 rounded-full border-2 border-white bg-white shadow shrink-0"
        />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-white text-base font-bold truncate">
            {data.title || fallbackName || data.hostname}
          </span>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 text-sm underline hover:text-white transition-colors truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {data.hostname}
          </a>
        </div>
      </div>
    </div>
  );
}
