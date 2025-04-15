import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero_HomePage() {
  return (
    <section className="w-full h-screen flex flex-col justify-center items-center">
      <div className="mt-30">
        <h1 className="text-8xl font-bold">Just1bidon.com</h1>
        <p className="text-4xl">The place of everything</p>
      </div>
      <Button asChild>
        <Link href="/">Discover the world of Just1bidon</Link>
      </Button>
    </section>
  );
}
