"use client";

import Hero_MusicTransferPage from "@/components/Hero/Hero_MusicTransferPage";
import Image from "next/image";
import SpotifyAuthBlock from "@/components/music/SpotifyAuthBlock";

export default function Home() {
  return (
    <section className="w-full h-full flex flex-col justify-center items-center">
      <Hero_MusicTransferPage />

      <section className="w-full max-w-[1200px] relative">
        <div className="w-full h-full absolute top-0 left-0 -z-10"></div>
        <SpotifyAuthBlock />
      </section>
    </section>
  );
}
