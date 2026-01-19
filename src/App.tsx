import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/home/HomePage";
import { LoginPage } from "./pages/login/LoginPage";
import { AllPdfsPage } from "./pages/allPdfs/AllPdfsPage";
import { CategoryPage } from "./pages/category/CategoryPage";
import { CategoryPdfsPage } from "./pages/categoryPdfs/CategoryPdfsPage";
import { useEffect } from "react";
import { Layout } from "./pages/layout";
import { ModalProvider } from "./context/modal/ModalProvider";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./context/ProtectedRoutes";
import { SignUpPage } from "./pages/signup/SignupPage";

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
    <AuthProvider>
      <ModalProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route element={<Layout />}>
            <Route
              path="/all-pdfs"
              element={
                <ProtectedRoute>
                  <AllPdfsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/category/:slug"
              element={
                <ProtectedRoute>
                  <CategoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/category/:slug/pdfs"
              element={
                <ProtectedRoute>
                  <CategoryPdfsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/category/:slug/:subSlug"
              element={
                <ProtectedRoute>
                  <CategoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/category/:slug/:subSlug/pdfs"
              element={
                <ProtectedRoute>
                  <CategoryPdfsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ModalProvider>
    </AuthProvider>
  );
}
