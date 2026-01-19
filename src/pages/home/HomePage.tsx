import { useState } from "react";
import { ContentCard } from "../../components/contentCard/ContentCard";
import { Dropdown } from "../../components/dropdown/Dropdown";
import {
  type DropdownOptions,
  categorySortOptions,
} from "../../components/dropdown/DropdownOption";
import { HeaderHome } from "../../components/header/HeaderHome";
import { TotalIncomeCard } from "../../components/totalIncomeCard/TotalIncomeCard";
import { PdfImportFooter } from "../../components/pdfImport/PdfImportFooter";

export const HomePage = () => {
  const [sortSelected, setSortSelected] = useState<
    DropdownOptions["categorySort"][number]
  >(categorySortOptions[0]);

  const contentCardData = {
    totalIncome: 12300,
    allPdfs: {
      title: "All PDFs",
      subtitle: "Browse all your PDF documents",
      link: "/all-pdfs",
    },
    categories: [
      {
        title: "Storm & Gas",
        subtitle: "12 documents",
        profit: 5400,
        link: "/category/strom-gas",
      },
      {
        title: "Barmenia Abrechnung",
        subtitle: "12 documents",
        profit: 13400,
        link: "/category/barmenia-abrechnung",
      },
      {
        title: "IKK Abrechnung",
        subtitle: "12 documents",
        profit: 504400,
        link: "/category/ikk-abrechnung",
      },
      {
        title: "Adcuri",
        subtitle: "12 documents",
        profit: 504400,
        link: "/category/adcuri",
      },
    ],
  };

  const sortedCategories = [...contentCardData.categories].sort((a, b) => {
    if (sortSelected.id === "ascending") {
      return a.profit - b.profit;
    }

    return b.profit - a.profit;
  });

  return (
    <div className="min-h-screen bg-color-bg">
      <HeaderHome />
      <main className="flex flex-col mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 gap-10 pb-25">
        <TotalIncomeCard
          title="Total income"
          subtitle="5 paychecks"
          totalIncome={contentCardData.totalIncome}
        />
        <ContentCard
          variant="allPdf"
          title={contentCardData.allPdfs.title}
          subtitle={contentCardData.allPdfs.subtitle}
          link={contentCardData.allPdfs.link}
        />
        <Dropdown
          label="Sort Categories"
          options={categorySortOptions}
          onSelect={setSortSelected}
          value={sortSelected}
        />
        <div className="flex flex-col gap-6">
          {sortedCategories.map((category) => (
            <ContentCard
              key={category.title}
              variant="category"
              title={category.title}
              subtitle={category.subtitle}
              profit={category.profit}
              link={category.link}
            />
          ))}
        </div>
      </main>
      <PdfImportFooter />
    </div>
  );
};
