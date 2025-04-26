"use client";

import Hero_MusicTransferPage from "@/components/Hero/Hero_MusicTransferPage";
import { useState, useEffect } from "react";
import { getSpotifyToken, testSpotifyAPI } from "@/app/actions/spotify";
import ArtistCard from "@/components/Card/ArtistCard";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
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

function SpotifyAuthSection() {
  const { data: session, status } = useSession();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [errorTracks, setErrorTracks] = useState<string | null>(null);
  const [awaitingFullLogout, setAwaitingFullLogout] = useState(false);

  // Déconnexion totale : ouvre le logout Spotify dans un nouvel onglet et affiche un message sur le site
  const handleFullLogout = () => {
    window.open("https://accounts.spotify.com/logout", "_blank");
    setAwaitingFullLogout(true);
  };

  useEffect(() => {
    const fetchTracks = async () => {
      if (status !== "authenticated" || !(session as any)?.accessToken) return;
      setLoadingTracks(true);
      setErrorTracks(null);
      try {
        const res = await fetch(
          "https://api.spotify.com/v1/me/tracks?limit=3",
          {
            headers: {
              Authorization: `Bearer ${(session as any).accessToken}`,
            },
          }
        );
        if (!res.ok)
          throw new Error("Erreur lors de la récupération des musiques");
        const data = await res.json();
        setTracks(data.items || []);
      } catch (e: any) {
        setErrorTracks(e.message);
      } finally {
        setLoadingTracks(false);
      }
    };
    fetchTracks();
  }, [status, session]);

  useEffect(() => {
    if (awaitingFullLogout) {
      const timer = setTimeout(() => {
        signOut({ callbackUrl: "/music/transfer" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [awaitingFullLogout]);

  if (status === "loading") return <p>Chargement...</p>;
  if (awaitingFullLogout) {
    return (
      <div className="my-8 flex flex-col items-center gap-4">
        <p className="text-orange-600 font-bold">Déconnexion en cours…</p>
        <p>Merci de patienter quelques secondes.</p>
      </div>
    );
  }
  if (status === "authenticated")
    return (
      <div className="my-8 flex flex-col items-center gap-4">
        <p className="text-green-600 font-bold">
          Connecté à Spotify en tant que :
        </p>
        <p>{session?.user?.email}</p>
        <p>{session?.user?.name}</p>
        <Image
          src={session?.user?.image || ""}
          alt="User Avatar"
          width={100}
          height={100}
        />
        <ArtistCard
          image={session?.user?.image || ""}
          name={session?.user?.name || ""}
          popularity={0}
          genres={[]}
          followers={session?.user?.email?.length}
        />
        <div className="flex gap-2 mt-4">
          <Button
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/music/transfer" })}
          >
            Se déconnecter (session)
          </Button>
          <Button variant="destructive" onClick={handleFullLogout}>
            Se déconnecter totalement
          </Button>
        </div>
        <div className="mt-8 w-full max-w-md">
          <h3 className="font-bold mb-2">3 dernières musiques likées :</h3>
          {loadingTracks && <p>Chargement des musiques...</p>}
          {errorTracks && <p className="text-red-500">{errorTracks}</p>}
          <ul>
            {tracks.map((item, idx) => (
              <li key={item.track.id} className="mb-2 flex items-center gap-2">
                <Image
                  src={
                    item.track.album.images[2]?.url ||
                    item.track.album.images[0]?.url ||
                    ""
                  }
                  alt={item.track.name}
                  width={40}
                  height={40}
                  className="rounded"
                />
                <div>
                  <div className="font-semibold">{item.track.name}</div>
                  <div className="text-xs text-gray-500">
                    {item.track.artists.map((a: any) => a.name).join(", ")}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  return (
    <Button
      size="lg"
      className="my-8"
      onClick={() => signIn("spotify", { callbackUrl: "/music/transfer" })}
    >
      Se connecter à Spotify
    </Button>
  );
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
      <SpotifyAuthSection />
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
