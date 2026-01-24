import JSZip from "jszip";
import { useOutletContext } from "react-router-dom";
import { useLayoutEffect, useState, useEffect, useMemo } from "react";
import {
  type DropdownOptions,
  paycheckFilterOptions,
  monthOptions,
  categoryOptions,
  isSortType,
  isCategoryType,
} from "../../components/dropdown/DropdownOption";
import { Dropdown } from "../../components/dropdown/Dropdown";
import { ContentCard } from "../../components/contentCard/ContentCard";
import { TotalIncomeCard } from "../../components/totalIncomeCard/TotalIncomeCard";
import { SearchBar } from "../../components/searchBar/SearchBar";
import { usePdfs } from "../../hooks/usePdf/UsePdfs";
import { useAuth } from "../../context/AuthContext";
import { useYear } from "../../hooks/year/UseYear";
import { ErrorBlock } from "../../components/errorBlock/ErrorBlock";
import { formatAllPdfs } from "./utils";
import type { AllPdfTypes } from "./types";
import { PageSkeletonLoader } from "../../components/skeletonLoader/PageSkeletonLoader";
import { DocumentSkeletonLoader } from "../../components/skeletonLoader/DocumentSkeletonLoader";
import { Button } from "../../components/button/Button";
import { useBanner } from "../../context/banner/BannerContext";

export const AllPdfsPage = () => {
  const { user } = useAuth();
  const { year } = useYear();

  const { showBanner } = useBanner();

  const { setTitle } = useOutletContext<{
    setTitle: (title: string) => void;
  }>();

  useLayoutEffect(() => {
    setTitle("All PDFs");
  }, [setTitle]);

  const [contentCardData, setContentCardData] = useState<
    AllPdfTypes | undefined
  >();

  const [searchQuery, setSearchQuery] = useState("");

  const [sortSelected, setSortSelected] = useState<
    DropdownOptions["paycheckFilter"][number]
  >(paycheckFilterOptions[0]);

  const [monthSelected, setMonthSelected] = useState<
    DropdownOptions["month"][number]
  >(monthOptions[0]);

  const [categorySelected, setCategorySelected] = useState<
    DropdownOptions["category"][number]
  >(categoryOptions[0]);

  const handleResetFilters = () => {
    setSortSelected(paycheckFilterOptions[0]);
    setMonthSelected(monthOptions[0]);
    setCategorySelected(categoryOptions[0]);
    setSearchQuery("");
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
    month: Number(monthSelected.id) || undefined,
    sortBy: isSortType(sortSelected.id) ? sortSelected.id : "new",
    category: isCategoryType(categorySelected.id) ? categorySelected.id : "all",
  });

  useEffect(() => {
    if (pdfs) {
      setContentCardData(formatAllPdfs(pdfs));
    }
  }, [pdfs]);

  const filteredPdfs = useMemo(() => {
    if (!contentCardData) return [];

    return contentCardData.pdfs.filter((pdf) => {
      if (searchQuery.trim() === "") return true;
      return pdf.title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [contentCardData, searchQuery]);

  if (!contentCardData) return <PageSkeletonLoader />;

  if (error) return <ErrorBlock />;

  const handleDownloadAll = async () => {
    const zip = new JSZip();

    if (filteredPdfs.length === 0) {
      showBanner(
        "No PDFs to download",
        "There are no filtered PDFs available for download.",
        "error"
      );
      return;
    }

    const slugify = (value: string) =>
      value.toLowerCase().trim().replace(/\s+/g, "_");

    const zipName = [
      user.email ? user.email.split("@")[0] : null,
      monthSelected.id !== "0" ? monthSelected.label : null,
      `${year}`,
      categorySelected.id,
      searchQuery ? `search_${searchQuery}` : null,
    ]
      .filter((v): v is string => Boolean(v))
      .map(slugify)
      .join("_")
      .concat("_documents.zip");

    try {
      await Promise.all(
        filteredPdfs.map(async (pdf, index) => {
          if (!pdf.signedUrl) return;

          const response = await fetch(pdf.signedUrl);
          const blob = await response.blob();

          const fileName =
            pdf.title?.replace(/[^\w\d]+/g, "_") || `document_${index + 1}.pdf`;

          zip.file(`${fileName}.pdf`, blob);
        })
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = zipName;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showBanner(
        "Download started",
        "Your PDFs are being downloaded as a ZIP file.",
        "success"
      );
    } catch (error) {
      showBanner(
        "Failed to download PDFs",
        "Something went wrong while downloading PDFs. Please try again.",
        "error"
      );
    }
  };

  return (
    <main className="flex flex-col mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 gap-10 pb-25">
      <TotalIncomeCard
        title="Total income"
        subtitle={contentCardData.totalPdf + " · documents"}
        totalIncome={contentCardData.totalIncome}
      />
      <div className="grid md:grid-cols-2 gap-2">
        <Dropdown
          label="Sort By"
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
        <Dropdown
          label="Choose Category"
          options={categoryOptions}
          onSelect={setCategorySelected}
          value={categorySelected}
        />
        <SearchBar
          placeholder="Search PDFs..."
          onChange={setSearchQuery}
          value={searchQuery}
          debounceMs={200}
          title="Search PDFs"
        />
      </div>
      <div className="grid grid-cols-1 items-center gap-5">
        <Button
          onClick={handleResetFilters}
          text="Reset Filters"
          size="medium"
        />
        <Button
          onClick={handleDownloadAll}
          variant="secondary"
          text="Download All Filtered PDFs"
          size="medium"
        />
      </div>
      {isLoading ? (
        <DocumentSkeletonLoader />
      ) : (
        <div className="flex flex-col gap-6">
          {filteredPdfs.map((pdf, index) => (
            <ContentCard
              key={pdf.id || index}
              variant="document"
              title={pdf.title}
              date={pdf.date}
              profit={pdf.income}
              downloadLink={pdf.signedUrl}
              openLink={pdf.openLink}
              searchQuery={searchQuery}
              id={pdf.id}
              onDelete={(id) => removePdf.mutate(id)}
            />
          ))}
        </div>
      )}
    </main>
  );
};
