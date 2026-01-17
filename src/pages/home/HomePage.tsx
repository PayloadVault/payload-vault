import { useState } from "react";
import { ContentCard } from "../../components/contentCard/ContentCard";
import { Dropdown } from "../../components/dropdown/Dropdown";
import {
  type DropdownOptions,
  categorySortOptions,
} from "../../components/dropdown/DropdownOption";
import { HeaderHome } from "../../components/header/HeaderHome";
import { TotalIncomeCard } from "../../components/totalIncomeCard/TotalIncomeCard";

export const HomePage = () => {
  const [sortSelected, setSortSelected] = useState<
    DropdownOptions["categorySort"][number]
  >(categorySortOptions[0]);

  return (
    <div className="min-h-screen bg-color-bg">
      <HeaderHome />
      <main className="flex flex-col mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 gap-10">
        <TotalIncomeCard
          title="Total income"
          subtitle="5 paychecks"
          totalIncome={12300}
        />
        <ContentCard
          variant="allPdf"
          title="All PDFs"
          subtitle="Browse all your PDF documents"
          link="/all-pdfs"
        />
        <Dropdown
          label="Sort Categories"
          options={categorySortOptions}
          onSelect={setSortSelected}
          value={sortSelected}
        />
        <ContentCard
          variant="category"
          title="Storm & Gas"
          subtitle="12 documents"
          profit={5400}
          link="/category/strom-gas"
        />
        <ContentCard
          variant="category"
          title="Barmenia Abrechnung"
          subtitle="12 documents"
          profit={13400}
          link="/category/barmenia-abrechnung"
        />
        <ContentCard
          variant="category"
          title="IKK Abrechnung"
          subtitle="12 documents"
          profit={504400}
          link="/category/ikk-abrechnung"
        />
        <ContentCard
          variant="category"
          title="Adcuri"
          subtitle="12 documents"
          profit={504400}
          link="/category/adcuri"
        />
      </main>
    </div>
  );
};
