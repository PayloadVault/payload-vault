import { useParams } from "react-router-dom";
import { categories } from "../../data/Categories";
import { useOutletContext } from "react-router-dom";
import { useLayoutEffect } from "react";
import { AdcuriPage } from "./AdcuriPage";
import { OtherPages } from "./OtherPages";

export function CategoryPage() {
  const { slug, subSlug } = useParams();
  const fullSlug = subSlug ? `${slug}/${subSlug}` : slug;
  const category = categories.find((c) => c.slug === fullSlug);
  if (!category) return <h1>Category not found: {fullSlug}</h1>;

  const { setTitle } = useOutletContext<{
    setTitle: (title: string) => void;
  }>();

  useLayoutEffect(() => {
    setTitle(category.title);
  }, [setTitle, category.title]);

  return (
    <div>
      {category.title === "Adcuri" ? (
        <AdcuriPage />
      ) : (
        <OtherPages title={category.title} />
      )}
    </div>
  );
}
