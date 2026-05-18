// src/components/PasswordGate.jsx
import { useMemo, useState } from "react";

const PASSWORD_ENV_KEYS = [
  "VITE_VEKTOR_PASSWORD",
  "VITE_ACCESS_PASSWORD",
  "VITE_APP_PASSWORD",
  "VITE_PRIVATE_BETA_PASSWORD",
];

function getConfiguredPassword() {
  for (const key of PASSWORD_ENV_KEYS) {
    const value = import.meta.env[key];

    if (value) return String(value);
  }

  return "";
}

export default function PasswordGate({ setIsAuthenticated, setCurrentScreen }) {
  const configuredPassword = useMemo(() => getConfiguredPassword(), []);

  const [password, setPassword] = useState("");
  const [acceptedNotice, setAcceptedNotice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({
    type: "idle",
    message: "",
  });
  const [isVerifying, setIsVerifying] = useState(false);

  const canSubmit = acceptedNotice && password.trim().length > 0 && !isVerifying;

  function clearErrorOnInput(nextValue) {
    setPassword(nextValue);

    if (status.type === "error" || status.type === "denied") {
      setStatus({
        type: "idle",
        message: "",
      });
    }
  }

  function verifyPassword(event) {
    event.preventDefault();

    if (!acceptedNotice) {
      setStatus({
        type: "error",
        message: "Accept the private beta notice before entering.",
      });
      return;
    }

    if (!password.trim()) {
      setStatus({
        type: "error",
        message: "Enter the private beta password.",
      });
      return;
    }

    if (!configuredPassword) {
      setStatus({
        type: "error",
        message: "Private beta password is not configured in the environment.",
      });
      return;
    }

    setIsVerifying(true);
    setStatus({
      type: "info",
      message: "Verifying access...",
    });

    window.setTimeout(() => {
      if (password === configuredPassword) {
        setStatus({
          type: "success",
          message: "Access granted.",
        });

        setIsAuthenticated(true);

        if (typeof setCurrentScreen === "function") {
          setCurrentScreen("introPrompt");
        }

        return;
      }

      setIsVerifying(false);
      setPassword("");
      setStatus({
        type: "denied",
        message: "Incorrect password. Try again.",
      });
    }, 220);
  }

  return (
    <section className="password-page" aria-label="VEKTÖR private beta access">
      <form className="password-card" onSubmit={verifyPassword}>
        <header>
          <h1 className="password-title">VEKTÖR</h1>
          <p className="password-tagline">Find Your AI/Web3 Path. Execute It.</p>
        </header>

        <hr />

        <section className="private-beta-notice" aria-label="Private beta notice">
          <h2 className="private-beta-title">Private Beta</h2>
          <ul>
            <li>Currently in private beta. Actively being improved.</li>
            <li>Do not enter seed phrases, private keys, or passwords.</li>
            <li>Your data is stored on this device only.</li>
          </ul>
        </section>

        <label className="checkbox-row" htmlFor="betaNoticeAccepted">
          <input
            id="betaNoticeAccepted"
            type="checkbox"
            checked={acceptedNotice}
            onChange={(event) => setAcceptedNotice(event.target.checked)}
          />
          <span>
            I understand this is a private local prototype and I will not enter
            sensitive credentials.
          </span>
        </label>

        <div>
          <label htmlFor="vektorPassword">Access Password</label>
          <div className="password-input-wrap">
            <input
              id="vektorPassword"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => clearErrorOnInput(event.target.value)}
              placeholder="Enter private beta password"
              autoComplete="current-password"
              aria-invalid={status.type === "error" || status.type === "denied"}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {(status.type === "error" || status.type === "denied") && (
          <div className="status-message error" role="alert">
            {status.type === "denied" ? "Access Denied. " : ""}
            {status.message}
          </div>
        )}

        {status.type === "info" && (
          <div className="status-message info" role="status">
            {status.message}
          </div>
        )}

        {status.type === "success" && (
          <div className="status-message success" role="status">
            {status.message}
          </div>
        )}

        <button
          type="submit"
          className="primary"
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
        >
          {isVerifying ? "Verifying..." : "Enter VEKTÖR →"}
        </button>
      </form>
    </section>
  );
}