// src/components/ProofList.jsx
import { useEffect, useState } from 'react';
import { loadProofsCloud } from '../logic/supabase';

export default function ProofList({ userId }) {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProofs() {
      const { data } = await loadProofsCloud(userId);
      setProofs(data || []);
      setLoading(false);
    }
    if (userId) fetchProofs();
  }, [userId]);

  if (loading) return (
    <div style={{ color: 'rgba(255,255,255,0.4)', padding: '1rem', fontFamily: "'SF Mono', 'Courier New', monospace", fontSize: '0.7rem' }}>
      [ Loading Evidence Vault... ]
    </div>
  );

  if (!proofs.length) return (
    <div style={{ color: 'rgba(255,255,255,0.3)', padding: '1rem', fontFamily: "'SF Mono', 'Courier New', monospace", fontSize: '0.7rem' }}>
      No proofs submitted yet.
    </div>
  );

  const getStatusBadge = (proof) => {
    if (proof.validated) {
      return { text: '[ VALIDATED ]', color: '#00ff88', bg: 'rgba(0,255,136,0.08)' };
    }
    if (proof.validation_status === 'challenged') {
      return { text: '[ CHALLENGED ]', color: '#ff4444', bg: 'rgba(255,68,68,0.08)' };
    }
    return { text: '[ PENDING ]', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.03)' };
  };

  const getProofType = (url) => {
    if (!url) return 'LINK';
    if (url.includes('github.com')) return 'GITHUB';
    if (url.includes('x.com') || url.includes('twitter.com')) return 'X';
    if (url.includes('t.me')) return 'TELEGRAM';
    if (url.includes('supabase.co/storage')) return 'VISUAL';
    return 'LINK';
  };

  return (
    <div style={{ fontFamily: "'SF Mono', 'Courier New', monospace", color: '#ffffff' }}>
      <style>{`
        .pv-list { list-style: none; padding: 0; margin: 0; }
        .pv-item { 
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 0.7rem; gap: 0.75rem; flex-wrap: wrap;
        }
        .pv-item:hover { background: rgba(255,255,255,0.02); }
        .pv-link { 
          color: rgba(255,255,255,0.6); text-decoration: none; 
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          flex: 1; min-width: 0;
        }
        .pv-link:hover { color: #00ff88; text-decoration: underline; }
        .pv-badge {
          font-size: 0.6rem; padding: 0.15rem 0.5rem; border-radius: 3px;
          font-weight: bold; letter-spacing: 0.5px; white-space: nowrap;
        }
        .pv-type {
          font-size: 0.55rem; color: rgba(255,255,255,0.3);
          text-transform: uppercase; letter-spacing: 1px; min-width: 55px;
        }
        .pv-date {
          font-size: 0.55rem; color: rgba(255,255,255,0.25);
          white-space: nowrap;
        }
      `}</style>
      <ul className="pv-list">
        {proofs.map(proof => {
          const status = getStatusBadge(proof);
          const type = getProofType(proof.url);
          const date = new Date(proof.created_at).toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric' 
          });
          
          return (
            <li key={proof.id} className="pv-item">
              <span className="pv-type">{type}</span>
              <a href={proof.url} target="_blank" rel="noopener noreferrer" className="pv-link">
                {proof.url ? proof.url.substring(0, 50) + (proof.url.length > 50 ? '...' : '') : 'No URL'}
              </a>
              <span className="pv-date">{date}</span>
              <span className="pv-badge" style={{ color: status.color, background: status.bg }}>
                {status.text}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}