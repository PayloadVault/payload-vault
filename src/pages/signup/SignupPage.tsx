import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { InputField } from "../../components/inputField/InputField";
import { PasswordInput } from "../../components/passwordInput/PasswordInput";
import { useAuth } from "../../context/AuthContext";
import { EmailConfirmation } from "../../components/auth/EmailConfirmation";
import { Banner } from "../../components/banner/Banner";
import { Button } from "../../components/button/Button";
import { VaultIcon } from "../../components/icons";

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

  const handleSignUp = async () => {
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
    <div className="flex justify-center items-center w-screen h-screen p-4">
      <form className="flex flex-col gap-6 w-full max-w-md bg-color-bg-card border border-color-border-light p-8 rounded-xl">
        <div className="bg-color-primary/15 p-2 rounded-full mx-auto">
          <VaultIcon className="w-12 h-12 mx-auto text-color-primary" />
        </div>
        <h3 className="font-bold text-color-text-main">Create Account</h3>

        {error && <Banner bannerType="error" title={error} description="" />}

        <InputField
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChange={(val) => setEmail(val)}
        />

        <PasswordInput
          label="Password"
          value={password}
          onChange={(val) => setPassword(val)}
        />

        <PasswordInput
          label="Repeat password"
          value={repeatedPassword}
          onChange={(val) => setRepeatedPassword(val)}
        />

        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleSignUp} text="Sign Up" isLoading={loading} />

          <p className="text-color-text-subtle text-center text-sm mt-2">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </form>
    </div>
  );
};
