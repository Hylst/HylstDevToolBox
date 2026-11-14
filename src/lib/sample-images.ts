// Images d'exemple servies par l'application (dossier public/samples/), generees
// localement avec Qwen Image 2.1 Turbo : aucune requete vers un service tiers.

export type SampleCategory = "nature" | "business" | "abstract";

const AVATAR_COUNT = 6;

const PHOTOS: Record<SampleCategory, string[]> = {
  nature: ["paysage", "foret", "calanque", "lavande"],
  business: ["bureau", "reunion", "architecture"],
  abstract: ["fluide", "low-poly"],
};

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

// Adresse absolue, pour que les donnees factices copiees restent utilisables ailleurs.
export const sampleUrl = (file: string): string =>
  `${globalThis.location?.origin ?? "https://hylst.fr"}${import.meta.env.BASE_URL}samples/${file}`;

export const randomAvatar = (): string => sampleUrl(`avatar-${1 + Math.floor(Math.random() * AVATAR_COUNT)}.webp`);

export const randomPhoto = (category?: SampleCategory): string => {
  const pool = category ? PHOTOS[category] : Object.values(PHOTOS).flat();
  return sampleUrl(`${pick(pool)}.webp`);
};
