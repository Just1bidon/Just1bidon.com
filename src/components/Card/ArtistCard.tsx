import Image from "next/image";

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
  popularity,
  genres,
  followers,
  size = "small",
  email,
}: ArtistCardProps) {
  if (size === "small") {
    return (
      <div className="flex gap-3 px-4 py-2 h-full rounded-lg border-1">
        <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
          <Image src={image} alt={name} width={50} height={50} />
        </div>
        <div>
          <h2 className="text-xl font-bold">{name}</h2>
          {email ? (
            <p className="text-sm">Email: {email}</p>
          ) : (
            <p className="text-sm">Followers: {followers}</p>
          )}
        </div>
      </div>
    );
  }

  if (size === "large") {
    return (
      <div className="relative w-[300px] h-[400px] rounded-2xl overflow-hidden group">
        {/* Image de fond */}
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 300px) 100vw, 300px"
          />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-zoro via-gray-zoro/50 to-transparent" />

        {/* Contenu */}
        <div className="relative h-full flex flex-col justify-end p-6 text-white">
          <h2 className="text-3xl font-bold mb-2">{name}</h2>
          <p className="text-sm opacity-90">Popularity: {popularity}</p>
          <p className="text-sm opacity-90">Genres: {genres.join(", ")}</p>
          {email ? (
            <p className="text-sm opacity-90">Email: {email}</p>
          ) : (
            <p className="text-sm opacity-90">Followers: {followers}</p>
          )}
        </div>
      </div>
    );
  }
}
