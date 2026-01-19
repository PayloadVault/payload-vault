import { useOutletContext } from "react-router-dom";
import { useLayoutEffect, useState, useMemo } from "react";
import {
  type DropdownOptions,
  paycheckFilterOptions,
  monthOptions,
  categoryOptions,
} from "../../components/dropdown/DropdownOption";
import { Dropdown } from "../../components/dropdown/Dropdown";
import { ContentCard } from "../../components/contentCard/ContentCard";
import { TotalIncomeCard } from "../../components/totalIncomeCard/TotalIncomeCard";
import { SearchBar } from "../../components/searchBar/SearchBar";

export const AllPdfsPage = () => {
  const { setTitle, setSubtitle } = useOutletContext<{
    setTitle: (title: string) => void;
    setSubtitle: (subtitle: string) => void;
  }>();

  useLayoutEffect(() => {
    setTitle("All PDFs");
    setSubtitle("year");
  }, [setTitle, setSubtitle]);

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

  const getMonthIdFromDate = (date: string) => {
    const monthIndex = new Date(date).getMonth();

    const monthIds = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    return monthIds[monthIndex];
  };

  const contentCardData = {
    totalIncome: 504400,
    pdfs: [
      {
        title: "Adcuri Abschlussprovision Document 1",
        date: "2023-01-15",
        profit: 5400,
        downloadLink: "/category/adcuri/abschlussprovision/document1.pdf",
        openLink: "/category/adcuri/abschlussprovision/document1",
        category: "Adcuri Abschlussprovision",
      },
      {
        title: "Adcuri Abschlussprovision Document 2",
        date: "2023-04-15",
        profit: 13400,
        downloadLink: "/category/adcuri/abschlussprovision/document2.pdf",
        openLink: "/category/adcuri/abschlussprovision/document2",
        category: "Adcuri Abschlussprovision",
      },
      {
        title: "Adcuri Abschlussprovision Document 3",
        date: "2023-03-15",
        profit: 20400,
        downloadLink: "/category/adcuri/abschlussprovision/document3.pdf",
        openLink: "/category/adcuri/abschlussprovision/document3",
        category: "Strom & Gas",
      },
      {
        title: "Adcuri Abschlussprovision Document 4",
        date: "2023-04-15",
        profit: 3400,
        downloadLink: "/category/adcuri/abschlussprovision/document4.pdf",
        openLink: "/category/adcuri/abschlussprovision/document4",
        category: "Adcuri Abschlussprovision",
      },
      {
        title: "Adcuri Bestandsprovision Document 1",
        date: "2023-03-15",
        profit: 1400,
        downloadLink: "/category/adcuri/bestandsprovision/document1.pdf",
        openLink: "/category/adcuri/bestandsprovision/document1",
        category: "Adcuri Bestandsprovision",
      },
      {
        title: "Adcuri Bestandsprovision Document 2",
        date: "2023-05-15",
        profit: 400,
        downloadLink: "/category/adcuri/bestandsprovision/document2.pdf",
        openLink: "/category/adcuri/bestandsprovision/document2",
        category: "Adcuri Bestandsprovision",
      },
      {
        title: "Adcuri Bestandsprovision Document 3",
        date: "2023-04-15",
        profit: 12400,
        downloadLink: "/category/adcuri/bestandsprovision/document3.pdf",
        openLink: "/category/adcuri/bestandsprovision/document3",
        category: "Adcuri Bestandsprovision",
      },
    ],
  };

  const sortedPdfs = useMemo(() => {
    const filtered = contentCardData.pdfs.filter((pdf) => {
      if (
        monthSelected.id !== "all" &&
        getMonthIdFromDate(pdf.date) !== monthSelected.id
      ) {
        return false;
      }

      if (
        categorySelected.id !== "all" &&
        pdf.category !== categorySelected.label
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        return pdf.title.toLowerCase().includes(searchQuery.toLowerCase());
      }

      return true;
    });

    return filtered.sort((a, b) => {
      switch (sortSelected.id) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();

        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();

        case "high":
          return b.profit - a.profit;

        case "low":
          return a.profit - b.profit;

        default:
          return 0;
      }
    });
  }, [
    contentCardData.pdfs,
    monthSelected.id,
    categorySelected.id,
    sortSelected.id,
    searchQuery,
  ]);

  return (
    <main className="flex flex-col mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 gap-10 pb-25">
      <TotalIncomeCard
        title="Total income"
        subtitle={contentCardData.pdfs.length + " documents"}
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
      <div className="flex flex-col gap-6">
        {sortedPdfs.map((pdf) => (
          <ContentCard
            key={pdf.title}
            variant="document"
            title={pdf.title}
            date={pdf.date}
            profit={pdf.profit}
            downloadLink={pdf.downloadLink}
            openLink={pdf.openLink}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </main>
  );
};
