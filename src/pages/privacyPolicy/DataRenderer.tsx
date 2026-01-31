import type { ContentBlock } from "./PrivacyPolicyData";
import { Fragment } from "react";

export const renderContentBlock = (block: ContentBlock, index: number) => {
  switch (block.type) {
    case "text":
      return (
        <p key={index} className="text-(--color-text-main) whitespace-pre-line">
          {block.value}
        </p>
      );

    case "contact":
      return (
        <div
          key={index}
          className="rounded-lg border border-(--color-border-light)/60 bg-(--color-bg-main)/30 p-4 sm:p-5"
        >
          <p className="font-semibold">{block.name}</p>
          <p>
            {block.address.map((line, i) => (
              <Fragment key={i}>
                {line}
                {i < block.address.length - 1 && <br />}
              </Fragment>
            ))}
          </p>
          <p className="mt-3">
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

    case "highlight":
      return (
        <div
          key={index}
          className="mt-4 rounded-lg border border-(--color-border-light)/60 bg-(--color-bg-main)/30 p-4 sm:p-5"
        >
          {block.title && <p className="font-semibold mb-1">{block.title}</p>}
          <p className="text-(--color-text-main)">{block.content}</p>
        </div>
      );

    case "list":
      return (
        <div
          key={index}
          className={
            block.title
              ? "mt-4 rounded-lg border border-(--color-border-light)/60 bg-(--color-bg-main)/30 p-4 sm:p-5"
              : ""
          }
        >
          {block.title && <p className="font-semibold mb-2">{block.title}</p>}
          <ul className="list-disc pl-5 space-y-1">
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      );

    case "links":
      return (
        <div
          key={index}
          className="mt-4 rounded-lg border border-(--color-border-light)/60 bg-(--color-bg-main)/30 p-4 sm:p-5"
        >
          {block.title && <p className="font-semibold mb-2">{block.title}</p>}
          <ul className="space-y-2">
            {block.items.map((link, i) => (
              <li key={i}>
                <a
                  className="underline hover:text-(--color-primary)"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );

    default:
      return null;
  }
};
