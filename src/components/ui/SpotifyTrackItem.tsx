import Image from "next/image";

interface SpotifyTrackItemProps {
  track: {
    id: string;
    name: string;
    album: {
      images: { url: string }[];
    };
    artists: { name: string }[];
  };
}

export default function SpotifyTrackItem({ track }: SpotifyTrackItemProps) {
  return (
    <li key={track.id} className="mb-2 flex items-center gap-2">
      <Image
        src={track.album.images[2]?.url || track.album.images[0]?.url || ""}
        alt={track.name}
        width={40}
        height={40}
        className="rounded"
      />
      <div>
        <div className="font-semibold">{track.name}</div>
        <div className="text-xs text-gray-500">
          {track.artists.map((a) => a.name).join(", ")}
        </div>
      </div>
    </li>
  );
}
