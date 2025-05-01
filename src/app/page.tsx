import Hero_HomePage from "@/components/Hero/Hero_HomePage";
import LinkPreviewCard from "@/components/Card/LinkPreviewCard";
import ExpandableCard from "@/components/Card/ExpandableCard";

export default function Home() {
  return (
    <section className="w-full h-full flex flex-col justify-center items-center">
      <Hero_HomePage />
      <section className="w-full max-w-[1200px] relative">
        <div className="bg-purple-500 opacity-10 w-full h-full absolute top-0 left-0 -z-10"></div>
        <h3 className="text-4xl font-bold mb-8">Mes projets :</h3>
        <div className="flex flex-wrap gap-8">
          <LinkPreviewCard
            link="https://www.projet-voltaire-inator.fr/"
            fallbackName="Projet Voltaire-inator"
            // internalRoute="/projet-voltaire-inator"
            internalRoute="/"
          />
        </div>
        <ExpandableCard
          cards={[
            {
              title: "Projet Voltaire-inator",
              description:
                "Le Projet 'Projet Voltaire-inator'",
              src: "/Just1bidon_head/Just1bidon_head.jpg",
              ctaText: "Voir le projet",
              ctaLink: "/",
              content: <div>Contenu du projet</div>,
            },
          ]}
        />
        <ExpandableCard
          cards={[
            {
              title: "Projet Voltaire-inator",
              description:
                "Le Projet 'Projet Voltaire-inator' est un projet qui permet de savoir si vous etes un projet Voltaire ou non.",
              src: "/Just1bidon_head/Just1bidon_head.jpg",
              ctaText: "Voir le projet",
              ctaLink: "/",
              content: <div>Contenu du projet</div>,
            },
          ]}
        />
        <ExpandableCard
          cards={[
            {
              title: "Projet Voltaire-inator",
              description:
                "Le Projet 'Projet Voltaire-inator' est un projet qui permet de savoir si vous etes un projet Voltaire ou non.",
              src: "/Just1bidon_head/Just1bidon_head.jpg",
              ctaText: "Voir le projet",
              ctaLink: "/",
              content: <div>Contenu du projet</div>,
            },
          ]}
          variant="grid"
        />
      </section>
    </section>
  );
}
