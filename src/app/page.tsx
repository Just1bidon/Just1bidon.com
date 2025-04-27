import Hero_HomePage from "@/components/Hero/Hero_HomePage";

export default function Home() {
  return (
    <section className="w-full h-full flex flex-col justify-center items-center">
      <Hero_HomePage />
      <section className="w-full max-w-[1200px] relative">
        <div className="bg-purple-500 opacity-10 w-full h-full absolute top-0 left-0 -z-10"></div>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          quos.
        </p>
      </section>
    </section>
  );
}
