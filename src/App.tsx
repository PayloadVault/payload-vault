import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/home/HomePage";
import { LoginPage } from "./pages/login/LoginPage";
import { AllPdfsPage } from "./pages/allPdfs/AllPdfsPage";
import { CategoryPage } from "./pages/category/CategoryPage";
import { CategoryPdfsPage } from "./pages/categoryPdfs/CategoryPdfsPage";
import { SalesPage } from "./pages/sales/SalesPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";
import { useEffect } from "react";
import { Layout } from "./pages/layout";
import { ModalProvider } from "./context/modal/ModalProvider";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./context/ProtectedRoutes";
import { SignUpPage } from "./pages/signup/SignupPage";
import { ResetPasswordPage } from "./pages/reset-password/ResetPasswordPage";
import { UpdatePasswordPage } from "./pages/update-password/UpdatePasswordPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { YearProvider } from "./context/YearContext";
import { BannerProvider } from "./context/banner/BannerProvider";
import { AllExpensesPdfsPage } from "./pages/allPdfs/AllExpensesPdfPage";

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const theme = saved ?? (prefersDark ? "dark" : "light");

    document.documentElement.dataset.theme = theme;
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <YearProvider>
          <BannerProvider>
            <ModalProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route
                  path="/passwort-zurucksetzen"
                  element={<ResetPasswordPage />}
                />
                <Route
                  path="/update-passwort"
                  element={<UpdatePasswordPage />}
                />

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
                    path="/einnahmen"
                    element={
                      <ProtectedRoute>
                        <SalesPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/steuerrelevante-ausgaben"
                    element={
                      <ProtectedRoute>
                        <ExpensesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/einnahmen/alle-dokumente"
                    element={
                      <ProtectedRoute>
                        <AllPdfsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/steuerrelevante-ausgaben/alle-dokumente"
                    element={
                      <ProtectedRoute>
                        <AllExpensesPdfsPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/einnahmen/kategorie/:slug"
                    element={
                      <ProtectedRoute>
                        <CategoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/steuerrelevante-ausgaben/kategorie/:slug"
                    element={
                      <ProtectedRoute>
                        <CategoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/einnahmen/kategorie/:slug/pdfs"
                    element={
                      <ProtectedRoute>
                        <CategoryPdfsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/steuerrelevante-ausgaben/kategorie/:slug/pdfs"
                    element={
                      <ProtectedRoute>
                        <CategoryPdfsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/einnahmen/kategorie/:slug/:subSlug"
                    element={
                      <ProtectedRoute>
                        <CategoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/einnahmen/kategorie/:slug/:subSlug/pdfs"
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
          </BannerProvider>
        </YearProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
