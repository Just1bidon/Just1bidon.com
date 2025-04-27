"use client";
import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import UserCard from "@/components/Card/UserCard";
import LogoutButton from "@/components/ui/LogoutButton";
import { Button } from "@/components/ui/button";
import Card from "@/components/Card/Card";
import ExpandableCard from "@/components/Card/ExpandableCard";
import type { CardData } from "@/components/Card/ExpandableCard";

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
        external_urls?: { spotify: string };
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

  // Function to transform Spotify tracks into ExpandableCard data
  const transformTracksToCards = (
    tracks: {
      track: {
        id: string;
        name: string;
        album: {
          images: { url: string }[];
        };
        artists: { name: string }[];
        external_urls?: { spotify: string };
      };
    }[]
  ): CardData[] => {
    return tracks.map(({ track }) => ({
      title: track.name,
      description: track.artists.map((a) => a.name).join(", "),
      src:
        track.album.images[1]?.url ||
        track.album.images[0]?.url ||
        track.album.images[2]?.url ||
        "",
      ctaText: "Écouter",
      ctaLink: track.external_urls?.spotify || "#",
      content: () => (
        <div>
          <p>Artistes : {track.artists.map((a) => a.name).join(", ")}</p>
        </div>
      ),
    }));
  };

  if (status === "loading") return <p>Chargement...</p>;

  if (status === "authenticated")
    return (
      <section className="my-8 flex justify-between h-min items-stretch gap-6 p-8 rounded-lg">
        <div className="flex flex-col gap-6">
          <Card>
            <UserCard
              image={session?.user?.image || ""}
              name={session?.user?.name || ""}
              popularity={0}
              genres={[]}
              followers={0}
              email={session?.user?.email || undefined}
              size="small"
            />
          </Card>
          <Card className="flex flex-col gap-2">
            <LogoutButton type="session" />
            <LogoutButton type="full" />
          </Card>
        </div>
        <Card className="w-full lg:px-8">
          <div className="flex flex-col gap-1 mb-4">
            <h3 className="font-bold text-xl">
              Vos 3 dernières musiques likées :
            </h3>
            {showProof &&
              tracks.length === 3 &&
              !loadingTracks &&
              !errorTracks && (
                <p className="text-gray3 text-sm">
                  Si ces 3 musiques correspondent à votre compte, la connexion
                  Spotify est parfaitement établie !
                </p>
              )}
          </div>

          {loadingTracks && <p>Chargement des musiques...</p>}
          {errorTracks && <p className="text-red-500">{errorTracks}</p>}
          {tracks.length > 0 && !loadingTracks && !errorTracks && (
            <ExpandableCard
              cards={transformTracksToCards(tracks)}
              variant="standard"
            />
          )}
        </Card>
      </section>
    );

  return (
    <section className="flex justify-center">
      <Button
        size="lg"
        className="my-8"
        onClick={() => signIn("spotify", { callbackUrl: "/music/transfer" })}
      >
        Se connecter à Spotify
      </Button>
    </section>
  );
}
