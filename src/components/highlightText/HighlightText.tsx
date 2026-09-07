import { escapeRegExp } from "../../utils/escapeRegExp";

type HighlightTextProps = {
  text: string;
  highlight: string;
};

export const HighlightText = ({ text, highlight }: HighlightTextProps) => {
  const term = highlight.trim();
  if (!term) return <>{text}</>;

  const pattern = escapeRegExp(term);
  const splitter = new RegExp(`(${pattern})`, "gi");
  // Separate, non-global instance: `test` on a /g/ regex is stateful and would
  // skip matches depending on the previous call.
  const matcher = new RegExp(`^${pattern}$`, "i");
  const parts = text.split(splitter);

  return (
    <>
      {parts.map((part, index) =>
        matcher.test(part) ? (
          <mark key={index} className="rounded bg-color-primary text-black">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
};
