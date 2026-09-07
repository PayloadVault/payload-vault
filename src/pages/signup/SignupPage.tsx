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
import { MiniFooter } from "../../components/footer/MiniFooter";

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
      // The database rejects addresses that are not on the server-side
      // allowlist; GoTrue surfaces that as a generic "Database error saving
      // new user". Keep the wording generic so the allowlist itself is not
      // probeable from the outside.
      const isRejectedByServer =
        signUpError.status === 500 ||
        signUpError.message.toLowerCase().includes("database error");

      setError(
        signUpError.message.includes("User already registered")
          ? "Ein Konto mit dieser E-Mail-Adresse existiert bereits."
          : isRejectedByServer
            ? "Registrierung mit dieser E-Mail-Adresse ist nicht möglich. Bitte wenden Sie sich an Ihren Administrator."
            : "Registrierung fehlgeschlagen. Bitte versuchen Sie es später erneut.",
      );
    } else if (
      data.user?.identities?.length === 0 ||
      (data.user &&
        data.session === null &&
        data.user.confirmed_at !== null &&
        data.user.confirmed_at !== undefined)
    ) {
      setError("Ein Konto mit dieser E-Mail-Adresse existiert bereits.");
    } else if (data.user && data.session === null) {
      setIsSent(true);
    }

    setLoading(false);
  };

  if (isSent) {
    return <EmailConfirmation email={email} />;
  }

  return (
    <div className="auth-bg flex flex-col min-h-screen">
      <div className="flex-1 flex justify-center items-center w-full p-4">
        <div className="flex flex-col gap-6 w-full max-w-md bg-color-bg-card border border-color-border-light p-8 rounded-xl shadow-shadow-strong animate-scale-in">
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
      <MiniFooter />
    </div>
  );
};
