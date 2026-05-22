// src/components/LandingPage.jsx
import { useState } from 'react';
import { joinWaitlistCloud, verifyAccessToken } from '../logic/supabase';

export default function LandingPage({ onStartAccess }) {
  const [formState, setFormState] = useState('main'); // main, tokenEntry, waitlist, tokenSuccess
  
  // Auth State
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  
  // Waitlist State
  const [wlName, setWlName] = useState('');
  const [wlEmail, setWlEmail] = useState('');
  const [wlInterest, setWlInterest] = useState('AI x Web3');
  const [wlExp, setWlExp] = useState('Intermediate');
  const [generatedToken, setGeneratedToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = await verifyAccessToken(email, token);
    if (res.success) {
      onStartAccess(token, email);
    } else {
      setError(res.error);
      setLoading(false);
    }
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = await joinWaitlistCloud(wlName, wlEmail, wlInterest, wlExp);
    if (res.success) {
      setGeneratedToken(res.token);
      setFormState('tokenSuccess');
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        /* GLOBAL RESET FOR VITE DEFAULTS */
        body, html {
          margin: 0 !important;
          padding: 0 !important;
          width: 100%;
          background-color: #070A12;
        }
        #root {
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100%;
        }

        /* COMPONENT STYLES */
        .v2-landing {
          min-height: 100vh;
          width: 100%;
          background-color: #070A12;
          color: #F4F7FB;
          font-family: 'Courier New', Courier, monospace;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 1.5rem;
          box-sizing: border-box;
          overflow-x: hidden;
        }
        .v2-nav {
          width: 100%;
          max-width: 1000px;
          padding: 1.5rem 0;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 4rem;
        }
        .v2-logo {
          font-weight: bold;
          font-size: 1.25rem;
          letter-spacing: 2px;
        }
        .v2-logo span { color: #3DDC97; }
        
        .v2-hero {
          text-align: center;
          max-width: 800px;
          width: 100%;
          margin-bottom: 4rem;
        }
        .v2-badge {
          display: inline-block;
          border: 1px solid rgba(61, 220, 151, 0.3);
          background: rgba(61, 220, 151, 0.1);
          color: #3DDC97;
          padding: 0.4rem 1rem;
          border-radius: 50px;
          font-size: 0.85rem;
          margin-bottom: 2rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .v2-title {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          line-height: 1.1;
          margin: 0 0 1.5rem 0;
          color: #fff;
        }
        .v2-subtitle {
          font-size: 1.1rem;
          color: #A7B0C0;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto 3rem auto;
        }
        .v2-btn-group {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .v2-btn-primary {
          background: #3DDC97;
          color: #070A12;
          border: none;
          padding: 1rem 2.5rem;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          border-radius: 4px;
          font-family: inherit;
          text-transform: uppercase;
          transition: all 0.2s;
        }
        .v2-btn-primary:hover { background: #2fb57a; transform: translateY(-2px); }
        .v2-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        
        .v2-btn-secondary {
          background: transparent;
          color: #F4F7FB;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 1rem 2.5rem;
          font-size: 1rem;
          cursor: pointer;
          border-radius: 4px;
          font-family: inherit;
          text-transform: uppercase;
          transition: all 0.2s;
        }
        .v2-btn-secondary:hover { border-color: #F4F7FB; background: rgba(255,255,255,0.05); }
        
        .v2-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          width: 100%;
          max-width: 1000px;
          margin-bottom: 5rem;
        }
        .v2-card {
          background: #101522;
          border: 1px solid rgba(255,255,255,0.05);
          padding: 2rem;
          border-radius: 8px;
          text-align: left;
          transition: border-color 0.3s;
        }
        .v2-card:hover { border-color: rgba(61, 220, 151, 0.4); }
        .v2-card h3 { margin: 0 0 1rem 0; color: #fff; font-size: 1.25rem; }
        .v2-card p { margin: 0; color: #A7B0C0; font-size: 0.9rem; line-height: 1.5; }
        
        .v2-auth-box {
          background: #101522;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 2.5rem;
          border-radius: 8px;
          max-width: 400px;
          width: 100%;
          margin: 4rem auto;
        }
        .v2-input-group { margin-bottom: 1.5rem; text-align: left; }
        .v2-input-group label { display: block; margin-bottom: 0.5rem; color: #A7B0C0; font-size: 0.85rem; text-transform: uppercase; }
        .v2-input {
          width: 100%;
          padding: 0.8rem 1rem;
          background: #070A12;
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          font-family: inherit;
          border-radius: 4px;
          box-sizing: border-box;
        }
        .v2-input:focus { outline: none; border-color: #3DDC97; }
        .v2-error { background: rgba(255, 92, 122, 0.1); border: 1px solid #FF5C7A; color: #FF5C7A; padding: 0.8rem; border-radius: 4px; margin-bottom: 1.5rem; font-size: 0.85rem; }
      `}</style>

      <div className="v2-landing">
        <nav className="v2-nav">
          <div className="v2-logo"><span>▲</span> VEKTOR</div>
        </nav>

        {formState === 'tokenSuccess' && (
          <div className="v2-auth-box" style={{ maxWidth: '500px', border: '1px solid #3DDC97' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#3DDC97' }}>Access Granted</h2>
            <p style={{ textAlign: 'center', color: '#A7B0C0', marginBottom: '2rem' }}>
              You are officially on the VEKTOR beta roster. Here is your one-time access token. 
              <br/><br/><strong style={{color: '#FF5C7A'}}>Save this immediately. It will never be shown again.</strong>
            </p>
            
            <div style={{ background: '#070A12', padding: '1.5rem', textAlign: 'center', borderRadius: '4px', border: '1px dashed #3DDC97', marginBottom: '2rem' }}>
              <span style={{ fontSize: '1.5rem', fontFamily: 'monospace', color: '#fff', letterSpacing: '2px' }}>{generatedToken}</span>
            </div>

            <button onClick={() => { setToken(generatedToken); setEmail(wlEmail); setFormState('tokenEntry'); }} className="v2-btn-primary" style={{ width: '100%' }}>
              Proceed to Login
            </button>
          </div>
        )}

        {formState === 'waitlist' && (
          <div className="v2-auth-box" style={{ maxWidth: '450px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>Join Beta Roster</h2>
            <form onSubmit={handleWaitlistSubmit}>
              <div className="v2-input-group">
                <label>Operator Name</label>
                <input type="text" className="v2-input" value={wlName} onChange={(e) => setWlName(e.target.value)} required />
              </div>
              <div className="v2-input-group">
                <label>Email Address</label>
                <input type="email" className="v2-input" value={wlEmail} onChange={(e) => setWlEmail(e.target.value)} required />
              </div>
              <div className="v2-input-group">
                <label>Primary Sector Focus</label>
                <select className="v2-input" value={wlInterest} onChange={(e) => setWlInterest(e.target.value)}>
                  <option>AI</option>
                  <option>Web3</option>
                  <option>AI x Web3</option>
                </select>
              </div>
              <div className="v2-input-group">
                <label>Experience Level</label>
                <select className="v2-input" value={wlExp} onChange={(e) => setWlExp(e.target.value)}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              
              {error && <div className="v2-error">{error}</div>}
              
              <button type="submit" className="v2-btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
                {loading ? 'Generating Token...' : 'Request Access'}
              </button>
              <button type="button" className="v2-btn-secondary" style={{ width: '100%' }} onClick={() => setFormState('main')}>
                Cancel
              </button>
            </form>
          </div>
        )}

        {formState === 'tokenEntry' && (
          <div className="v2-auth-box">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>Authenticate</h2>
            <form onSubmit={handleTokenSubmit}>
              <div className="v2-input-group">
                <label>Email Address</label>
                <input type="email" className="v2-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@email.com" required />
              </div>
              <div className="v2-input-group">
                <label>Access Token</label>
                <input type="text" className="v2-input" value={token} onChange={(e) => setToken(e.target.value)} placeholder="VKT-XXXX-XXXX" required />
              </div>
              {error && <div className="v2-error">{error}</div>}
              
              <button type="submit" className="v2-btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Enter Console'}
              </button>
              <button type="button" className="v2-btn-secondary" style={{ width: '100%' }} onClick={() => setFormState('main')}>
                Cancel
              </button>
            </form>
          </div>
        )}

        {formState === 'main' && (
          <>
            <section className="v2-hero">
              <div className="v2-badge">● Early Access Beta</div>
              <h1 className="v2-title">AI/Web3 Execution Cockpit</h1>
              <p className="v2-subtitle">
                Choose a path. Generate an execution guide. Track progress. Build proof-of-work. Move from confusion to real execution.
              </p>
              
              <div className="v2-btn-group">
                <button className="v2-btn-primary" onClick={() => setFormState('tokenEntry')}>
                  I Have a Token
                </button>
                <button className="v2-btn-secondary" onClick={() => setFormState('waitlist')}>
                  Join Waitlist
                </button>
              </div>
            </section>

            <section className="v2-grid">
              <div className="v2-card">
                <h3>AI</h3>
                <p>Prompt engineering, automation, and API integration pathways for emerging operators.</p>
              </div>
              <div className="v2-card">
                <h3>Web3</h3>
                <p>DeFi, on-chain analysis, smart contract security, and protocol research.</p>
              </div>
              <div className="v2-card">
                <h3>AI × Web3</h3>
                <p>Converged opportunities, AI agents on-chain, and high-leverage edge systems.</p>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}