"use client";

import Hero_MusicTransferPage from "@/components/Hero/Hero_MusicTransferPage";
import { useState, useEffect } from "react";
import { getSpotifyToken, testSpotifyAPI } from "@/app/actions/spotify";
import ArtistCard from "@/components/Card/ArtistCard";

interface SpotifyArtist {
  id: string;
  name: string;
  popularity: number;
  followers?: {
    total: number;
  };
  images?: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  genres?: string[];
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [artistData, setArtistData] = useState<SpotifyArtist | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("Non disponible");

  // Fonction pour calculer le temps restant
  const calculateTimeRemaining = (expirationTime: number | null) => {
    if (!expirationTime) return "Non disponible";
    const remainingMs = expirationTime - Date.now();
    if (remainingMs <= 0) return "Expiré";

    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    async function fetchToken() {
      try {
        setLoading(true);
        setError(null);

        const tokenData = await getSpotifyToken();
        setToken(tokenData.accessToken);
        setExpiresAt(tokenData.expiresAt);
        setTimeRemaining(calculateTimeRemaining(tokenData.expiresAt));

        // Tester le token immédiatement
        const artistInfo = await testSpotifyAPI(tokenData.accessToken);
        setArtistData(artistInfo);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur inconnue est survenue"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchToken();

    // Configurer une minuterie pour effacer le token après son expiration
    const timerId = setTimeout(
      () => {
        setToken(null);
        setExpiresAt(null);
        setTimeRemaining("Expiré");
      },
      expiresAt ? expiresAt - Date.now() : 3600000
    );

    // Configurer un intervalle pour mettre à jour le chronomètre
    const intervalId = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(expiresAt));
    }, 1000);

    return () => {
      clearTimeout(timerId);
      clearInterval(intervalId);
    };
  }, [expiresAt]);

  return (
    <section className="w-full h-full flex flex-col justify-center items-center">
      <Hero_MusicTransferPage />
      <section className="max-w-[1200px] w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Statut du Token Spotify</h2>
        <div className="p-4 rounded-md border-1">
          {loading && <p className="text-blue-500">Chargement en cours...</p>}
          {error && <p className="text-red-500">Erreur: {error}</p>}

          {token && (
            <div className="mb-6">
                <p className="font-semibold mb-4">Bearer Token:</p>
                <p className="text-sm break-all bg-gray2 p-4 rounded mb-2">
                  {token}
                </p>

              <p className="text-xs">
                <span className="font-semibold">Expiration:</span>{" "}
                {timeRemaining}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="flex gap-4">
        {artistData && (
          <div className="flex gap-4 h-min">
            <ArtistCard
              image={artistData.images?.[0]?.url || ""}
              name={artistData.name}
              popularity={artistData.popularity}
              genres={artistData.genres || []}
              followers={artistData.followers?.total || 0}
            />
          </div>
        )}
        {artistData && (
          <div className="flex gap-4">
            <ArtistCard
              image={artistData.images?.[0]?.url || ""}
              name={artistData.name}
              popularity={artistData.popularity}
              genres={artistData.genres || []}
              followers={artistData.followers?.total || 0}
              size="large"
            />
          </div>
        )}
      </section>
    </section>
  );
}
