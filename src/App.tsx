import "./App.css";
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/home/HomePage";
import { LoginPage } from "./pages/login/LoginPage";
import { AllPdfsPage } from "./pages/allPdfs/AllPdfsPage";
import { CategoryPage } from "./pages/category/CategoryPage";
import { CategoryPdfsPage } from "./pages/categoryPdfs/CategoryPdfsPage";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/all-pdfs" element={<AllPdfsPage />} />

        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/category/:slug/pdfs" element={<CategoryPdfsPage />} />

        <Route path="/category/:slug/:subSlug" element={<CategoryPage />} />
        <Route
          path="/category/:slug/:subSlug/pdfs"
          element={<CategoryPdfsPage />}
        />
      </Routes>
    </>
  );
}
