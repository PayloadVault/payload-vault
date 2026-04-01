import { Outlet } from "react-router-dom";
import { Header } from "../components/header/Header";
import { useState } from "react";
import { PdfImportFooter } from "../components/pdfImport/PdfImportFooter";
import { useYear } from "../hooks/year/UseYear";
import { HeaderHome } from "../components/header/HeaderHome";
import { ExpensePdfImportFooter } from "../components/pdfImport/ExpensePdfImportFooter";
import { MiniFooter } from "../components/footer/MiniFooter";

export const Layout = () => {
  const [title, setTitle] = useState("");
  const { year } = useYear();
  const isSales = window.location.pathname.includes("/einnahmen");

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <HeaderHome isTwoHeaders />
      <Header title={title} subtitle={year.toString()} />

      <main className="flex-1 overflow-y-auto">
        <Outlet context={{ setTitle }} />
        <div className="pb-20">
          <MiniFooter />
        </div>
      </main>

      {isSales ? <PdfImportFooter /> : <ExpensePdfImportFooter />}
    </div>
  );
};
