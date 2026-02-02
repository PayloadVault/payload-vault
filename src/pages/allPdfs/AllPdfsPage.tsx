import JSZip from "jszip";
import { useOutletContext } from "react-router-dom";
import {
  useLayoutEffect,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
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
    setTitle("Alle Dokumente");
  }, [setTitle]);

  const [contentCardData, setContentCardData] = useState<
    AllPdfTypes | undefined
  >();

  const [searchQuery, setSearchQuery] = useState("");

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

  const [categorySelected, setCategorySelected] = useState<
    DropdownOptions["category"][number]
  >(categoryOptions[0]);

  const handleResetFilters = useCallback(() => {
    setSortSelected(paycheckFilterOptions[0]);
    setStartMonthSelected(monthOptions[0]);
    setEndMonthSelected(monthOptions[monthOptions.length - 1]);
    setCategorySelected(categoryOptions[0]);
    setSearchQuery("");
  }, []);

  const {
    data: pdfs,
    isLoading,
    error,
    removePdf,
  } = usePdfs({
    userId: user?.id ?? "",
    year,
    startMonth: Number(startMonthSelected.id) || undefined,
    endMonth: Number(endMonthSelected.id) || undefined,
    sortBy: isSortType(sortSelected.id) ? sortSelected.id : "new",
    category: isCategoryType(categorySelected.id) ? categorySelected.id : "all",
  });

  useEffect(() => {
    if (pdfs) {
      setContentCardData(formatAllPdfs(pdfs));
    }
  }, [pdfs]);

  useEffect(() => {
    handleResetFilters();
  }, [year]);

  useEffect(() => {
    if (
      monthOptions.indexOf(endMonthSelected) <
      monthOptions.indexOf(startMonthSelected)
    ) {
      setEndMonthSelected(startMonthSelected);
    }
  }, [startMonthSelected]);

  if (!user) return <ErrorBlock />;

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
        "Keine PDFs zum Herunterladen",
        "Es sind keine gefilterten PDFs zum Download verfügbar.",
        "error",
      );
      return;
    }

    const slugify = (value: string) =>
      value.toLowerCase().trim().replace(/\s+/g, "_");

    const zipName = [
      user.email ? user.email.split("@")[0] : null,
      startMonthSelected.label,
      endMonthSelected.id !== startMonthSelected.id
        ? `to_${endMonthSelected.label}`
        : null,
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
        }),
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
        "Download gestartet",
        "Deine PDFs werden als ZIP-Datei heruntergeladen.",
        "success",
      );
    } catch (error) {
      showBanner(
        "PDF-Download fehlgeschlagen",
        "Beim Herunterladen der PDFs ist ein Fehler aufgetreten. Bitte versuche es erneut.",
        "error",
      );
    }
  };

  return (
    <main className="flex flex-col mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 gap-10 pb-25">
      <TotalIncomeCard
        title="Gesamteinnahmen"
        subtitle={contentCardData.totalPdf + " · Dokumente"}
        totalIncome={contentCardData.totalIncome}
      />
      <div className="flex flex-col gap-2">
        <div className="grid md:grid-cols-2 gap-2">
          <Dropdown
            label="Sortieren nach"
            options={paycheckFilterOptions}
            onSelect={setSortSelected}
            value={sortSelected}
          />
          <Dropdown
            label="Kategorie auswählen"
            options={categoryOptions}
            onSelect={setCategorySelected}
            value={categorySelected}
          />
          <Dropdown
            label="Startmonat auswählen"
            options={monthOptions}
            onSelect={setStartMonthSelected}
            value={startMonthSelected}
          />
          <Dropdown
            label="Endmonat auswählen"
            options={endMonthOptions}
            onSelect={setEndMonthSelected}
            value={endMonthSelected}
          />
        </div>
        <div className="grid grid-cols-1">
          <SearchBar
            placeholder="Dokumente suchen..."
            onChange={setSearchQuery}
            value={searchQuery}
            debounceMs={200}
            title="Dokumente suchen"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 items-center gap-5">
        <Button
          onClick={handleResetFilters}
          text="Filter zurücksetzen"
          size="medium"
        />
        <Button
          onClick={handleDownloadAll}
          variant="secondary"
          text="Alle gefilterten Dokumente herunterladen"
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
