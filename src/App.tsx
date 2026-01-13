import "./App.css";
import { TotalIncomeCard } from "./components/totalIncomeCard/TotalIncomeCard";

function App() {
  return (
    <div>
      aplikacija
      <TotalIncomeCard
        title="Total income 2025"
        totalIncome={12213.431}
        subtitle="75 paychecks"
      />
    </div>
  );
}

export default App;
