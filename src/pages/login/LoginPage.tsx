import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { InputField } from "../../components/inputField/InputField";
import { PasswordInput } from "../../components/passwordInput/PasswordInput";
import { useAuth } from "../../context/AuthContext";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

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
      setLoading(false);
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user && data.session === null) {
      setIsSent(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
        <div className="flex flex-col gap-6 w-full max-w-md bg-zinc-900 p-8 rounded-xl text-center">
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="text-zinc-400">
            We sent a confirmation link to{" "}
            <span className="text-white font-bold">{email}</span>. Please click
            the link to activate your account.
          </p>
          <button
            onClick={() => setIsSent(false)}
            className="text-sm text-zinc-500 underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-6 w-full max-w-md bg-zinc-900 p-8 rounded-xl"
      >
        <h1 className="text-2xl font-bold text-white">Login or Sign Up</h1>

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
            {loading ? "Processing..." : "Log In"}
          </button>

          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="text-white border border-zinc-700 py-3 rounded-lg hover:bg-zinc-800"
          >
            Create New Account
          </button>
        </div>
      </form>
    </div>
  );
};
