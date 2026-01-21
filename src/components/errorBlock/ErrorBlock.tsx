import { Button } from "../button/Button";

export const ErrorBlock = ({ message }: { message?: string }) => {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center p-8 m-4 bg-color-bg-card border border-color-error rounded-radius-lg shadow-shadow-medium text-center">
        <div className="text-6xl mb-4 animate-bounce">🚨</div>
        <h2 className="text-h2 mb-2 text-color-error-text">
          Oops! Something went wrong.
        </h2>
        <p className="text-body mb-4 text-color-text-subtle">
          {message ||
            "We couldn't reach the server. Maybe it's hiding from us?"}
        </p>
        <Button text="Try again" onClick={() => window.location.reload()} />
      </div>
    </div>
  );
};
