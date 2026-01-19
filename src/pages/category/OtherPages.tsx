import { useState, useMemo } from "react";
import {
  type DropdownOptions,
  paycheckFilterOptions,
  monthOptions,
} from "../../components/dropdown/DropdownOption";
import { Dropdown } from "../../components/dropdown/Dropdown";
import { ContentCard } from "../../components/contentCard/ContentCard";
import { TotalIncomeCard } from "../../components/totalIncomeCard/TotalIncomeCard";

type CategoryProps = {
  title: string;
};

export const OtherPages = ({ title }: CategoryProps) => {
  const [sortSelected, setSortSelected] = useState<
    DropdownOptions["paycheckFilter"][number]
  >(paycheckFilterOptions[0]);

  const [monthSelected, setMonthSelected] = useState<
    DropdownOptions["month"][number]
  >(monthOptions[0]);

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
      },
      {
        title: "Adcuri Abschlussprovision Document 2",
        date: "2023-02-15",
        profit: 13400,
        downloadLink: "/category/adcuri/abschlussprovision/document2.pdf",
        openLink: "/category/adcuri/abschlussprovision/document2",
      },
      {
        title: "Adcuri Abschlussprovision Document 3",
        date: "2023-03-15",
        profit: 20400,
        downloadLink: "/category/adcuri/abschlussprovision/document3.pdf",
        openLink: "/category/adcuri/abschlussprovision/document3",
      },
      {
        title: "Adcuri Abschlussprovision Document 4",
        date: "2023-04-15",
        profit: 30400,
        downloadLink: "/category/adcuri/abschlussprovision/document4.pdf",
        openLink: "/category/adcuri/abschlussprovision/document4",
      },
    ],
  };

  const sortedPdfs = useMemo(() => {
    const filtered = contentCardData.pdfs.filter((pdf) => {
      if (monthSelected.id === "all") return true;
      return getMonthIdFromDate(pdf.date) === monthSelected.id;
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
  }, [contentCardData.pdfs, monthSelected.id, sortSelected.id]);

  return (
    <main className="flex flex-col mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 gap-10 pb-25">
      <TotalIncomeCard
        title={title}
        subtitle="5 paychecks"
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
          />
        ))}
      </div>
    </main>
  );
};
