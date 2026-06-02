// src/components/Waitlist.jsx
import { useState } from 'react';
import { joinWaitlistCloud } from '../logic/supabase';

export default function Waitlist({ onComplete }) {
  const [form, setForm] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await joinWaitlistCloud(
      form.name.trim(),
      form.email.trim(),
      '',
      ''
    );

    if (result.success) {
      setToken(result.token);
      localStorage.setItem('vektor_access_token', result.token);
      localStorage.setItem('vektor_access_email', form.email.trim());
    } else {
      setError(result.error || 'Waitlist submission failed. Please try again.');
    }

    setLoading(false);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    onComplete(token, form.email);
  };

  // ─── TOKEN RECEIVED VIEW ──────────────────────────
  if (token) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: "'SF Mono', 'Courier New', monospace"
      }}>
        <style>{`
          .wl-success-card {
            width: 100%;
            max-width: 460px;
            background: #0a0a0a;
            border: 1px solid rgba(0,255,136,0.2);
            padding: 2rem 1.5rem;
            color: #ffffff;
            text-align: center;
          }
          .wl-token-box {
            background: #050505;
            border: 1px solid rgba(0,255,136,0.3);
            padding: 1rem;
            margin: 1.25rem 0;
            font-size: 1rem;
            letter-spacing: 2px;
            color: #00ff88;
            word-break: break-all;
            font-weight: bold;
          }
          .wl-btn {
            width: 100%;
            padding: 0.85rem;
            border: none;
            cursor: pointer;
            text-transform: uppercase;
            font-weight: bold;
            font-size: 0.8rem;
            letter-spacing: 1px;
            font-family: inherit;
            transition: 0.2s;
            margin-top: 0.75rem;
          }
          .wl-btn-primary {
            background: #00ff88;
            color: #050505;
          }
          .wl-btn-primary:hover { background: #3DDC97; }
          .wl-btn-secondary {
            background: transparent;
            color: rgba(255,255,255,0.6);
            border: 1px solid rgba(255,255,255,0.15);
          }
          .wl-btn-secondary:hover {
            color: #00ff88;
            border-color: #00ff88;
          }
          .wl-warning {
            color: rgba(255,68,68,0.7);
            font-size: 0.65rem;
            margin-top: 1.25rem;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
        `}</style>

        <div className="wl-success-card">
          <div style={{ fontSize: '0.65rem', color: '#00ff88', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>
            █ Waitlist Confirmed
          </div>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>Your Access Code</h2>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.5rem 0' }}>
            This code is single-use and expires in 7 days.
          </p>

          <div className="wl-token-box">{token}</div>

          <button className="wl-btn wl-btn-secondary" onClick={handleCopyToken}>
            {copied ? '[ Copied ]' : '[ Copy Code ]'}
          </button>

          <button className="wl-btn wl-btn-primary" onClick={handleContinue}>
            Continue to Account Setup
          </button>

          <div className="wl-warning">
            Store this code safely. It cannot be recovered.
          </div>
        </div>
      </div>
    );
  }

  // ─── SIGNUP FORM VIEW ─────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: "'SF Mono', 'Courier New', monospace"
    }}>
      <style>{`
        .wl-card {
          width: 100%;
          max-width: 420px;
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 1.5rem;
          color: #ffffff;
        }
        .wl-label {
          display: block;
          margin-bottom: 0.35rem;
          color: #00ff88;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .wl-input {
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
        .wl-input:focus {
          outline: none;
          border-color: #00ff88;
          box-shadow: 0 0 0 1px rgba(0,255,136,0.15);
        }
        .wl-input::placeholder { color: rgba(255,255,255,0.28); }
        .wl-btn {
          width: 100%;
          padding: 0.85rem;
          border: none;
          cursor: pointer;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 0.8rem;
          letter-spacing: 1px;
          font-family: inherit;
          background: #00ff88;
          color: #050505;
          transition: 0.2s;
          margin-top: 0.5rem;
        }
        .wl-btn:hover:not(:disabled) { background: #3DDC97; }
        .wl-btn:active:not(:disabled) { transform: translateY(1px); }
        .wl-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .wl-error {
          color: rgba(255,68,68,0.8);
          font-size: 0.7rem;
          padding: 0.6rem;
          border: 1px solid rgba(255,68,68,0.3);
          margin-bottom: 1rem;
          background: rgba(255,68,68,0.03);
        }
        .wl-footer {
          text-align: center;
          margin-top: 1rem;
          font-size: 0.6rem;
          color: rgba(255,255,255,0.28);
        }
      `}</style>

      <div className="wl-card">
        <div style={{
          fontSize: '0.65rem',
          color: '#00ff88',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '0.25rem',
          textAlign: 'center'
        }}>
          █ Alpha Access
        </div>
        <h2 style={{
          fontSize: '1rem',
          margin: '0 0 0.25rem 0',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          Join the Waitlist
        </h2>
        <p style={{
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          margin: '0 0 1.25rem 0'
        }}>
          Limited to 100 early operators.
        </p>

        {error && <div className="wl-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="wl-label">Name</label>
          <input
            className="wl-input"
            type="text"
            placeholder="How should we call you?"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />

          <label className="wl-label">Email</label>
          <input
            className="wl-input"
            type="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />

          <button className="wl-btn" type="submit" disabled={loading}>
            {loading ? '[ Processing... ]' : 'Request Access Code'}
          </button>
        </form>

        <div className="wl-footer">
          Already have a code?{' '}
          <span
            style={{ color: '#00ff88', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => onComplete(null, null)}
          >
            Enter it here
          </span>
        </div>
      </div>
    </div>
  );
}