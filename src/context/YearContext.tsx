import { createContext, useState, type ReactNode } from "react";

type YearContextValue = {
  year: number;
  setYear: (year: number) => void;
};

export const YearContext = createContext<YearContextValue | undefined>(
  undefined
);

export function YearProvider({ children }: { children: ReactNode }) {
  const [year, setYear] = useState<number>(new Date().getFullYear());

  return (
    <YearContext.Provider value={{ year, setYear }}>
      {children}
    </YearContext.Provider>
  );
}
