import { load } from "../logic/storage"

function Welcome({ setCurrentScreen }) {
  const profile = load("profile")

  return (
    <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ color: "#00ff88", fontSize: "48px", letterSpacing: "12px" }}>VEKTÖR</h1>
        <p style={{ color: "#666", letterSpacing: "2px", marginBottom: "48px" }}>Find Your AI/Web3 Path. Execute It.</p>

        {profile ? (
          <div>
            <p style={{ color: "white", marginBottom: "24px" }}>Welcome back, {profile.name} 👋</p>
            <button onClick={() => setCurrentScreen("results")} style={styles.btn}>Continue My Path →</button>
            <br /><br />
            <button onClick={() => setCurrentScreen("form")} style={styles.secondary}>Start Fresh</button>
          </div>
        ) : (
          <button onClick={() => setCurrentScreen("form")} style={styles.btn}>Start My Path →</button>
        )}
      </div>
    </div>
  )
}

const styles = {
  btn: { padding: "16px 32px", background: "#00ff88", color: "#000", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" },
  secondary: { padding: "12px 24px", background: "transparent", color: "#666", border: "1px solid #333", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }
}

export default Welcome