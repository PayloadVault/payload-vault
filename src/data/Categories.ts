export type Category = {
  slug: string;
  title: string;
};

export const categories: Category[] = [
  { slug: "strom-gas", title: "Strom & Gas" },
  { slug: "barmenia-abrechnung", title: "Barmenia Abrechnung" },
  { slug: "ikk-abrechnung", title: "IKK Abrechnung" },
  { slug: "adcuri", title: "Adcuri" },
  { slug: "adcuri/abschlussprovision", title: "Adcuri Abschlussprovision" },
  { slug: "adcuri/bestandsprovision", title: "Adcuri Bestandsprovision" },
];
