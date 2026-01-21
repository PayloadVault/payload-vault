import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { InputField } from "../../components/inputField/InputField";
import { PasswordInput } from "../../components/passwordInput/PasswordInput";
import { useAuth } from "../../context/AuthContext";
import { Banner } from "../../components/banner/Banner";
import { Button } from "../../components/button/Button";
import { VaultIcon } from "../../components/icons";
import { loginSchema } from "../../validation/LoginValidation";

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

  const handleLogin = async () => {
    setError(null);

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const message = result.error.issues[0].message;

      setError(message);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen p-4">
      <div className="flex flex-col gap-6 w-full max-w-md bg-color-bg-card p-8 rounded-xl border border-color-border-light">
        <div className="bg-color-primary/15 p-2 rounded-full mx-auto">
          <VaultIcon className="w-12 h-12 mx-auto text-color-primary" />
        </div>
        <h3 className="font-bold text-color-text-main">Login</h3>

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

        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleLogin} text="Log In" isLoading={loading} />
        </div>

        <p className="text-color-text-subtle text-center text-sm mt-2">
          Still don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};
