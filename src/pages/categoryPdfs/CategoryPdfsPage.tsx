import { useParams } from "react-router-dom";
import { categories } from "../../data/Categories";
import { useOutletContext } from "react-router-dom";

export function CategoryPdfsPage() {
  const { slug, subSlug } = useParams();
  const fullSlug = subSlug ? `${slug}/${subSlug}` : slug;

  const category = categories.find((c) => c.slug === fullSlug);
  if (!category) return <h1>Category not found: {fullSlug}</h1>;

  const { setTitle, setSubtitle } = useOutletContext<{
    setTitle: (title: string) => void;
    setSubtitle: (subtitle: string) => void;
  }>();

  setTitle(category.title + " — PDF");
  setSubtitle("year");

  return (
    <div>
      <h1>{category.title} — PDFs</h1>
    </div>
  );
}
