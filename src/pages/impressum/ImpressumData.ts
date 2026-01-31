type ContentBlock =
  | { type: "text"; value: string }
  | { type: "provider"; name: string; details: string[] }
  | { type: "contact"; phone: string; email: string }
  | { type: "list"; items: string[] }
  | {
      type: "infoCards";
      cards: {
        title: string;
        address: string;
        link: { label: string; href: string };
      }[];
    };

interface ImpressumSection {
  id: number;
  title: string;
  content: ContentBlock[];
}

const IMPRESSUM_DATA = {
  header: {
    subtitle: "IMPRESSUM",
    title: "Angaben gemäß § 5 TMG",
    description:
      "Pflichtangaben und Informationen zum Anbieter dieser Website.",
  },
  sections: [
    {
      id: 1,
      title: "Anbieter",
      content: [
        {
          type: "provider",
          name: "Bazilije Vuletić",
          details: [
            "Vermittlung von Versicherungen",
            "Kölner Str. 152",
            "58509 Lüdenscheid",
          ],
        },
      ],
    },
    {
      id: 2,
      title: "Kontakt",
      content: [
        {
          type: "contact",
          phone: "+49 160 2222992",
          email: "vuletic@pro-fina.de",
        },
      ],
    },
    {
      id: 3,
      title: "Umsatzsteuer",
      content: [
        {
          type: "text",
          value:
            "Keine Umsatzsteuerpflicht nach § 19 UStG (Kleinunternehmerregelung).",
        },
      ],
    },
    {
      id: 4,
      title: "Registrierungsangaben gemäß § 11a GewO",
      content: [
        {
          type: "text",
          value:
            "Tätigkeit: Gebundener Versicherungsvertreter nach § 34d Abs. 7 GewO\nRegistrierungsnummer: **D-6FME-UFOB4-98**\nZuständige Registerstelle: Südwestfälische Industrie- und Handelskammer zu Hagen, Bahnhofstraße 18, 58095 Hagen\nVermittlerregister: [www.vermittlerregister.info](https://www.vermittlerregister.info)",
        },
      ],
    },
    {
      id: 5,
      title: "Haftungsübernehmendes Versicherungsunternehmen",
      content: [
        {
          type: "text",
          value: "Barmenia Krankenversicherung AG",
        },
      ],
    },
    {
      id: 6,
      title: "Berufsrechtliche Regelungen",
      content: [
        {
          type: "list",
          items: [
            "§ 34d Gewerbeordnung (GewO)",
            "§§ 59–68 Versicherungsvertragsgesetz (VVG)",
            "Verordnung über die Versicherungsvermittlung und -beratung (VersVermV)",
          ],
        },
      ],
    },
    {
      id: 7,
      title: "Schlichtungsstellen",
      content: [
        {
          type: "infoCards",
          cards: [
            {
              title: "Versicherungsombudsmann e. V.",
              address: "Postfach 08 06 32, 10006 Berlin",
              link: {
                label: "www.versicherungsombudsmann.de",
                href: "https://www.versicherungsombudsmann.de",
              },
            },
            {
              title: "Ombudsmann Private Kranken- und Pflegeversicherung",
              address: "Postfach 06 02 22, 10052 Berlin",
              link: {
                label: "www.pkv-ombudsmann.de",
                href: "https://www.pkv-ombudsmann.de",
              },
            },
          ],
        },
      ],
    },
  ] as ImpressumSection[],
};

export { IMPRESSUM_DATA, type ContentBlock };
