import { Fragment } from "react";
import { IMPRESSUM_DATA } from "./ImpressumData";
import { renderContentBlock } from "./DataRenderer";

export const ImpressumPage = () => {
  const { header, sections } = IMPRESSUM_DATA;

  return (
    <main className="flex flex-col items-center w-full">
      {/* Header Section */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col items-center">
        <div className="text-center space-y-3 px-3">
          <h3 className="tracking-wide text-xl sm:text-2xl md:text-3xl font-semibold text-(--color-primary)">
            {header.subtitle}
          </h3>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight">
            {header.title}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-(--color-text-subtle)">
            {header.description}
          </p>
        </div>
      </section>

      {/* Content Card */}
      <section className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-xl bg-(--color-bg-alt) border border-(--color-border-light) shadow-shadow-medium p-6 sm:p-8 md:p-10">
          <div className="space-y-10 text-sm sm:text-base leading-relaxed">
            {sections.map((section, sectionIndex) => (
              <Fragment key={section.id}>
                <section>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-(--color-primary)/15 text-(--color-primary) font-bold">
                      {section.id}
                    </span>
                    <h2 className="text-lg sm:text-xl font-semibold">
                      {section.title}
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {section.content.map((block, blockIndex) =>
                      renderContentBlock(block, blockIndex)
                    )}
                  </div>
                </section>
                {sectionIndex < sections.length - 1 && (
                  <hr className="border-(--color-border-light)/60" />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
