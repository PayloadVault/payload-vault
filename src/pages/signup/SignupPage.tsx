import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { InputField } from "../../components/inputField/InputField";
import { PasswordInput } from "../../components/passwordInput/PasswordInput";
import { useAuth } from "../../context/AuthContext";
import { EmailConfirmation } from "../../components/auth/EmailConfirmation";

export const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== repeatedPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else if (data.user && data.session === null) {
      setIsSent(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  if (isSent) {
    return <EmailConfirmation email={email} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <form
        onSubmit={handleSignUp}
        className="flex flex-col gap-6 w-full max-w-md bg-zinc-900 p-8 rounded-xl"
      >
        <h1 className="text-2xl font-bold text-white">Create Account</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg">
            <p className="text-red-500 text-sm text-center">{error}</p>
          </div>
        )}

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

        <PasswordInput
          label="Repeat password"
          value={repeatedPassword}
          onChange={(val) => setRepeatedPassword(val)}
          isRequired
        />

        <div className="flex flex-col gap-3 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <p className="text-zinc-400 text-center text-sm mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-white underline font-medium">
              Log In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};
