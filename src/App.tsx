import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import { HomePage } from "./pages/home/HomePage";
import { LoginPage } from "./pages/login/LoginPage";
import { AllPdfsPage } from "./pages/allPdfs/AllPdfsPage";
import { CategoryPage } from "./pages/category/CategoryPage";
import { CategoryPdfsPage } from "./pages/categoryPdfs/CategoryPdfsPage";
import { categories } from "./data/Categories";

export default function App() {
  return (
    <>
      <nav style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/all-pdfs">All PDFs</Link>

        {categories
          .filter((c) => !c.slug.includes("/"))
          .map((c) => (
            <Link key={c.slug} to={`/category/${c.slug}`}>
              {c.title}
            </Link>
          ))}
      </nav>

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
