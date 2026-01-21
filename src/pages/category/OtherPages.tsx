import { useState, useEffect } from "react";
import {
  type DropdownOptions,
  paycheckFilterOptions,
  monthOptions,
  isSortType,
  isCategoryType,
} from "../../components/dropdown/DropdownOption";
import { Dropdown } from "../../components/dropdown/Dropdown";
import { ContentCard } from "../../components/contentCard/ContentCard";
import { TotalIncomeCard } from "../../components/totalIncomeCard/TotalIncomeCard";
import { useAuth } from "../../context/AuthContext";
import { useYear } from "../../hooks/year/UseYear";
import type { AllPdfTypes } from "../allPdfs/types";
import { usePdfs } from "../../hooks/usePdf/UsePdfs";
import { formatAllPdfs } from "../allPdfs/utils";
import { ErrorBlock } from "../../components/errorBlock/ErrorBlock";
import { PageSkeletonLoader } from "../../components/skeletonLoader/PageSkeletonLoader";
import { DocumentSkeletonLoader } from "../../components/skeletonLoader/DocumentSkeletonLoader";
import { Button } from "../../components/button/Button";

type CategoryProps = {
  title: string;
};

export const OtherPages = ({ title }: CategoryProps) => {
  const { user } = useAuth();
  const { year } = useYear();

  const [sortSelected, setSortSelected] = useState<
    DropdownOptions["paycheckFilter"][number]
  >(paycheckFilterOptions[0]);

  const [monthSelected, setMonthSelected] = useState<
    DropdownOptions["month"][number]
  >(monthOptions[0]);

  const [contentCardData, setContentCardData] = useState<
    AllPdfTypes | undefined
  >();

  const handleResetFilters = () => {
    setSortSelected(paycheckFilterOptions[0]);
    setMonthSelected(monthOptions[0]);
  };

  if (!user) return <ErrorBlock />;

  const {
    data: pdfs,
    isLoading,
    error,
  } = usePdfs({
    userId: user.id,
    year,
    month: Number(monthSelected.id) || undefined,
    sortBy: isSortType(sortSelected.id) ? sortSelected.id : "new",
    category: isCategoryType(title) ? title : "all",
  });

  useEffect(() => {
    if (pdfs) {
      setContentCardData(formatAllPdfs(pdfs));
    }
  }, [pdfs]);

  if (!contentCardData) return <PageSkeletonLoader />;

  if (error) return <ErrorBlock />;

  return (
    <main className="flex flex-col mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 gap-10 pb-25">
      <TotalIncomeCard
        title={title}
        subtitle={contentCardData.totalPdf.toString() + " · Paychecks"}
        totalIncome={contentCardData.totalIncome}
      />
      <div className="grid md:grid-cols-2 gap-2">
        <Dropdown
          label="Sort Categories"
          options={paycheckFilterOptions}
          onSelect={setSortSelected}
          value={sortSelected}
        />
        <Dropdown
          label="Choose Month"
          options={monthOptions}
          onSelect={setMonthSelected}
          value={monthSelected}
        />
      </div>
      <div className="grid grid-cols-1 items-center">
        <Button
          onClick={handleResetFilters}
          text="Reset Filters"
          size="medium"
        />
      </div>
      {isLoading ? (
        <DocumentSkeletonLoader />
      ) : (
        <div className="flex flex-col gap-6">
          {contentCardData.pdfs.map((pdf) => (
            <ContentCard
              key={pdf.income + pdf.date + pdf.category}
              variant="document"
              title={pdf.title}
              date={pdf.date}
              profit={pdf.income}
              downloadLink={pdf.downloadLink}
              openLink={pdf.openLink}
            />
          ))}
        </div>
      )}
    </main>
  );
};
