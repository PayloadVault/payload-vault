import { HeaderHome } from "../../components/header/HeaderHome";
import { TotalIncomeCard } from "../../components/totalIncomeCard/TotalIncomeCard";

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-color-bg">
      <HeaderHome />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <TotalIncomeCard
          title="Total income"
          subtitle="5 paychecks"
          totalIncome={12300}
        />
      </main>
    </div>
  );
};
