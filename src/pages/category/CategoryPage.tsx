import { useParams } from "react-router-dom";
import { categories } from "../../data/Categories";
import { useOutletContext } from "react-router-dom";
import { useLayoutEffect } from "react";
import { AdcuriPage } from "./AdcuriPage";
import { OtherPages } from "./OtherPages";
import { OtherExpensesPages } from "./OtherExpensesPages";

export function CategoryPage() {
  const { slug, subSlug } = useParams();
  const fullSlug = subSlug ? `${slug}/${subSlug}` : slug;
  const category = categories.find((c) => c.slug === fullSlug);
  const isSales = window.location.pathname.includes("/einnahmen/");

  const { setTitle } = useOutletContext<{
    setTitle: (title: string) => void;
  }>();

  useLayoutEffect(() => {
    setTitle(category?.title || "Kategorie");
  }, [setTitle, category?.title]);

  if (!category) return <h1>Kategorie nicht gefunden: {fullSlug}</h1>;

  return (
    <div>
      {category.title === "Adcuri" ? (
        <AdcuriPage />
      ) : isSales ? (
        <OtherPages title={category.title} />
      ) : (
        <OtherExpensesPages title={category.title} />
      )}
    </div>
  );
}
