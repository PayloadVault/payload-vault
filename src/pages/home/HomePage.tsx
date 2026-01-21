import { useState, useEffect } from "react";
import { ContentCard } from "../../components/contentCard/ContentCard";
import { HeaderHome } from "../../components/header/HeaderHome";
import { TotalIncomeCard } from "../../components/totalIncomeCard/TotalIncomeCard";
import { PdfImportFooter } from "../../components/pdfImport/PdfImportFooter";
import { usePdfs } from "../../hooks/usePdf/UsePdfs";
import { useAuth } from "../../context/AuthContext";
import { useYear } from "../../hooks/year/UseYear";
import { formatData } from "./utils";
import type { FullData } from "./types";
import { PageSkeletonLoader } from "../../components/skeletonLoader/PageSkeletonLoader";
import { ErrorBlock } from "../../components/errorBlock/ErrorBlock";

export const HomePage = () => {
  const { user } = useAuth();
  const { year } = useYear();
  const [contentCardData, setContentCardData] = useState<
    FullData | undefined
  >();

  if (!user) return <ErrorBlock />;

  const {
    data: pdfs,
    isLoading,
    error,
  } = usePdfs({
    userId: user.id,
    year,
  });

  useEffect(() => {
    if (pdfs) {
      setContentCardData(formatData(pdfs));
    }
  }, [pdfs]);

  if (error) return <ErrorBlock />;

  return (
    <div className="min-h-screen bg-color-bg">
      <HeaderHome />

      {isLoading || !contentCardData ? (
        <PageSkeletonLoader />
      ) : (
        <main className="flex flex-col mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 gap-10 pb-25">
          <TotalIncomeCard
            title="Total income"
            subtitle={contentCardData.totalPdf.toString() + " · Paychecks"}
            totalIncome={contentCardData.totalIncome}
          />
          <ContentCard
            variant="allPdf"
            title={contentCardData.allPdfs.title}
            subtitle={contentCardData.allPdfs.subtitle}
            link={contentCardData.allPdfs.link}
          />
          <h2 className="text-color-primary font-bold mx-auto">Categories</h2>
          <div className="flex flex-col gap-6">
            {contentCardData.allCategories.map((category) => (
              <ContentCard
                key={category.category.title}
                variant="category"
                title={category.category.title}
                subtitle={category.subtitle.toString() + " · Paychecks"}
                profit={category.profit}
                link={"category/" + category.category.slug}
              />
            ))}
          </div>
        </main>
      )}

      <PdfImportFooter />
    </div>
  );
};
