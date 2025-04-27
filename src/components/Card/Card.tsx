import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Composant Card générique avec un style de base.
 * Peut être utilisé pour envelopper n'importe quel contenu.
 */
export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-gray1 p-4 rounded-lg ${className}`}>{children}</div>
  );
}
