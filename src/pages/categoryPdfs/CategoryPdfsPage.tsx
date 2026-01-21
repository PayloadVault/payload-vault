import { useParams, useOutletContext } from "react-router-dom";
import { categories } from "../../data/Categories";
import { useLayoutEffect } from "react";

export function CategoryPdfsPage() {
  const { slug, subSlug } = useParams();
  const fullSlug = subSlug ? `${slug}/${subSlug}` : slug;

  const category = categories.find((c) => c.slug === fullSlug);
  if (!category) return <h1>Category not found: {fullSlug}</h1>;

  const { setTitle } = useOutletContext<{
    setTitle: (title: string) => void;
  }>();

  useLayoutEffect(() => {
    setTitle(`${category.title} — PDF`);
  }, [setTitle, category.title]);

  return (
    <div>
      <h1>{category.title} — PDFs</h1>
    </div>
  );
}
