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
import { signUpSchema } from "../../validation/SignUpValidation";

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

    const result = signUpSchema.safeParse({
      email,
      password,
      repeatedPassword,
    });

    if (!result.success) {
      const message = result.error.issues[0].message;

      setError(message);
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (signUpError) {
      const errorMessage = signUpError.message.includes("User already registered")
        ? "Benutzer ist bereits registriert"
        : signUpError.message;
      setError(errorMessage);
    } else if (data.user && data.session === null) {
      setIsSent(true);
    }

    setLoading(false);
  };

  if (isSent) {
    return <EmailConfirmation email={email} />;
  }

  return (
    <div className="flex justify-center items-center w-screen h-screen p-4">
      <div className="flex flex-col gap-6 w-full max-w-md bg-color-bg-card border border-color-border-light p-8 rounded-xl">
        <div className="bg-color-primary/15 p-2 rounded-full mx-auto">
          <VaultIcon className="w-12 h-12 mx-auto text-color-primary" />
        </div>
        <h3 className="font-bold text-color-text-main">Konto erstellen</h3>

        {error && <Banner bannerType="error" title={error} description="" />}

        <InputField
          label="Email"
          placeholder="nachname@pro-fina.de"
          value={email}
          onChange={(val) => setEmail(val)}
        />

        <PasswordInput
          label="Passwort"
          value={password}
          onChange={(val) => setPassword(val)}
        />

        <PasswordInput
          label="Passwort wiederholen"
          value={repeatedPassword}
          onChange={(val) => setRepeatedPassword(val)}
          isRepeated
        />

        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={handleSignUp}
            text="Registrieren"
            isLoading={loading}
          />

          <p className="text-color-text-subtle text-center text-sm mt-2">
            Schon ein Konto? <Link to="/login">Anmelden</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
