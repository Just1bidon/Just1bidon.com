import { redirect } from "next/navigation";

// Mapping des types et environnements vers les URLs cibles
const REDIRECT_MAP: Record<string, Record<string, string>> = {
  music: {
    dev: "http://localhost:3000/music/transfer",
    prod: "https://just1bidon.com/music/transfer",
    // Ajoute d'autres environnements si besoin
  },
  admin: {
    dev: "http://localhost:3000/admin",
    prod: "https://just1bidon.com/admin",
    // Ajoute d'autres environnements si besoin
  },
  // Ajoute d'autres types si besoin
};

// Valeurs par défaut
const DEFAULT_TYPE = "music";
const DEFAULT_ENV = "dev";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const type = typeof params.type === "string" ? params.type : DEFAULT_TYPE;
  const env = typeof params.env === "string" ? params.env : DEFAULT_ENV;

  // Cherche l'URL cible dans le mapping, sinon prend la valeur par défaut
  const target =
    REDIRECT_MAP[type]?.[env] || REDIRECT_MAP[DEFAULT_TYPE][DEFAULT_ENV];

  redirect(target);
}