"use client";
import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import ArtistCard from "@/components/Card/ArtistCard";
import LogoutButton from "@/components/ui/LogoutButton";
import { Button } from "@/components/ui/button";
import SpotifyTrackItem from "@/components/ui/SpotifyTrackItem";

export default function SpotifyAuthBlock() {
  const { data: session, status } = useSession();
  const [tracks, setTracks] = useState<
    {
      track: {
        id: string;
        name: string;
        album: {
          images: { url: string }[];
        };
        artists: { name: string }[];
      };
    }[]
  >([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [errorTracks, setErrorTracks] = useState<string | null>(null);
  const [showProof, setShowProof] = useState(false);

  useEffect(() => {
    const fetchTracks = async () => {
      if (
        status !== "authenticated" ||
        !(session as unknown as { [key: string]: string })?.accessToken
      )
        return;
      setLoadingTracks(true);
      setErrorTracks(null);
      try {
        const res = await fetch(
          "https://api.spotify.com/v1/me/tracks?limit=3",
          {
            headers: {
              Authorization: `Bearer ${
                (session as unknown as { [key: string]: string }).accessToken
              }`,
            },
          }
        );
        if (!res.ok)
          throw new Error("Erreur lors de la récupération des musiques");
        const data = await res.json();
        setTracks(data.items || []);
        setShowProof(true);
      } catch (e) {
        if (e instanceof Error) {
          setErrorTracks(e.message);
        } else {
          setErrorTracks("Erreur inconnue");
        }
      } finally {
        setLoadingTracks(false);
      }
    };
    fetchTracks();
  }, [status, session]);

  if (status === "loading") return <p>Chargement...</p>;

  if (status === "authenticated")
    return (
      <div className="my-8 flex flex-col items-center gap-4">
        <ArtistCard
          image={session?.user?.image || ""}
          name={session?.user?.name || ""}
          popularity={0}
          genres={[]}
          followers={0}
          email={session?.user?.email || undefined}
        />
        <div className="flex gap-2 mt-4">
          <LogoutButton type="session" />
          <LogoutButton type="full" />
        </div>
        <div className="mt-8 w-full max-w-md">
          <h3 className="font-bold mb-2">3 dernières musiques likées :</h3>
          {loadingTracks && <p>Chargement des musiques...</p>}
          {errorTracks && <p className="text-red-500">{errorTracks}</p>}
          <ul>
            {tracks.map((item) => (
              <SpotifyTrackItem key={item.track.id} track={item.track} />
            ))}
          </ul>
          {showProof &&
            tracks.length === 3 &&
            !loadingTracks &&
            !errorTracks && (
              <div className="mt-4 p-2 bg-green-100 text-green-800 rounded text-center text-sm">
                ✅ Si ces 3 musiques correspondent à votre compte, la connexion
                Spotify est parfaitement établie !
              </div>
            )}
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
