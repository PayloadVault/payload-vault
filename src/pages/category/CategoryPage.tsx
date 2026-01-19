import { Link, useParams } from "react-router-dom";
import { categories } from "../../data/Categories";
import { useOutletContext } from "react-router-dom";
import { useLayoutEffect } from "react";
import { AdcuriPage } from "./AdcuriPage";

export function CategoryPage() {
  const { slug, subSlug } = useParams();
  const fullSlug = subSlug ? `${slug}/${subSlug}` : slug;
  const category = categories.find((c) => c.slug === fullSlug);
  if (!category) return <h1>Category not found: {fullSlug}</h1>;

  const directChildren = categories.filter((c) => {
    if (!fullSlug) return false;
    if (!c.slug.startsWith(fullSlug + "/")) return false;
    const rest = c.slug.slice((fullSlug + "/").length);
    return !rest.includes("/");
  });

  const hasChildren = directChildren.length > 0;

  const { setTitle, setSubtitle } = useOutletContext<{
    setTitle: (title: string) => void;
    setSubtitle: (subtitle: string) => void;
  }>();

  useLayoutEffect(() => {
    setTitle(category.title);
    setSubtitle("year");
  }, [setTitle, setSubtitle, category.title]);

  return <div>{category.title === "Adcuri" && <AdcuriPage />}</div>;
}
