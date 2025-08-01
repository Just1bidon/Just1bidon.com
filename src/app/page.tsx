import Hero_HomePage from "@/components/Hero/Hero_HomePage";
import ExpandableCard from "@/components/Card/ExpandableCard";

export default function Home() {
  // Définition des projets avec et sans URL
  const projectsWithUrl = [
    {
      title: "Projet Voltaire-inator",
      description: "Extension pour Projet Voltaire",
      src: "/Just1bidon_head/Just1bidon_head.jpg",
      ctaText: "Voir le projet",
      ctaLink: "https://www.projet-voltaire-inator.fr/",
      url: "https://www.projet-voltaire-inator.fr/", // URL pour preview
      content: (
        <>
          <p>
            Le Projet &apos;Projet Voltaire-inator&apos; est un projet qui
            permet de savoir si vous êtes un projet Voltaire ou non.
          </p>
          <p>
            Il s&apos;agit d&apos;une extension pour navigateur qui facilite
            l&apos;utilisation de Projet Voltaire.
          </p>
        </>
      ),
    },
    {
      title: "Studio Mazzetta",
      description: "Mon site personnel",
      src: "/Just1bidon_head/Just1bidon_head.jpg",
      ctaText: "Visiter",
      ctaLink: "https://github.com",
      url: "https://github.com", // URL pour preview
      content: (
        <>
          <p> 
            Just1bidon.com est mon site personnel où je partage mes projets et
            mon portfolio.
          </p>
          <p>Développé avec Next.js et Tailwind CSS.</p>
        </>
      ),
    },
  ];

  const projectsWithoutUrl = [
    {
      title: "Projet Simple",
      description: "Un projet sans preview de lien externe",
      src: "/Just1bidon_head/Just1bidon_head.jpg",
      ctaText: "En savoir plus",
      ctaLink: "/",
      content: (
        <>
          <p>
            Ce projet n&apos;a pas d&apos;URL externe, donc il utilise
            l&apos;image et le titre définis manuellement.
          </p>
          <p>La description est affichée directement, sans lien cliquable.</p>
        </>
      ),
    },
    {
      title: "Autre Projet",
      description: "Un autre exemple sans URL externe",
      src: "/Just1bidon_head/Just1bidon_head.jpg",
      ctaText: "Découvrir",
      ctaLink: "/",
      content: (
        <>
          <p>Voici un autre exemple de projet sans URL externe.</p>
          <p>Il utilise l&apos;image et le titre définis manuellement.</p>
        </>
      ),
    },
  ];

  return (
    <section className="w-full h-full flex flex-col justify-center items-center">
      <Hero_HomePage />
      <section className="w-full max-w-[1200px] relative px-4 py-8 space-y-16">
        <div className="bg-purple-500 opacity-10 w-full h-full absolute top-0 left-0 -z-10"></div>

        {/* Section 1: ExpandableCard Standard avec URL */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">
            ExpandableCard Standard avec preview de lien :
          </h3>
          <p className="text-gray-600">
            Version standard où l&apos;image est remplacée par le favicon et la
            description par le lien du site
          </p>
          <ExpandableCard cards={projectsWithUrl} variant="standard" />
        </div>

        {/* Section 2: ExpandableCard Standard sans URL */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">
            ExpandableCard Standard normale :
          </h3>
          <p className="text-gray-600">
            Version standard classique sans preview de lien
          </p>
          <ExpandableCard cards={projectsWithoutUrl} variant="standard" />
        </div>

        {/* Section 3: ExpandableCard Grid avec URL */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">
            ExpandableCard Grid avec preview de lien :
          </h3>
          <p className="text-gray-600">
            Version grid où l&apos;image est remplacée par un screenshot du site
            via thum.io
          </p>
          <ExpandableCard cards={projectsWithUrl} variant="grid" />
        </div>

        {/* Section 4: ExpandableCard Grid sans URL */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">ExpandableCard Grid normale :</h3>
          <p className="text-gray-600">
            Version grid classique sans preview de lien
          </p>
          <ExpandableCard cards={projectsWithoutUrl} variant="grid" />
        </div>
      </section>
    </section>
  );
}
