import { Fragment } from "react";
import type { ContentBlock } from "./ImpressumData";

export const renderContentBlock = (block: ContentBlock, index: number) => {
  switch (block.type) {
    case "text":
      return (
        <p key={index} className="text-(--color-text-main)">
          {parseTextWithMarkdown(block.value)}
        </p>
      );

    case "provider":
      return (
        <div
          key={index}
          className="rounded-lg border border-(--color-border-light)/60 bg-(--color-bg-main)/30 p-4 sm:p-5"
        >
          <p className="font-semibold">{block.name}</p>
          <p>
            {block.details.map((line, i) => (
              <Fragment key={i}>
                {line}
                {i < block.details.length - 1 && <br />}
              </Fragment>
            ))}
          </p>
        </div>
      );

    case "contact":
      return (
        <div
          key={index}
          className="rounded-lg border border-(--color-border-light)/60 bg-(--color-bg-main)/30 p-4 sm:p-5"
        >
          <p>
            Telefon:{" "}
            <a
              className="underline hover:text-(--color-primary)"
              href={`tel:${block.phone.replace(/\s/g, "")}`}
            >
              {block.phone}
            </a>
            <br />
            E-Mail:{" "}
            <a
              className="underline hover:text-(--color-primary)"
              href={`mailto:${block.email}`}
            >
              {block.email}
            </a>
          </p>
        </div>
      );

    case "list":
      return (
        <div
          key={index}
          className="rounded-lg border border-(--color-border-light)/60 bg-(--color-bg-main)/30 p-4 sm:p-5"
        >
          <ul className="list-disc pl-5 space-y-1 text-(--color-text-main)">
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      );

    case "infoCards":
      return (
        <div key={index} className="space-y-6">
          {block.cards.map((card, i) => (
            <div
              key={i}
              className="rounded-lg border border-(--color-border-light)/60 bg-(--color-bg-main)/30 p-4 sm:p-5"
            >
              <p className="font-semibold">{card.title}</p>
              <p className="mt-1">
                {card.address}
                <br />
                <a
                  className="underline hover:text-(--color-primary)"
                  href={card.link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {card.link.label}
                </a>
              </p>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
};

export const parseTextWithMarkdown = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, index) => {
    // Bold text
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    // Link
    const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      return (
        <a
          key={index}
          className="underline hover:text-(--color-primary)"
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
        >
          {linkMatch[1]}
        </a>
      );
    }
    // Regular text with line breaks
    return part.split("\n").map((line, i, arr) => (
      <Fragment key={`${index}-${i}`}>
        {line}
        {i < arr.length - 1 && <br />}
      </Fragment>
    ));
  });
};
