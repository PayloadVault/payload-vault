import { createContext, useState, useEffect, type ReactNode } from "react";

type YearContextValue = {
  year: number;
  setYear: (year: number) => void;
};

export const YearContext = createContext<YearContextValue | undefined>(
  undefined
);

const storageKey = "selectedYear";

export function YearProvider({ children }: { children: ReactNode }) {
  const [year, setYear] = useState<number>(() => {
    if (typeof window === "undefined") {
      return new Date().getFullYear();
    }

    const storedYear = localStorage.getItem(storageKey);
    return storedYear ? Number(storedYear) : new Date().getFullYear();
  });

  useEffect(() => {
    localStorage.setItem(storageKey, year.toString());
  }, [year]);

  return (
    <YearContext.Provider value={{ year, setYear }}>
      {children}
    </YearContext.Provider>
  );
}
