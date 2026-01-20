import type { Option } from "./Dropdown.types";
import type { SortTypes, HomeSort } from "../../hooks/usePdf/types";

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
  { id: "all", label: "All Months" },
  { id: "january", label: "January" },
  { id: "february", label: "February" },
  { id: "march", label: "March" },
  { id: "april", label: "April" },
  { id: "may", label: "May" },
  { id: "june", label: "June" },
  { id: "july", label: "July" },
  { id: "august", label: "August" },
  { id: "september", label: "September" },
  { id: "october", label: "October" },
  { id: "november", label: "November" },
  { id: "december", label: "December" },
];

export const categoryOptions: Option[] = [
  { id: "all", label: "All Categories" },
  { id: "strom-gas", label: "Strom & Gas" },
  { id: "barmenia-abrechnung", label: "Barmenia Abrechnung" },
  { id: "ikk-abrechnung", label: "IKK Abrechnung" },
  { id: "adcuri/abschlussprovision", label: "Adcuri Abschlussprovision" },
  { id: "adcuri/bestandsprovision", label: "Adcuri Bestandsprovision" },
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

export type DropdownOptions = typeof dropdownOptions;
