// src/components/AuthScreen.jsx
import { useState, useEffect } from "react";
import { signInCloud, signUpCloud } from "../logic/supabase";

export default function AuthScreen({ setIsAuthenticated, setCurrentScreen }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Consent Checkboxes (Signup only)
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentBeta, setConsentBeta] = useState(false);
  const [consentSecurity, setConsentSecurity] = useState(false);

  // Auto-fill email from waitlist token step if available
  useEffect(() => {
    const savedEmail = localStorage.getItem('vektor_access_email');
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isLogin) {
      if (!consentTerms || !consentBeta || !consentSecurity) {
        setError("You must accept all terms and security warnings to join the beta.");
        setLoading(false);
        return;
      }
      if (!name) {
        setError("Operator Name is required.");
        setLoading(false);
        return;
      }
    }

    let res;
    if (isLogin) {
      res = await signInCloud(email, password);
    } else {
      res = await signUpCloud(email, password, name);
    }

    if (res.success) {
      setIsAuthenticated(true);
      // Let App.jsx handle the routing based on user profile state
    } else {
      setError(res.error || "Authentication failed. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title mb-6">▲ VEKTOR</h1>
        <p className="auth-tagline mb-8">
          {isLogin ? "Authenticate to Access Console" : "Register Operator Account"}
        </p>

        {error && <div className="error-message mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="stack">
          {!isLogin && (
            <div>
              <label className="form-label">Operator Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ghost..."
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@email.com"
              required
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength="6"
            />
          </div>

          {!isLogin && (
            <div className="private-beta-notice mt-4 mb-4 stack">
              <h4 className="private-beta-title">Required Security Clearances</h4>
              
              <label className="checkbox-row">
                <input type="checkbox" checked={consentTerms} onChange={(e) => setConsentTerms(e.target.checked)} />
                <span className="text-sm text-secondary">I accept the Terms of Service and Privacy Policy.</span>
              </label>

              <label className="checkbox-row">
                <input type="checkbox" checked={consentBeta} onChange={(e) => setConsentBeta(e.target.checked)} />
                <span className="text-sm text-secondary">I understand VEKTOR is an early beta. There are no guaranteed results, and this is not financial or legal advice.</span>
              </label>

              <label className="checkbox-row">
                <input type="checkbox" checked={consentSecurity} onChange={(e) => setConsentSecurity(e.target.checked)} />
                <span className="text-sm text-danger font-bold">I will NEVER enter seed phrases, private keys, wallet passwords, or API keys into VEKTOR.</span>
              </label>
            </div>
          )}

          <button type="submit" className="primary mt-4" disabled={loading}>
            {loading ? "Processing..." : (isLogin ? "ENTER CONSOLE" : "INITIALIZE ACCOUNT")}
          </button>
        </form>

        <hr />

        <div className="text-center mt-4">
          <button type="button" className="secondary" onClick={() => { setIsLogin(!isLogin); setError(""); }}>
            {isLogin ? "Need to register? Initialize Account." : "Already registered? Authenticate."}
          </button>
        </div>
      </div>
    </div>
  );
}