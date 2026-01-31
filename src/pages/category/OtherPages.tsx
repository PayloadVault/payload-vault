import { useState, useEffect, useMemo } from "react";
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

  const [startMonthSelected, setStartMonthSelected] = useState<
    DropdownOptions["month"][number]
  >(monthOptions[0]);
  const [endMonthSelected, setEndMonthSelected] = useState<
    DropdownOptions["month"][number]
  >(monthOptions[monthOptions.length - 1]);

  const endMonthOptions = useMemo(
    () => monthOptions.slice(monthOptions.indexOf(startMonthSelected)),
    [startMonthSelected],
  );

  const [contentCardData, setContentCardData] = useState<
    AllPdfTypes | undefined
  >();

  const handleResetFilters = () => {
    setSortSelected(paycheckFilterOptions[0]);
    setStartMonthSelected(monthOptions[0]);
    setEndMonthSelected(monthOptions[monthOptions.length - 1]);
  };

  if (!user) return <ErrorBlock />;

  const {
    data: pdfs,
    isLoading,
    error,
    removePdf,
  } = usePdfs({
    userId: user.id,
    year,
    startMonth: Number(startMonthSelected.id) || undefined,
    endMonth: Number(endMonthSelected.id) || undefined,
    sortBy: isSortType(sortSelected.id) ? sortSelected.id : "new",
    category: isCategoryType(title) ? title : "all",
  });

  useEffect(() => {
    if (pdfs) {
      setContentCardData(formatAllPdfs(pdfs));
    }
  }, [pdfs]);

  useEffect(() => {
    if (
      monthOptions.indexOf(endMonthSelected) <
      monthOptions.indexOf(startMonthSelected)
    ) {
      setEndMonthSelected(startMonthSelected);
    }
  }, [startMonthSelected]);

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
          label="Choose Month"
          options={monthOptions}
          onSelect={setStartMonthSelected}
          value={startMonthSelected}
        />
        <Dropdown
          label="Choose Month"
          options={endMonthOptions}
          onSelect={setEndMonthSelected}
          value={endMonthSelected}
        />
        <Dropdown
          label="Sort Documents"
          options={paycheckFilterOptions}
          onSelect={setSortSelected}
          value={sortSelected}
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
          {contentCardData.pdfs.map((pdf, index) => (
            <ContentCard
              key={pdf.id || index}
              variant="document"
              title={pdf.title}
              date={pdf.date}
              profit={pdf.income}
              downloadLink={pdf.signedUrl}
              openLink={pdf.openLink}
              id={pdf.id}
              onDelete={(id) => removePdf.mutate(id)}
            />
          ))}
        </div>
      )}
    </main>
  );
};
