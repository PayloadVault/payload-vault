import { Outlet } from "react-router-dom";
import { Header } from "../components/header/Header";
import { useState } from "react";
import { PdfImportFooter } from "../components/pdfImport/PdfImportFooter";
import { useYear } from "../hooks/year/UseYear";
import { HeaderHome } from "../components/header/HeaderHome";
import { Footer } from "../components/footer/Footer";

export const Layout = () => {
  const [title, setTitle] = useState("");
  const { year } = useYear();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <HeaderHome isTwoHeaders />
      <Header title={title} subtitle={year.toString()} />

      <main className="flex-1 overflow-y-auto">
        <Outlet context={{ setTitle }} />
      </main>

      <Footer />
      <PdfImportFooter />
    </div>
  );
};
