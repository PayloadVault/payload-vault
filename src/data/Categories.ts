import type { Category as TitleCategory } from "../hooks/usePdf/types";

export type SlugCategory =
  | "strom-gas"
  | "barmenia-abrechnung"
  | "ikk-abrechnung"
  | "adcuri"
  | "adcuri/abschlussprovision"
  | "adcuri/bestandsprovision";

export type Category = {
  slug: SlugCategory;
  title: TitleCategory | "Adcuri";
};

export const categories: Category[] = [
  { slug: "strom-gas", title: "Strom & Gas" },
  { slug: "barmenia-abrechnung", title: "Barmenia Abrechnung" },
  { slug: "ikk-abrechnung", title: "IKK Abrechnung" },
  { slug: "adcuri", title: "Adcuri" },
  { slug: "adcuri/abschlussprovision", title: "Adcuri Abschlussprovision" },
  { slug: "adcuri/bestandsprovision", title: "Adcuri Bestandsprovision" },
];
