import { Link } from "react-router-dom";

interface EmailConfirmationProps {
  email: string;
}

export const EmailConfirmation = ({ email }: EmailConfirmationProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="flex flex-col gap-6 w-full max-w-md bg-zinc-900 p-8 rounded-xl text-center">
        <h1 className="text-2xl font-bold text-white">Check your email</h1>
        <p className="text-zinc-400">
          We sent a confirmation link to{" "}
          <span className="text-white font-bold">{email}</span>. Please click
          the link to activate your account.
        </p>
        {/* Use Link instead of a button with state */}
        <Link
          to="/login"
          className="text-sm text-zinc-500 underline hover:text-white transition-colors"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
};
