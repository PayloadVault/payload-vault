import type { Option } from "./Dropdown.types";

export const paycheckFilterOptions: Option[] = [
  { id: "newest", label: "Newest First" },
  { id: "oldest", label: "Oldest First" },
  { id: "high", label: "High To Low" },
  { id: "low", label: "Low To High" },
];

export const categorySortOptions: Option[] = [
  { label: "High To Low", id: "descending" },
  { label: "Low To High", id: "ascending" },
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

export type DropdownOptions = typeof dropdownOptions;
