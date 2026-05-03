function GuideSelector({ setGuideType, setCurrentScreen }) {
  function choose(type) {
    setGuideType(type)
    setCurrentScreen("prompt")
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Choose Your Guide Type</h1>
        <p style={styles.subtitle}>This controls what kind of resources your AI guide will include.</p>

        <button style={styles.btn} onClick={() => choose("free")}>
          🆓 Free-Only Guide
          <span style={styles.desc}>YouTube, free courses, free tools only. No paid anything.</span>
        </button>

        <button style={styles.btn} onClick={() => choose("paid")}>
          💳 Paid-Course Guide
          <span style={styles.desc}>Best paid courses and tools. Cost estimates included.</span>
        </button>

        <button style={styles.btn} onClick={() => choose("mixed")}>
          🔀 Mixed Guide
          <span style={styles.desc}>Best of both. Each resource labelled FREE or PAID.</span>
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Courier New', monospace" },
  card: { background: "#111", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "48px", width: "100%", maxWidth: "520px" },
  title: { color: "#00ff88", fontSize: "24px", marginBottom: "8px" },
  subtitle: { color: "#666", fontSize: "13px", marginBottom: "32px" },
  btn: { display: "flex", flexDirection: "column", width: "100%", padding: "18px 20px", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: "8px", color: "white", fontSize: "15px", fontWeight: "bold", cursor: "pointer", marginBottom: "12px", textAlign: "left" },
  desc: { color: "#666", fontSize: "12px", fontWeight: "normal", marginTop: "6px" }
}

export default GuideSelector