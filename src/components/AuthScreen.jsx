// src/components/AuthScreen.jsx
import { useState, useEffect } from "react";
import { signInCloud, signUpCloud, burnAccessToken } from "../logic/supabase";

export default function AuthScreen({ setIsAuthenticated, setCurrentScreen }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: '', password: '', confirm: '', name: '' });
  const [consent, setConsent] = useState({ terms: false, beta: false, security: false });

  useEffect(() => {
    const savedEmail = localStorage.getItem('vektor_access_email');
    if (savedEmail) setForm(f => ({ ...f, email: savedEmail }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isLogin) {
      if (form.password !== form.confirm) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (!Object.values(consent).every(Boolean)) {
        setError("All confirmations are required to continue.");
        setLoading(false);
        return;
      }
    }

    const res = isLogin
      ? await signInCloud(form.email, form.password)
      : await signUpCloud(form.email, form.password, form.name);

    if (res.success) {
      // 🔒 FIX: Burn token on first login OR signup — covers both paths
      const token = localStorage.getItem('vektor_access_token');
      if (token && token !== 'GHOST-ADMIN') {
        await burnAccessToken(token);
        localStorage.removeItem('vektor_access_token');
      }
      setIsAuthenticated(true);
    } else {
      setError(res.error || "Authentication failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <style>{`
        .auth-card {
          width: 100%;
          max-width: 400px;
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 1.5rem;
          font-family: 'SF Mono', 'Courier New', monospace;
          color: #ffffff;
        }
        .auth-input {
          width: 100%;
          padding: 0.7rem;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.08);
          color: #ffffff;
          box-sizing: border-box;
          margin-bottom: 0.75rem;
          font-family: inherit;
          font-size: 0.85rem;
          transition: 0.2s;
        }
        .auth-input:focus {
          outline: none;
          border-color: #00ff88;
          box-shadow: 0 0 0 1px rgba(0,255,136,0.15);
        }
        .auth-input::placeholder {
          color: rgba(255,255,255,0.28);
        }
        .auth-label {
          display: block;
          margin-bottom: 0.35rem;
          color: #00ff88;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .auth-btn {
          width: 100%;
          padding: 0.85rem;
          border: none;
          cursor: pointer;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 0.8rem;
          letter-spacing: 1px;
          background: #00ff88;
          color: #050505;
          font-family: inherit;
          transition: 0.2s;
        }
        .auth-btn:hover:not(:disabled) {
          background: #3DDC97;
        }
        .auth-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .auth-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .auth-toggle {
          background: none;
          border: none;
          color: rgba(255,255,255,0.38);
          font-size: 0.65rem;
          margin-top: 1.25rem;
          width: 100%;
          cursor: pointer;
          font-family: inherit;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: 0.2s;
        }
        .auth-toggle:hover {
          color: #00ff88;
        }
        .auth-error {
          color: rgba(255,68,68,0.8);
          font-size: 0.7rem;
          padding: 0.6rem;
          border: 1px solid rgba(255,68,68,0.3);
          margin-bottom: 1rem;
          background: rgba(255,68,68,0.03);
        }
        .auth-consent-box {
          background: #1a1a1a;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid rgba(255,255,255,0.06);
          font-size: 0.65rem;
          color: rgba(255,255,255,0.6);
        }
        .auth-consent-box label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          cursor: pointer;
        }
        .auth-consent-box label:last-child {
          margin-bottom: 0;
        }
        .auth-consent-box input[type="checkbox"] {
          accent-color: #00ff88;
        }
        .auth-consent-warning {
          color: rgba(255,68,68,0.7);
        }
      `}</style>

      <div className="auth-card">
        <h1 style={{
          color: '#ffffff',
          fontSize: '1rem',
          marginBottom: '1.5rem',
          fontWeight: 'bold',
          letterSpacing: '2px',
          textAlign: 'center'
        }}>
          VEKTÖR █
        </h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="auth-label">Username</label>
              <input
                className="auth-input"
                value={form.name}
                placeholder="e.g. ghost_operator"
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}

          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            value={form.email}
            placeholder="you@email.com"
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            value={form.password}
            placeholder="••••••••"
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />

          {!isLogin && (
            <>
              <label className="auth-label">Confirm Password</label>
              <input
                className="auth-input"
                type="password"
                value={form.confirm}
                placeholder="••••••••"
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                required
              />

              <div className="auth-consent-box">
                <label>
                  <input
                    type="checkbox"
                    checked={consent.terms}
                    onChange={e => setConsent({ ...consent, terms: e.target.checked })}
                  />
                  I accept the Terms of Service
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={consent.beta}
                    onChange={e => setConsent({ ...consent, beta: e.target.checked })}
                  />
                  I understand this is beta software
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={consent.security}
                    onChange={e => setConsent({ ...consent, security: e.target.checked })}
                  />
                  <span className="auth-consent-warning">I will never enter private keys or seed phrases</span>
                </label>
              </div>
            </>
          )}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? '[ Processing... ]' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <button className="auth-toggle" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
          {isLogin ? 'New operator? Create account' : 'Already registered? Sign in'}
        </button>
      </div>
    </div>
  );
}