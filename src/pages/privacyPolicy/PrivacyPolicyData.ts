type ContentBlock =
  | { type: "text"; value: string }
  | {
      type: "contact";
      name: string;
      address: string[];
      phone: string;
      email: string;
    }
  | { type: "highlight"; title?: string; content: string }
  | { type: "list"; title?: string; items: string[] }
  | { type: "links"; title?: string; items: { label: string; href: string }[] };

interface PrivacySection {
  id: number;
  title: string;
  content: ContentBlock[];
}

const PRIVACY_POLICY_DATA = {
  header: {
    subtitle: "DATENSCHUTZ",
    title: "Datenschutzerklärung",
    description:
      "Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.",
  },
  sections: [
    {
      id: 1,
      title: "Verantwortlicher",
      content: [
        {
          type: "contact",
          name: "Bazilije Vuletic",
          address: ["Kölner Str. 152", "58509 Lüdenscheid"],
          phone: "+49 160 2222992",
          email: "vuletic@pro-fina.de",
        },
      ],
    },
    {
      id: 2,
      title: "Allgemeine Hinweise",
      content: [
        {
          type: "text",
          value:
            "Der Schutz Ihrer persönlichen Daten ist uns wichtig. Personenbezogene Daten werden ausschließlich im Rahmen der gesetzlichen Datenschutzvorschriften (DSGVO) verarbeitet.",
        },
      ],
    },
    {
      id: 3,
      title: "Hosting",
      content: [
        {
          type: "text",
          value:
            "Diese Website wird extern gehostet bei:\nNetlify, 2325 3rd Street, Suite 296, San Francisco, CA 94107, USA",
        },
        {
          type: "highlight",
          title: "Beim Besuch der Website",
          content:
            "werden automatisch technische Daten (z. B. IP-Adresse, Browsertyp, Zeitpunkt des Zugriffs) erfasst. Die Verarbeitung erfolgt zur sicheren und stabilen Bereitstellung der Website gemäß Art. 6 Abs. 1 lit. f DSGVO.",
        },
      ],
    },
    {
      id: 4,
      title: "Kontaktaufnahme",
      content: [
        {
          type: "text",
          value:
            "Wenn Sie uns per E-Mail, Telefon oder Kontaktformular kontaktieren, werden Ihre Angaben zur Bearbeitung Ihrer Anfrage gespeichert.",
        },
        {
          type: "list",
          title: "Rechtsgrundlage",
          items: [
            "Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen)",
            "oder Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)",
          ],
        },
        {
          type: "text",
          value:
            "Eine Weitergabe der Daten erfolgt nicht ohne Ihre Einwilligung. Die Daten werden gelöscht, sobald der Zweck der Speicherung entfällt und keine gesetzlichen Aufbewahrungspflichten bestehen.",
        },
      ],
    },
    {
      id: 5,
      title: "Soziale Medien (Facebook & Instagram)",
      content: [
        {
          type: "text",
          value:
            "Auf dieser Website befinden sich Verlinkungen zu sozialen Netzwerken wie Facebook und Instagram. Anbieter ist:\n\nMeta Platforms Ireland Limited\nMerrion Road, Dublin 4, Irland",
        },
        {
          type: "text",
          value:
            "Beim Anklicken der jeweiligen Symbole werden Sie auf die Plattformen weitergeleitet. Dabei kann Meta personenbezogene Daten verarbeiten. Die Nutzung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Öffentlichkeitsarbeit).",
        },
        {
          type: "links",
          title: "Weitere Informationen",
          items: [
            {
              label: "Facebook Datenschutzhinweise",
              href: "https://de-de.facebook.com/privacy/explanation",
            },
            {
              label: "Instagram Datenschutzrichtlinie",
              href: "https://privacycenter.instagram.com/policy/",
            },
          ],
        },
      ],
    },
    {
      id: 6,
      title: "SSL-Verschlüsselung",
      content: [
        {
          type: "text",
          value:
            "Diese Website nutzt eine SSL- bzw. TLS-Verschlüsselung zum Schutz der Datenübertragung.",
        },
      ],
    },
    {
      id: 7,
      title: "Ihre Rechte",
      content: [
        { type: "text", value: "Sie haben jederzeit das Recht auf:" },
        {
          type: "list",
          items: [
            "Auskunft über Ihre gespeicherten Daten",
            "Berichtigung oder Löschung",
            "Einschränkung der Verarbeitung",
            "Widerruf erteilter Einwilligungen",
            "Beschwerde bei einer zuständigen Datenschutzaufsichtsbehörde",
          ],
        },
      ],
    },
  ] as PrivacySection[],
};

export { PRIVACY_POLICY_DATA, type PrivacySection, type ContentBlock };
