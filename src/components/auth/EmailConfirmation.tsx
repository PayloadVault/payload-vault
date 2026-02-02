import { Link } from "react-router-dom";

interface EmailConfirmationProps {
  email: string;
}

export const EmailConfirmation = ({ email }: EmailConfirmationProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="flex flex-col gap-6 w-full max-w-md bg-zinc-900 p-8 rounded-xl text-center">
        <h1 className="text-2xl font-bold text-white">E-Mail überprüfen</h1>
        <p className="text-zinc-400">
          Wir haben einen Bestätigungslink an{" "}
          <span className="text-white font-bold">{email}</span> gesendet. Bitte klicken Sie auf den Link, um Ihr Konto zu aktivieren.
        </p>
        {/* Use Link instead of a button with state */}
        <Link
          to="/login"
          className="text-sm text-zinc-500 underline hover:text-white transition-colors"
        >
          Zurück zur Anmeldung
        </Link>
      </div>
    </div>
  );
};
