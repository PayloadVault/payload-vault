import { Outlet } from "react-router-dom";
import { useState } from "react";
import { PdfImportFooter } from "../components/pdfImport/PdfImportFooter";
import { useYear } from "../hooks/year/UseYear";
import { HeaderHome } from "../components/header/HeaderHome";
import { ExpensePdfImportFooter } from "../components/pdfImport/ExpensePdfImportFooter";
import { MiniFooter } from "../components/footer/MiniFooter";
import { BulkSelectProvider } from "../context/BulkSelectContext";

export const Layout = () => {
  const [title, setTitle] = useState("");
  const { year } = useYear();
  const isSales = window.location.pathname.includes("/einnahmen");

  return (
    <BulkSelectProvider>
      <div className="flex flex-col min-h-screen">
        <div className="sticky top-0 z-40">
          <HeaderHome
            isTwoHeaders
            isSticky={false}
            pageTitle={title}
            pageSubtitle={year.toString()}
          />
        </div>

        <main className="flex-1 flex flex-col">
          <div className="flex-1">
            <Outlet context={{ setTitle }} />
          </div>
          <div className="pb-20">
            <MiniFooter />
          </div>
        </main>

        {isSales ? <PdfImportFooter /> : <ExpensePdfImportFooter />}
      </div>
    </BulkSelectProvider>
  );
};
