import { ContentCard } from "../../components/contentCard/ContentCard";
import { HeaderHome } from "../../components/header/HeaderHome";
import { TotalIncomeCard } from "../../components/totalIncomeCard/TotalIncomeCard";
import { useAuth } from "../../context/AuthContext";
import { ErrorBlock } from "../../components/errorBlock/ErrorBlock";

export const HomePage = () => {
  const { user } = useAuth();

  if (!user) return <ErrorBlock />;

  const contentCardData = {
    totalPdf: 15,
    totalIncome: 124463,
    allCategories: [
      {
        category: {
          title: "Einnahmen",
          slug: "einnahmen",
        },
        subtitle: 10,
        profit: 100000,
      },
      {
        category: {
          title: "Steuerrelevante Ausgaben",
          slug: "steuerrelevante-ausgaben",
        },
        subtitle: 5,
        profit: 24463,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-color-bg">
      <HeaderHome />
      <main className="flex flex-col mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 gap-10 pb-25">
        <TotalIncomeCard
          title="Gesamteinnahmen"
          subtitle={contentCardData.totalPdf + " · Abrechnungen"}
          totalIncome={contentCardData.totalIncome}
        />
        <TotalIncomeCard
          variant="expense"
          title="Gesamtkosten"
          subtitle={contentCardData.totalPdf + " · Rechnungen"}
          totalIncome={contentCardData.totalIncome}
        />
        <h2 className="text-color-primary font-bold mx-auto">Kategorien</h2>
        <div className="flex flex-col gap-6">
          {contentCardData.allCategories.map((category, index) => (
            <ContentCard
              key={index}
              variant="category"
              title={category.category.title}
              subtitle={
                category.subtitle.toString() +
                " · " +
                (category.category.slug === "einnahmen"
                  ? "Abrechnungen"
                  : "Rechnungen")
              }
              profit={category.profit}
              link={category.category.slug}
            />
          ))}
        </div>
      </main>
    </div>
  );
};
