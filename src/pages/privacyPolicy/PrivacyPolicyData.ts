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
          name: "[Controller Name]",
          address: ["[Street and House Number]", "[Postal Code and City]"],
          phone: "[Phone Number]",
          email: "[Email Address]",
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
            "Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Personenbezogene Daten werden ausschließlich im Rahmen der geltenden Datenschutzvorschriften, insbesondere der Datenschutz-Grundverordnung (DSGVO), verarbeitet.",
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
            "Diese Anwendung wird extern gehostet bei:\n\nNetlify, Inc.\n2325 3rd Street, Suite 296\nSan Francisco, CA 94107, USA",
        },
        {
          type: "highlight",
          title: "Server-Log-Dateien",
          content:
            "Beim Zugriff auf die Anwendung werden automatisch Informationen in sogenannten Server-Log-Dateien erhoben. Dies sind insbesondere IP-Adresse, Browsertyp, Betriebssystem, Referrer-URL sowie Zeitpunkt des Zugriffs. Die Verarbeitung erfolgt zur Gewährleistung eines sicheren und stabilen Betriebs der Anwendung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).",
        },
      ],
    },
    {
      id: 4,
      title: "Hochladen und Verarbeitung von Rechnungen",
      content: [
        {
          type: "text",
          value:
            "Nutzer haben die Möglichkeit, Rechnungen in Form von PDF-Dokumenten hochzuladen. Diese Dokumente können personenbezogene Daten enthalten, insbesondere Namen, Anschriften, Rechnungsbeträge, Rechnungsdaten sowie weitere in der Rechnung enthaltene Informationen.",
        },
        {
          type: "highlight",
          title: "Zweck der Verarbeitung",
          content:
            "Die Verarbeitung der hochgeladenen Rechnungen erfolgt ausschließlich zum Zweck der automatisierten Kategorisierung, der Extraktion relevanter Informationen (z. B. Einnahmenhöhe und Einnahmedatum) sowie zur Bereitstellung einer strukturierten Übersicht für den Nutzer.",
        },
        {
          type: "list",
          title: "Verarbeitete Daten",
          items: [
            "Hochgeladene Rechnungsdokumente (PDF)",
            "Rechnungsbetrag",
            "Datum der Einnahme",
            "Rechnungskategorie",
            "Weitere in der Rechnung enthaltene Daten",
          ],
        },
        {
          type: "highlight",
          title: "Rechtsgrundlage",
          content:
            "Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Erfüllung eines Vertrags), da sie für die Nutzung der Kernfunktionen der Anwendung erforderlich ist.",
        },
      ],
    },
    {
      id: 5,
      title: "Speicherung der Daten (Supabase)",
      content: [
        {
          type: "text",
          value:
            "Die Speicherung der hochgeladenen Rechnungen sowie der daraus extrahierten Daten erfolgt über folgenden Dienstleister:\n\nSupabase Inc.\n[Supabase Address]",
        },
        {
          type: "highlight",
          title: "Datensicherheit",
          content:
            "Die Daten werden auf sicheren Servern gespeichert und sind ausschließlich für den jeweiligen Nutzer sowie für technisch notwendige Systemkomponenten zugänglich.",
        },
        {
          type: "highlight",
          title: "Rechtsgrundlage",
          content:
            "Die Speicherung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren und zuverlässigen Datenverarbeitung).",
        },
      ],
    },
    {
      id: 6,
      title: "Automatisierte Datenanalyse (Google Gemini)",
      content: [
        {
          type: "text",
          value:
            "Zur automatisierten Analyse der hochgeladenen Rechnungen und zur Extraktion strukturierter Informationen wird ein KI-basierter Dienst des folgenden Anbieters eingesetzt:\n\nGoogle LLC\n[Google Address]",
        },
        {
          type: "highlight",
          title: "Umfang der Verarbeitung",
          content:
            "Die Inhalte der hochgeladenen Rechnungen können zum Zweck der Analyse an den KI-Dienst übermittelt werden. Die Verarbeitung erfolgt ausschließlich zur Bereitstellung der Funktionalität der Anwendung und nicht zu Werbezwecken.",
        },
        {
          type: "highlight",
          title: "Rechtsgrundlage",
          content:
            "Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).",
        },
      ],
    },
    {
      id: 7,
      title: "Speicherdauer",
      content: [
        {
          type: "text",
          value:
            "Die gespeicherten Rechnungen und extrahierten Daten werden so lange aufbewahrt, wie das Nutzerkonto besteht oder bis der Nutzer die Daten selbst löscht, sofern keine gesetzlichen Aufbewahrungspflichten einer längeren Speicherung entgegenstehen.",
        },
      ],
    },
    {
      id: 8,
      title: "Rechte der betroffenen Personen",
      content: [
        { type: "text", value: "Sie haben jederzeit das Recht auf:" },
        {
          type: "list",
          items: [
            "Auskunft über Ihre gespeicherten personenbezogenen Daten (Art. 15 DSGVO)",
            "Berichtigung unrichtiger Daten (Art. 16 DSGVO)",
            "Löschung Ihrer Daten (Art. 17 DSGVO)",
            "Einschränkung der Verarbeitung (Art. 18 DSGVO)",
            "Datenübertragbarkeit (Art. 20 DSGVO)",
            "Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)",
            "Beschwerde bei einer zuständigen Datenschutzaufsichtsbehörde (Art. 77 DSGVO)",
          ],
        },
      ],
    },
  ] as PrivacySection[],
};

export { PRIVACY_POLICY_DATA, type PrivacySection, type ContentBlock };
