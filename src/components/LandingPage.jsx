// src/components/LandingPage.jsx
import { useState } from 'react';
import { supabase } from '../logic/supabase';
import Waitlist from './Waitlist';

// ⚡ TOGGLE: Set to true when waitlist is over to enable direct registration
const SHOW_REGISTER_TAB = false;

export default function LandingPage({ onStartAccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'waitlist' | 'forgot'
  
  // Core Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // V3 Identity State (register mode)
  const [username, setUsername] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [githubHandle, setGithubHandle] = useState('');
  const [discordHandle, setDiscordHandle] = useState('');
  const [evmWallet, setEvmWallet] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const cleanHandle = (input) => {
    if (!input) return '';
    let cleaned = input.trim();
    cleaned = cleaned.replace(/^@/, '');
    cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?(x\.com|twitter\.com|github\.com)\//, '');
    return cleaned;
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authMode === 'register') {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password 
        });
        
        if (signUpError) throw signUpError;

        if (authData?.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: authData.user.id,
            username: username.trim(),
            x_handle: cleanHandle(xHandle),
            github_handle: cleanHandle(githubHandle),
            discord_handle: discordHandle.trim(),
            evm_wallet: evmWallet.trim()
          }, { onConflict: 'id' });

          if (profileError) console.error("[ SYS ] Ledger sync warning:", profileError);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        if (signInError) throw signInError;
      }

      onStartAccess('EXISTING_USER', email);

    } catch (err) {
      setError(`[ ERR: ${err.message.toUpperCase()} ]`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + '/?reset=true',
      });

      if (resetError) throw resetError;
      setForgotSent(true);
    } catch (err) {
      setError(`[ ERR: ${err.message.toUpperCase()} ]`);
    } finally {
      setLoading(false);
    }
  };

  const handleWaitlistComplete = (token, waitlistEmail) => {
    if (token) {
      localStorage.setItem('vektor_access_token', token);
      localStorage.setItem('vektor_access_email', waitlistEmail);
    }
    onStartAccess('WAITLIST_USER', waitlistEmail || email);
  };

  // ─── WAITLIST VIEW ────────────────────────────────
  if (authMode === 'waitlist') {
    return (
      <Waitlist onComplete={handleWaitlistComplete} />
    );
  }

  // ─── FORGOT PASSWORD SUCCESS VIEW ─────────────────
  if (forgotSent) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: "'SF Mono', 'Courier New', monospace"
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: '#0a0a0a',
          border: '1px solid rgba(0,255,136,0.15)',
          padding: '2rem 1.5rem',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📩</div>
          <div style={{
            fontSize: '0.65rem',
            color: '#00ff88',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '1rem'
          }}>
            █ Reset Sent
          </div>
          <h2 style={{ fontSize: '1rem', margin: '0 0 0.75rem 0' }}>
            Check Your Email
          </h2>
          <p style={{
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: '1.6',
            margin: '0 0 1.5rem 0'
          }}>
            If an account exists for <strong style={{ color: '#00ff88' }}>{email}</strong>,
            we sent a password reset link. Click it to set a new password.
          </p>
          <button
            onClick={() => { setForgotSent(false); setAuthMode('login'); }}
            style={{
              width: '100%',
              padding: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              letterSpacing: '1px',
              fontFamily: "'SF Mono', 'Courier New', monospace",
              background: '#00ff88',
              color: '#050505'
            }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // ─── AUTH VIEW ────────────────────────────────────
  return (
    <>
      <style>{`
        body, html, #root { margin: 0; padding: 0; width: 100%; background-color: #050505; }
        .v2-landing { min-height: 100vh; width: 100%; background-color: #050505; color: #ffffff; font-family: 'SF Mono', 'Courier New', monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; box-sizing: border-box; }
        
        .v2-auth-container { background: #0a0a0a; border: 1px solid rgba(255,255,255,0.08); width: 100%; max-width: 420px; }
        
        .v2-auth-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .v2-tab { flex: 1; background: transparent; border: none; padding: 0.9rem 0.5rem; color: rgba(255,255,255,0.38); cursor: pointer; font-family: inherit; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1.5px; transition: 0.2s; }
        .v2-tab.active { color: #00ff88; border-bottom: 2px solid #00ff88; font-weight: bold; background: rgba(0,255,136,0.03); }
        .v2-tab:hover:not(.active) { color: rgba(255,255,255,0.87); }
        
        .v2-auth-body { padding: 1.5rem; }
        
        .v2-form-group { margin-bottom: 1rem; text-align: left; }
        .v2-label { display: block; font-size: 0.65rem; color: #00ff88; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 1px; }
        .v2-input { width: 100%; padding: 0.7rem; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08); color: #ffffff; box-sizing: border-box; font-family: inherit; font-size: 0.85rem; transition: 0.2s; }
        .v2-input:focus { outline: none; border-color: #00ff88; box-shadow: 0 0 0 1px rgba(0,255,136,0.15); }
        .v2-input::placeholder { color: rgba(255,255,255,0.28); }
        
        .v2-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem; }
        @media (max-width: 480px) { .v2-grid-2 { grid-template-columns: 1fr; gap: 0; } .v2-grid-2 > div { margin-bottom: 1rem; } }
        
        .v2-btn-primary { width: 100%; background: #00ff88; color: #050505; border: none; padding: 0.85rem; font-weight: bold; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; font-size: 0.8rem; margin-top: 0.5rem; transition: 0.2s; font-family: inherit; }
        .v2-btn-primary:hover:not(:disabled) { background: #3DDC97; }
        .v2-btn-primary:active:not(:disabled) { transform: translateY(1px); }
        .v2-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .v2-error { border: 1px solid rgba(255,68,68,0.4); color: rgba(255,68,68,0.8); padding: 0.7rem; font-size: 0.7rem; margin-bottom: 1rem; text-align: center; background: rgba(255,68,68,0.03); }
        
        .v2-footer-link { text-align: center; margin-top: 1rem; font-size: 0.65rem; color: rgba(255,255,255,0.28); }
        .v2-footer-link span { color: #00ff88; text-decoration: none; cursor: pointer; }
        .v2-footer-link span:hover { text-decoration: underline; }
        
        .v2-forgot-link { text-align: right; margin-top: -0.5rem; margin-bottom: 0.5rem; }
        .v2-forgot-link span { font-size: 0.6rem; color: rgba(255,255,255,0.3); cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; }
        .v2-forgot-link span:hover { color: #00ff88; }
      `}</style>

      <div className="v2-landing">
        <div className="v2-auth-container">
          <div className="v2-auth-tabs">
            <button className={`v2-tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => { setAuthMode('login'); setError(''); setForgotSent(false); }}>
              Sign In
            </button>
            {SHOW_REGISTER_TAB && (
              <button className={`v2-tab ${authMode === 'register' ? 'active' : ''}`} onClick={() => { setAuthMode('register'); setError(''); }}>
                New Operator
              </button>
            )}
          </div>

          <div className="v2-auth-body">
            {authMode === 'forgot' ? (
              // ─── FORGOT PASSWORD FORM ──────────────
              <form onSubmit={handleForgotPassword}>
                <div style={{
                  fontSize: '0.65rem',
                  color: '#00ff88',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  █ Reset Passkey
                </div>
                <p style={{
                  fontSize: '0.7rem',
                  color: 'rgba(255,255,255,0.5)',
                  textAlign: 'center',
                  margin: '0 0 1.25rem 0',
                  lineHeight: '1.5'
                }}>
                  Enter your email and we'll send you a reset link.
                </p>
                <div className="v2-form-group">
                  <label className="v2-label">Email</label>
                  <input className="v2-input" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                {error && <div className="v2-error">{error}</div>}
                <button className="v2-btn-primary" type="submit" disabled={loading}>
                  {loading ? '[ Sending... ]' : 'Send Reset Link'}
                </button>
                <div className="v2-footer-link" style={{ marginTop: '1rem' }}>
                  <span onClick={() => { setAuthMode('login'); setError(''); }}>
                    ← Back to Sign In
                  </span>
                </div>
              </form>
            ) : (
              // ─── LOGIN / REGISTER FORM ─────────────
              <form onSubmit={handleAuthSubmit}>
                
                <div className="v2-form-group">
                  <label className="v2-label">Email</label>
                  <input className="v2-input" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="v2-form-group">
                  <label className="v2-label">Password</label>
                  <input className="v2-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>

                {authMode === 'login' && (
                  <div className="v2-forgot-link">
                    <span onClick={() => { setAuthMode('forgot'); setError(''); }}>
                      Forgot Password?
                    </span>
                  </div>
                )}

                {authMode === 'register' && SHOW_REGISTER_TAB && (
                  <>
                    <div className="v2-form-group" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed rgba(0,255,136,0.2)' }}>
                      <label className="v2-label">Username</label>
                      <input className="v2-input" type="text" placeholder="e.g. ghost_operator" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>

                    <div className="v2-grid-2">
                      <div>
                        <label className="v2-label">X Handle</label>
                        <input className="v2-input" type="text" placeholder="@username" value={xHandle} onChange={(e) => setXHandle(e.target.value)} />
                      </div>
                      <div>
                        <label className="v2-label">GitHub</label>
                        <input className="v2-input" type="text" placeholder="username" value={githubHandle} onChange={(e) => setGithubHandle(e.target.value)} />
                      </div>
                    </div>

                    <div className="v2-grid-2">
                      <div>
                        <label className="v2-label">Discord</label>
                        <input className="v2-input" type="text" placeholder="username" value={discordHandle} onChange={(e) => setDiscordHandle(e.target.value)} />
                      </div>
                      <div>
                        <label className="v2-label">EVM Wallet</label>
                        <input className="v2-input" type="text" placeholder="0x..." value={evmWallet} onChange={(e) => setEvmWallet(e.target.value)} />
                      </div>
                    </div>
                  </>
                )}

                {error && <div className="v2-error">{error}</div>}
                
                <button className="v2-btn-primary" type="submit" disabled={loading}>
                  {loading ? '[ Processing... ]' : 'Enter VEKTÖR'}
                </button>

                <div className="v2-footer-link">
                  New operator?{' '}
                  <span onClick={() => setAuthMode('waitlist')}>
                    Join Waitlist
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}