import "./App.css";
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/home/HomePage";
import { LoginPage } from "./pages/login/LoginPage";
import { AllPdfsPage } from "./pages/allPdfs/AllPdfsPage";
import { CategoryPage } from "./pages/category/CategoryPage";
import { CategoryPdfsPage } from "./pages/categoryPdfs/CategoryPdfsPage";
import { useEffect } from "react";
import { Layout } from "./pages/layout";

export default function App() {
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const theme = saved ?? (prefersDark ? "dark" : "light");

    document.documentElement.dataset.theme = theme;
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<Layout />}>
          <Route path="/all-pdfs" element={<AllPdfsPage />} />

          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/category/:slug/pdfs" element={<CategoryPdfsPage />} />

          <Route path="/category/:slug/:subSlug" element={<CategoryPage />} />
          <Route
            path="/category/:slug/:subSlug/pdfs"
            element={<CategoryPdfsPage />}
          />
        </Route>
      </Routes>
    </>
  );
}
