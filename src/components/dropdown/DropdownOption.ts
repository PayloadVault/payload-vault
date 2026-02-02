import type { Option } from "./Dropdown.types";
import type { Category, HomeSort, SortTypes } from "../../hooks/usePdf/types";

export const paycheckFilterOptions: Option[] = [
  { id: "new", label: "Neueste zuerst" },
  { id: "old", label: "Älteste zuerst" },
  { id: "high", label: "Höchster zuerst" },
  { id: "low", label: "Niedrigster zuerst" },
];

export const categorySortOptions: Option[] = [
  { label: "Höchster zu niedrigster", id: "high" },
  { label: "Niedrigster zu höchster", id: "low" },
  { label: "Meiste zu wenigste", id: "most" },
  { label: "Wenigste zu meiste", id: "least" },
];

export const monthOptions: Option[] = [
  { id: "1", label: "Januar" },
  { id: "2", label: "Februar" },
  { id: "3", label: "März" },
  { id: "4", label: "April" },
  { id: "5", label: "Mai" },
  { id: "6", label: "Juni" },
  { id: "7", label: "Juli" },
  { id: "8", label: "August" },
  { id: "9", label: "September" },
  { id: "10", label: "Oktober" },
  { id: "11", label: "November" },
  { id: "12", label: "Dezember" },
];

export const categoryOptions: Option[] = [
  { id: "all", label: "Alle Kategorien" },
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
