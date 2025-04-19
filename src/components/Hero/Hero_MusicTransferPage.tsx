import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function Hero_MusicTransferPage() {
  return (
    <div className="relative w-full h-screen">
      <BackgroundBeams className="absolute top-0 left-0 w-screen h-screen z-0" />
      <section className="z-10 w-full h-screen flex flex-col justify-center items-center relative gap-30">
        <div>
          <h1 className="text-8xl font-bold">Transfer your music</h1>
          <p className="text-4xl">The place to transfer your music from Spotify to Apple Music</p>
        </div>
        <Button size="lg" asChild>
          <Link href="/">🚧 Accueil 🚧</Link>
        </Button>
      </section>
    </div>
  );
}