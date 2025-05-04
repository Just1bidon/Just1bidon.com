"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks";
import Image from "next/image";

export type CardData = {
  title: string;
  description: string;
  src: string;
  ctaText: string;
  ctaLink: string;
  content: React.ReactNode | (() => React.ReactNode);
  url?: string; // URL optionnelle pour la preview de lien
};

// Type pour les données de preview de lien
interface LinkPreviewData {
  title: string | null;
  favicon: string | null;
  hostname: string | null;
}

interface ExpandableCardProps {
  cards: CardData[];
  variant?: "standard" | "grid";
}

const FALLBACK_FAVICON = "/Just1bidon_head/Just1bidon_head.jpg"; // à placer dans public/
const FALLBACK_IMAGE = "/Just1bidon_head/Just1bidon_head.jpg"; // à placer dans public/

export default function ExpandableCard({
  cards,
  variant = "standard",
}: ExpandableCardProps) {
  const [active, setActive] = useState<CardData | boolean | null>(null);
  const [linkPreviews, setLinkPreviews] = useState<
    Record<string, LinkPreviewData>
  >({});
  const [loadingPreviews, setLoadingPreviews] = useState<
    Record<string, boolean>
  >({});
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  // Taille unique pour toutes les previews (plus grande)
  const PREVIEW_WIDTH = 800;
  const PREVIEW_HEIGHT = 520;
  const [screenshotCache, setScreenshotCache] = useState<
    Record<string, string>
  >({});
  const [imageBlobCache, setImageBlobCache] = useState<Record<string, string>>(
    {}
  );

  const getOrCreateScreenshotUrl = (url: string) => {
    const cacheKey = `${url}|${PREVIEW_WIDTH}|${PREVIEW_HEIGHT}`;
    if (screenshotCache[cacheKey]) return screenshotCache[cacheKey];
    const params = new URLSearchParams({
      url,
      width: PREVIEW_WIDTH.toString(),
      height: PREVIEW_HEIGHT.toString(),
      format: "jpeg",
    });
    const apiUrl = `/api/proxy-screenshot?${params.toString()}`;
    setScreenshotCache((prev) => ({ ...prev, [cacheKey]: apiUrl }));
    return apiUrl;
  };

  // Fonction pour charger et cacher l'image blob
  const fetchAndCacheScreenshot = async (url: string) => {
    const cacheKey = `${url}|${PREVIEW_WIDTH}|${PREVIEW_HEIGHT}`;
    if (imageBlobCache[cacheKey]) return imageBlobCache[cacheKey];
    const params = new URLSearchParams({
      url,
      width: PREVIEW_WIDTH.toString(),
      height: PREVIEW_HEIGHT.toString(),
      format: "jpeg",
    });
    const apiUrl = `/api/proxy-screenshot?${params.toString()}`;
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Erreur lors du chargement du screenshot");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      setImageBlobCache((prev) => ({ ...prev, [cacheKey]: blobUrl }));
      return blobUrl;
    } catch (e) {
      return apiUrl; // fallback sur l'URL proxy si erreur
    }
  };

  // Récupérer les previews pour les cartes qui ont une URL
  useEffect(() => {
    const cardsWithUrls = cards.filter((card) => card.url);
    if (cardsWithUrls.length === 0) return;

    // Initialiser les états de chargement
    const initialLoadingState: Record<string, boolean> = {};
    cardsWithUrls.forEach((card) => {
      if (card.url) initialLoadingState[card.url] = true;
    });
    setLoadingPreviews(initialLoadingState);

    // Récupérer les données pour chaque URL
    cardsWithUrls.forEach((card) => {
      if (!card.url) return;

      fetch(`/api/link-preview?url=${encodeURIComponent(card.url)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Erreur API");
          return res.json();
        })
        .then((data) => {
          setLinkPreviews((prev) => ({
            ...prev,
            [card.url as string]: data,
          }));
        })
        .catch((err) => {
          console.error("Erreur lors de la récupération de la preview:", err);
        })
        .finally(() => {
          setLoadingPreviews((prev) => ({
            ...prev,
            [card.url as string]: false,
          }));
        });
    });
  }, [cards]);

  // Précharger les images des cartes avec une URL
  useEffect(() => {
    const cardsWithUrls = cards.filter((card) => card.url);
    cardsWithUrls.forEach((card) => {
      const cacheKey = `${card.url}|${PREVIEW_WIDTH}|${PREVIEW_HEIGHT}`;
      if (!imageBlobCache[cacheKey]) {
        fetchAndCacheScreenshot(card.url!);
      }
    });
  }, [cards]);

  const handleImageError = (url: string) => {
    setImgErrors((prev) => ({
      ...prev,
      [url]: true,
    }));
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref as React.RefObject<HTMLDivElement>, () =>
    setActive(null)
  );

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.title}-${id}`}>
                {active.url && !imgErrors[active.url] ? (
                  <div
                    className="relative w-full"
                    style={{
                      aspectRatio: `${PREVIEW_WIDTH}/${PREVIEW_HEIGHT}`,
                    }}
                  >
                    <Image
                      src={
                        imageBlobCache[
                          `${active.url}|${PREVIEW_WIDTH}|${PREVIEW_HEIGHT}`
                        ] || getOrCreateScreenshotUrl(active.url)
                      }
                      alt={active.title}
                      fill
                      className="object-cover object-top"
                      onError={() => handleImageError(active.url as string)}
                      unoptimized
                    />
                  </div>
                ) : (
                  <Image
                    width={PREVIEW_WIDTH}
                    height={PREVIEW_HEIGHT}
                    src={active.src}
                    alt={active.title}
                    className="w-full object-cover object-top"
                  />
                )}
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4 gap-4">
                  <div className="min-w-0">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200"
                    >
                      {active.url && linkPreviews[active.url]?.title
                        ? linkPreviews[active.url].title
                        : active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400 line-clamp-2"
                    >
                      {active.url ? (
                        <a
                          href={active.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-gray-700 underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {linkPreviews[active.url]?.hostname ||
                            active.url.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        active.description
                      )}
                    </motion.p>
                  </div>

                  <motion.a
                    layoutId={`button-${active.title}-${id}`}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white min-w-[120px] text-center"
                  >
                    {active.ctaText}
                  </motion.a>
                </div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {variant === "grid" ? (
        // Version Grid
        <ul className="max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 items-start gap-4">
          {cards.map((card) => (
            <motion.div
              layoutId={`card-${card.title}-${id}`}
              key={card.title}
              onClick={() => setActive(card)}
              className="p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
            >
              <div className="flex gap-4 flex-col w-full">
                <motion.div
                  layoutId={`image-${card.title}-${id}`}
                  className="w-full aspect-[6/4] relative"
                >
                  {card.url && !imgErrors[card.url] ? (
                    <div
                      className="relative w-full"
                      style={{
                        aspectRatio: `${PREVIEW_WIDTH}/${PREVIEW_HEIGHT}`,
                      }}
                    >
                      <Image
                        src={
                          imageBlobCache[
                            `${card.url}|${PREVIEW_WIDTH}|${PREVIEW_HEIGHT}`
                          ] || getOrCreateScreenshotUrl(card.url)
                        }
                        alt={card.title}
                        fill
                        className="object-cover object-top rounded-lg"
                        onError={() => handleImageError(card.url as string)}
                        unoptimized
                      />
                    </div>
                  ) : (
                    <Image
                      width={PREVIEW_WIDTH}
                      height={PREVIEW_HEIGHT}
                      src={card.src}
                      alt={card.title}
                      className="w-full rounded-lg object-cover object-top"
                    />
                  )}
                </motion.div>
                <div className="flex justify-between items-start w-full">
                  <div className="flex flex-col">
                    <motion.h3
                      layoutId={`title-${card.title}-${id}`}
                      className="font-medium text-neutral-800 dark:text-neutral-200 text-left text-base"
                    >
                      {card.url && linkPreviews[card.url]?.title
                        ? linkPreviews[card.url].title
                        : card.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${card.description}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400 text-left line-clamp-2"
                    >
                      {card.url ? (
                        loadingPreviews[card.url] ? (
                          <span className="text-gray-400">
                            Chargement du lien...
                          </span>
                        ) : (
                          <a
                            href={card.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {linkPreviews[card.url]?.hostname ||
                              card.url.replace(/^https?:\/\//, "")}
                          </a>
                        )
                      ) : (
                        card.description
                      )}
                    </motion.p>
                  </div>
                  {card.url && linkPreviews[card.url]?.favicon && (
                    <div className="relative w-8 h-8 shrink-0">
                      <Image
                        src={linkPreviews[card.url].favicon || FALLBACK_FAVICON}
                        alt="favicon"
                        width={32}
                        height={32}
                        className="rounded-full object-cover shadow-sm"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </ul>
      ) : (
        // Version Standard
        <ul className="max-w-2xl mx-auto w-full">
          {cards.map((card) => (
            <motion.div
              layoutId={`card-${card.title}-${id}`}
              key={`card-${card.title}-${id}`}
              onClick={() => setActive(card)}
              className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
            >
              <div className="flex gap-4 flex-col md:flex-row flex-1 items-center md:items-start">
                <motion.div layoutId={`image-${card.title}-${id}`}>
                  {card.url && linkPreviews[card.url]?.favicon ? (
                    <div className="relative w-16 h-16">
                      <Image
                        src={linkPreviews[card.url].favicon || FALLBACK_FAVICON}
                        alt={card.title}
                        width={64}
                        height={64}
                        className="rounded-lg object-cover object-center bg-white"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <Image
                      width={64}
                      height={64}
                      src={card.src}
                      alt={card.title}
                      className="h-16 w-16 rounded-lg object-cover object-top"
                    />
                  )}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <motion.h3
                    layoutId={`title-${card.title}-${id}`}
                    className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                  >
                    {card.url && linkPreviews[card.url]?.title
                      ? linkPreviews[card.url].title
                      : card.title}
                  </motion.h3>
                  <motion.p
                    layoutId={`description-${card.description}-${id}`}
                    className="text-neutral-600 dark:text-neutral-400 text-center md:text-left line-clamp-1"
                  >
                    {card.url ? (
                      loadingPreviews[card.url] ? (
                        <span className="text-gray-400">
                          Chargement du lien...
                        </span>
                      ) : (
                        <a
                          href={card.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-gray-700 underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {linkPreviews[card.url]?.hostname ||
                            card.url.replace(/^https?:\/\//, "")}
                        </a>
                      )
                    ) : (
                      card.description
                    )}
                  </motion.p>
                </div>
              </div>
              <motion.button
                layoutId={`button-${card.title}-${id}`}
                className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black mt-4 md:mt-0 shrink-0"
                style={{ minWidth: 120 }}
              >
                {card.ctaText}
              </motion.button>
            </motion.div>
          ))}
        </ul>
      )}
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

// Exemple d'utilisation
export const cardExemple = [
  {
    title: "Projet Voltaire-inator",
    description: "Extension pour Projet Voltaire",
    src: "/Just1bidon_head/Just1bidon_head.jpg",
    ctaText: "Voir le projet",
    ctaLink: "https://www.projet-voltaire-inator.fr/",
    url: "https://www.projet-voltaire-inator.fr/",
    content: () => (
      <>
        <p>
          Le Projet &apos;Projet Voltaire-inator&apos; est un projet qui permet
          de savoir si vous êtes un projet Voltaire ou non.
        </p>
        <p>Contenu du projet</p>
      </>
    ),
  },
  // ...autres cartes
];
