import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Récupérer le paramètre 'to'
  const { to } = await searchParams;
  const toStr = typeof to === "string" ? to : undefined;

  // Par défaut, redirige vers localhost
  let target = "http://localhost:3000/music/transfer";

  // Redirection vers la prod si précisé
  if (toStr === "prod") {
    target = "https://just1bidon.com/music/transfer";
  }
  // Ajoute d'autres cas si besoin

  redirect(target);
}
