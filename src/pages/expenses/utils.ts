import type { HomeSort } from "../../hooks/usePdf/types";
import type { ExpenseRecord } from "../../hooks/useExpenses/types";
import type { CategoryData, FullData } from "./types";
import { type Category } from "../../data/Categories";

const EXPENSE_CATEGORIES: Category[] = [
  { slug: "mobilitaet", title: "Mobilität" },
  { slug: "geschaeftsessen", title: "Geschäftsessen" },
  { slug: "buero-arbeitsmittel", title: "Büro & Arbeitsmittel" },
  { slug: "kommunikation", title: "Kommunikation" },
  { slug: "weiterbildung", title: "Weiterbildung" },
  { slug: "reisen", title: "Reisen" },
  { slug: "versicherungen", title: "Versicherungen" },
  { slug: "bank-gebuehren", title: "Bank & Gebühren" },
  { slug: "marketing", title: "Marketing" },
  { slug: "sonstiges", title: "Sonstiges" },
];

const formatExpenses = (expenses: ExpenseRecord[]): FullData => {
  let totalAmount = 0;
  let totalExpenses = 0;

  const allData: CategoryData[] = EXPENSE_CATEGORIES.map((category) => ({
    category,
    profit: 0,
    subtitle: 0,
  }));

  expenses.forEach((expense) => {
    totalAmount += expense.amount;
    totalExpenses++;

    const match = allData.find((d) => d.category.title === expense.category);
    if (match) {
      match.profit += expense.amount;
      match.subtitle++;
    }
  });

  return {
    totalIncome: totalAmount,
    totalPdf: totalExpenses,
    allCategories: allData,
    allPdfs: {
      title: "Alle Ausgaben",
      subtitle: "Alle Ausgaben durchsuchen · " + expenses.length,
      link: "/alle-ausgaben",
    },
  };
};

const sortData = (fullData: FullData, sort: HomeSort) => {
  const sortedCategories = [...fullData.allCategories];

  switch (sort) {
    case "high":
      sortedCategories.sort((a, b) => b.profit - a.profit);
      break;
    case "low":
      sortedCategories.sort((a, b) => a.profit - b.profit);
      break;
    case "most":
      sortedCategories.sort((a, b) => b.subtitle - a.subtitle);
      break;
    case "least":
      sortedCategories.sort((a, b) => a.subtitle - b.subtitle);
      break;
    default:
      break;
  }

  return {
    ...fullData,
    allCategories: sortedCategories,
  };
};

export { formatExpenses, sortData, EXPENSE_CATEGORIES };
