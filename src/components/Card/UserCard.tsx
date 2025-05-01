import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ArtistCardProps {
  image: string;
  name: string;
  popularity: number;
  genres: string[];
  followers: number;
  size?: "small" | "large";
  email?: string;
}

export default function ArtistCard({
  image,
  name,
  size = "small",
  email,
}: ArtistCardProps) {
  if (size === "small") {
    return (
      <div className="flex flex-col items-center gap-4 h-full rounded-lg">
        <Avatar size="large">
          <AvatarImage src={image} className="w-full h-full" />
          <AvatarFallback className="w-full h-full text-2xl">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold">{name}</h2>
          {email ? (
            <p className="text-sm">{email}</p>
          ) : (
            <p className="text-sm">Connectez-vous avec Spotify</p>
          )}
        </div>
      </div>
    );
  }
}
