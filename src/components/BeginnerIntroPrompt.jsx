// BeginnerIntroPrompt.jsx
// Shows after onboarding if user selected beginner level

function BeginnerIntroPrompt({ setCurrentScreen }) {
  function startIntro() {
    try {
      localStorage.setItem("vektor_hasSeenIntro", JSON.stringify(true))
    } catch (error) {
      console.warn("Could not save intro status:", error)
    }

    setCurrentScreen("introLesson")
  }

  function skipIntro() {
    try {
      localStorage.setItem("vektor_hasSeenIntro", JSON.stringify(false))
    } catch (error) {
      console.warn("Could not save intro status:", error)
    }

    setCurrentScreen("results")
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={styles.kicker}>BEGINNER MODE</p>

        <h1 style={styles.title}>Want a quick intro first?</h1>

        <p style={styles.text}>
          You selected beginner level. Before showing your path results, VEKTÖR
          can give you a simple explanation of AI, Web3, the opportunities in
          both, and why 2026 is still early enough to start seriously.
        </p>

        <div style={styles.notice}>
          This is optional. If you already understand the basics, you can skip it
          and go straight to your path results.
        </div>

        <div style={styles.buttonRow}>
          <button onClick={skipIntro} style={styles.secondaryButton}>
            Skip — Show My Results
          </button>

          <button onClick={startIntro} style={styles.primaryButton}>
            Yes — Teach Me First
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#fff",
    fontFamily: "'Courier New', monospace",
    padding: "86px 20px 70px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box"
  },
  card: {
    width: "100%",
    maxWidth: "560px",
    background: "#111",
    border: "1px solid #222",
    borderRadius: "14px",
    padding: "32px",
    boxSizing: "border-box"
  },
  kicker: {
    color: "#00ff88",
    fontSize: "12px",
    letterSpacing: "2px",
    margin: "0 0 12px"
  },
  title: {
    color: "#fff",
    fontSize: "30px",
    lineHeight: "1.2",
    margin: "0 0 16px"
  },
  text: {
    color: "#aaa",
    fontSize: "14px",
    lineHeight: "1.8",
    margin: "0 0 20px"
  },
  notice: {
    background: "#1a1200",
    border: "1px solid #3a2800",
    color: "#aa8800",
    fontSize: "13px",
    lineHeight: "1.6",
    padding: "14px",
    borderRadius: "10px",
    marginBottom: "24px"
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  },
  primaryButton: {
    background: "#00ff88",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    padding: "14px 18px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    flex: 1,
    minWidth: "210px"
  },
  secondaryButton: {
    background: "transparent",
    color: "#888",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "14px 18px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    flex: 1,
    minWidth: "210px"
  }
}

export default BeginnerIntroPrompt