import { Outlet } from "react-router-dom";
import { Header } from "../components/header/Header";
import { useState } from "react";
import { PdfImportFooter } from "../components/pdfImport/PdfImportFooter";

export const Layout = () => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Header title={title} subtitle={subtitle} />

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet context={{ setTitle, setSubtitle }} />
      </main>

      <PdfImportFooter />
    </div>
  );
};
