// src/components/BeginnerIntroPrompt.jsx
export default function BeginnerIntroPrompt({ setCurrentScreen, setHasSeenIntro }) {
  function markIntroDecision() {
    if (typeof setHasSeenIntro === "function") {
      setHasSeenIntro(true);
    }
  }

  function skipToVektor() {
    markIntroDecision();
    setCurrentScreen("form");
  }

  function openBeginnerIntro() {
    markIntroDecision();
    setCurrentScreen("introLesson");
  }

  return (
    <div className="intro-modal-overlay">
      <div className="intro-modal-card">
        <div className="intro-modal-accent" />
        <div className="intro-modal-content">
          <h1 className="intro-modal-title">Welcome to VEKTÖR</h1>
          <p className="intro-modal-body">
            VEKTÖR helps you find a realistic AI/Web3 path, generate a structured
            execution guide, and turn that guide into a tracker you can follow.
          </p>

          <div className="intro-modal-subsection">
            <h2 className="intro-modal-subtitle">First time here?</h2>
            <p className="intro-modal-text">
              Take a short beginner intro before starting, or skip straight to the VEKTÖR interview.
            </p>
          </div>

          <div className="intro-modal-steps">
            <div className="intro-modal-step">1. Answer the VEKTÖR interview questions.</div>
            <div className="intro-modal-step">2. Get matched with realistic AI/Web3 paths.</div>
            <div className="intro-modal-step">3. Generate a prompt for ChatGPT, Claude, or Gemini.</div>
            <div className="intro-modal-step">4. Paste the guide back into VEKTÖR to build your tracker.</div>
          </div>

          <div className="intro-modal-buttons">
            <button className="intro-modal-btn secondary" onClick={skipToVektor}>
              Skip to VEKTÖR
            </button>
            <button className="intro-modal-btn primary" onClick={openBeginnerIntro}>
              Show Beginner Intro
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .intro-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .intro-modal-card {
          max-width: 680px;
          width: 100%;
          background: var(--color-surface, #161616);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          animation: fadeInUp 0.2s ease-out;
        }
        .intro-modal-accent {
          height: 4px;
          background: var(--color-accent, #00FF85);
        }
        .intro-modal-content {
          padding: 2rem;
        }
        .intro-modal-title {
          font-family: 'Courier New', 'Fira Code', monospace;
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--color-accent, #00FF85);
          margin: 0 0 1rem 0;
        }
        .intro-modal-body {
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          line-height: 1.5;
          color: var(--color-text-primary, #F0F0F0);
          margin: 0 0 1.5rem 0;
        }
        .intro-modal-subsection {
          margin-bottom: 1.5rem;
        }
        .intro-modal-subtitle {
          font-family: 'Courier New', monospace;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-accent, #00FF85);
          margin: 0 0 0.5rem 0;
        }
        .intro-modal-text {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: var(--color-text-secondary, #A0A0A0);
          margin: 0;
        }
        .intro-modal-steps {
          margin-bottom: 2rem;
          padding-left: 1.25rem;
        }
        .intro-modal-step {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          color: var(--color-text-primary, #F0F0F0);
          margin-bottom: 0.5rem;
        }
        .intro-modal-buttons {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          flex-wrap: wrap;
        }
        .intro-modal-btn {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.625rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
          background: none;
        }
        .intro-modal-btn.primary {
          background: var(--color-accent, #00FF85);
          color: #0a0a0a;
        }
        .intro-modal-btn.primary:hover {
          background: #00cc6a;
          transform: translateY(-1px);
        }
        .intro-modal-btn.secondary {
          background: transparent;
          color: var(--color-accent, #00FF85);
          border: 1px solid var(--color-accent, #00FF85);
        }
        .intro-modal-btn.secondary:hover {
          background: rgba(0, 255, 133, 0.1);
          transform: translateY(-1px);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .intro-modal-content { padding: 1.5rem; }
          .intro-modal-title { font-size: 1.5rem; }
          .intro-modal-buttons { flex-direction: column-reverse; }
          .intro-modal-btn { width: 100%; text-align: center; }
        }
      `}</style>
    </div>
  );
}