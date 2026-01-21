import type { Option } from "./Dropdown.types";
import type { SortTypes, HomeSort, Category } from "../../hooks/usePdf/types";

export const paycheckFilterOptions: Option[] = [
  { id: "new", label: "Newest First" },
  { id: "old", label: "Oldest First" },
  { id: "high", label: "High To Low" },
  { id: "low", label: "Low To High" },
];

export const categorySortOptions: Option[] = [
  { label: "High To Low", id: "high" },
  { label: "Low To High", id: "low" },
  { label: "Most To Least", id: "most" },
  { label: "Least To Most", id: "least" },
];

export const monthOptions: Option[] = [
  { id: "0", label: "All Months" },
  { id: "1", label: "January" },
  { id: "2", label: "February" },
  { id: "3", label: "March" },
  { id: "4", label: "April" },
  { id: "5", label: "May" },
  { id: "6", label: "June" },
  { id: "7", label: "July" },
  { id: "8", label: "August" },
  { id: "9", label: "September" },
  { id: "10", label: "October" },
  { id: "11", label: "November" },
  { id: "12", label: "December" },
];

export const categoryOptions: Option[] = [
  { id: "all", label: "All Categories" },
  { id: "Strom & Gas", label: "Strom & Gas" },
  { id: "Barmenia Abrechnung", label: "Barmenia Abrechnung" },
  { id: "IKK Abrechnung", label: "IKK Abrechnung" },
  { id: "Adcuri Abschlussprovision", label: "Adcuri Abschlussprovision" },
  { id: "Adcuri Bestandsprovision", label: "Adcuri Bestandsprovision" },
];

export const dropdownOptions = {
  paycheckFilter: paycheckFilterOptions,
  month: monthOptions,
  categorySort: categorySortOptions,
  category: categoryOptions,
} as const;

export function isSortType(value: string): value is SortTypes {
  return ["new", "old", "high", "low"].includes(value);
}

export function isHomeSortType(value: string): value is HomeSort {
  return ["low", "high", "most", "least"].includes(value);
}

export function isCategoryType(value: string): value is Category {
  return [
    "all",
    "Strom & Gas",
    "Barmenia Abrechnung",
    "IKK Abrechnung",
    "Adcuri Abschlussprovision",
    "Adcuri Bestandsprovision",
  ].includes(value);
}

export type DropdownOptions = typeof dropdownOptions;
