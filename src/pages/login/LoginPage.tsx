import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { InputField } from "../../components/inputField/InputField";
import { PasswordInput } from "../../components/passwordInput/PasswordInput";
import { useAuth } from "../../context/AuthContext";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const origin = location.state?.from?.pathname || "/";
      navigate(origin, { replace: true });
    }
  }, [user, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-6 w-full max-w-md bg-zinc-900 p-8 rounded-xl"
      >
        <h1 className="text-2xl font-bold text-white">Login</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <InputField
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChange={(val) => setEmail(val)}
          isRequired
        />

        <PasswordInput
          label="Password"
          value={password}
          onChange={(val) => setPassword(val)}
          isRequired
        />

        <div className="flex flex-col gap-3 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>

        <p className="text-zinc-400 text-center text-sm mt-2">
          Still don't have an account?{" "}
          <Link to="/signup" className="text-white underline font-medium">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};
