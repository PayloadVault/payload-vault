import { useState } from "react";
import {
  type DropdownOptions,
  categorySortOptions,
} from "../../components/dropdown/DropdownOption";
import { Dropdown } from "../../components/dropdown/Dropdown";
import { ContentCard } from "../../components/contentCard/ContentCard";
import { TotalIncomeCard } from "../../components/totalIncomeCard/TotalIncomeCard";

export const AdcuriPage = () => {
  const [sortSelected, setSortSelected] = useState<
    DropdownOptions["categorySort"][number]
  >(categorySortOptions[0]);

  const contentCardData = {
    totalIncome: 504400,
    categories: [
      {
        title: "Adcuri Abschlussprovision",
        subtitle: "12 documents",
        profit: 5400,
        link: "/category/adcuri/abschlussprovision",
      },
      {
        title: "Adcuri Bestandsprovision",
        subtitle: "12 documents",
        profit: 13400,
        link: "/category/adcuri/bestandsprovision",
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
    <main className="flex flex-col mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 gap-10 pb-25">
      <TotalIncomeCard
        title="Adcuri total income"
        subtitle="5 paychecks"
        totalIncome={contentCardData.totalIncome}
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
  );
};
