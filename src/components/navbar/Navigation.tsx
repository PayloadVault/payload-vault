import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { categories } from "../../data/Categories";

export const Navigation = () => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <nav
      style={{
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
        padding: "1rem",
        borderBottom: "1px solid #333",
      }}
    >
      <Link to="/">Home</Link>
      <Link to="/all-pdfs">All PDFs</Link>

      {categories
        .filter((c) => !c.slug.includes("/"))
        .map((c) => (
          <Link key={c.slug} to={`/category/${c.slug}`}>
            {c.title}
          </Link>
        ))}

      <button
        onClick={() => signOut()}
        style={{
          marginLeft: "auto",
          cursor: "pointer",
          background: "none",
          color: "red",
          border: "none",
        }}
      >
        Sign Out
      </button>
    </nav>
  );
};
