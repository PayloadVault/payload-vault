import { Link, useParams } from "react-router-dom";
import { categories } from "../../data/Categories";
import { useOutletContext } from "react-router-dom";

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

  setTitle(category.title);
  setSubtitle("year");

  return (
    <div>
      <h1>{category.title}</h1>

      {hasChildren ? (
        <ul>
          {directChildren.map((child) => (
            <li key={child.slug}>
              <Link to={`/category/${child.slug}`}>{child.title}</Link>
              {" — "}
              <Link to={`/category/${child.slug}/pdfs`}>PDFs</Link>
            </li>
          ))}
        </ul>
      ) : (
        <Link to="pdfs">View PDFs</Link>
      )}
    </div>
  );
}
