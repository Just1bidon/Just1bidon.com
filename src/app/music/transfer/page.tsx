"use client";

import Hero_MusicTransferPage from "@/components/Hero/Hero_MusicTransferPage";
import { useState, useEffect } from "react";
import { getSpotifyToken, testSpotifyAPI } from "@/app/actions/spotify";

// Interfaces pour le typage
interface TokenData {
  accessToken: string;
  expiresAt: number;
}

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
      <section className="w-[1200px] p-6">
        <h2 className="text-2xl font-bold mb-4">Statut du Token Spotify</h2>

        {loading && <p className="text-blue-500">Chargement en cours...</p>}
        {error && <p className="text-red-500">Erreur: {error}</p>}

        {token && (
          <div className="mb-6">
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <p className="font-semibold">Bearer Token:</p>
              <p className="text-sm break-all bg-gray-200 p-2 rounded">
                {token}
              </p>
            </div>

            <p className="text-gray-700">
              <span className="font-semibold">Expiration:</span> {timeRemaining}
            </p>
          </div>
        )}

        {artistData && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-2">Test API Réussi</h3>
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="flex items-center mb-4">
                {artistData.images && artistData.images[0] && (
                  <img
                    src={artistData.images[0].url}
                    alt={artistData.name}
                    className="w-24 h-24 rounded-full mr-4"
                  />
                )}
                <div>
                  <h4 className="text-lg font-bold">{artistData.name}</h4>
                  <p className="text-gray-600">
                    Popularité: {artistData.popularity}/100
                  </p>
                  <p className="text-gray-600">
                    Followers: {artistData.followers?.total?.toLocaleString()}
                  </p>
                </div>
              </div>

              {artistData.genres && (
                <div>
                  <p className="font-semibold">Genres:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {artistData.genres.map((genre, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!token && !loading && (
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Obtenir un nouveau token
          </button>
        )}
      </section>
    </section>
  );
}
