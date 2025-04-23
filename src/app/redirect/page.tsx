import { redirect } from "next/navigation";

export default function RedirectPage({
  searchParams,
}: {
  searchParams: { to?: string };
}) {
  // Par défaut, redirige vers localhost
  let target = "http://localhost:3000/music/transfer";

  // Redirection vers la prod si précisé
  if (searchParams.to === "prod") {
    target = "https://just1bidon.com/music/transfer";
  }
  // Ajoute d'autres cas si besoin

  redirect(target);
}
