import { useParams } from "react-router-dom";
import { categories } from "../../data/Categories";

export function CategoryPdfsPage() {
  const { slug, subSlug } = useParams();
  const fullSlug = subSlug ? `${slug}/${subSlug}` : slug;

  const category = categories.find((c) => c.slug === fullSlug);
  if (!category) return <h1>Category not found: {fullSlug}</h1>;

  return (
    <div>
      <h1>{category.title} — PDFs</h1>
    </div>
  );
}
