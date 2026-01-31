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
          name: "[Provider Name]",
          details: [
            "[Business Activity / Service Description]",
            "[Street and House Number]",
            "[Postal Code and City]",
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
          phone: "[Phone Number]",
          email: "[Email Address]",
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
            "[VAT information, e.g. VAT exempt under small business regulation § 19 UStG]",
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
            "Tätigkeit: [Professional Activity according to GewO]\nRegistrierungsnummer: [Registration Number]\nZuständige Registerstelle: [Responsible Authority Name and Address]\nVermittlerregister: [Link to Intermediary Register]",
        },
      ],
    },
    {
      id: 5,
      title: "Haftungsübernehmendes Versicherungsunternehmen",
      content: [
        {
          type: "text",
          value: "[Liability Insurance Provider Name]",
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
              title: "[Arbitration Body Name]",
              address: "[Arbitration Body Address]",
              link: {
                label: "[Arbitration Body Website]",
                href: "[Website URL]",
              },
            },
            {
              title: "[Arbitration Body Name]",
              address: "[Arbitration Body Address]",
              link: {
                label: "[Arbitration Body Website]",
                href: "[Website URL]",
              },
            },
          ],
        },
      ],
    },
  ] as ImpressumSection[],
};

export { IMPRESSUM_DATA, type ContentBlock };
