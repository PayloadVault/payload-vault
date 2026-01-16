import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { categories } from "../../data/Categories";
import { useState } from "react";
import { UserIcon } from "../icons";
import { ProfileDropdown } from "../profile/ProfileDropdown";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!user) return null;

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

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

      <div style={{ marginLeft: "auto" }} className="relative">
        <button
          onClick={toggleDropdown}
          className={`flex items-center justify-center p-2 rounded-full transition-all ${
            isDropdownOpen ? "bg-zinc-800" : "hover:bg-zinc-900"
          }`}
        >
          <UserIcon className="h-6 w-6 text-white cursor-pointer" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-12 z-50">
            <ProfileDropdown
              userEmail={user.email}
              onSignOut={signOut}
              onClose={() => setIsDropdownOpen(false)}
            />
          </div>
        )}
      </div>
    </nav>
  );
};
