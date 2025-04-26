import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface LogoutButtonProps {
  type: "session" | "full";
}

export default function LogoutButton({ type }: LogoutButtonProps) {
  const [awaitingFullLogout, setAwaitingFullLogout] = useState(false);

  if (type === "full") {
    if (awaitingFullLogout) {
      setTimeout(() => signOut({ callbackUrl: "/music/transfer" }), 4000);
      return (
        <div className="flex flex-col items-center gap-2">
          <p className="text-orange-600 font-bold">Déconnexion en cours…</p>
          <p>Merci de patienter quelques secondes.</p>
        </div>
      );
    }
    return (
      <Button
        variant="destructive"
        onClick={() => {
          window.open("https://accounts.spotify.com/logout", "_blank");
          setAwaitingFullLogout(true);
        }}
      >
        Se déconnecter totalement
      </Button>
    );
  }
  // type === "session"
  return (
    <Button
      variant="destructive"
      onClick={() => signOut({ callbackUrl: "/music/transfer" })}
    >
      Se déconnecter (session)
    </Button>
  );
}
