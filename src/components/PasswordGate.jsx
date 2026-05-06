import { useState } from "react"
import { save } from "../logic/storage"

function PasswordGate({ setIsAuthenticated, setCurrentScreen }) {
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [acceptedBetaNotice, setAcceptedBetaNotice] = useState(false)

  const CORRECT = import.meta.env.VITE_APP_PASSWORD

  function handleSubmit() {
    if (!acceptedBetaNotice) {
      setError("Please accept the private beta notice before entering.")
      return
    }

    if (input === CORRECT) {
      save("access", true)
      setIsAuthenticated(true)
      setCurrentScreen("welcome")
    } else {
      setError("Wrong password. Try again.")
      setInput("")
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>VEKTÖR</h1>

        <p style={styles.tagline}>
          Find Your AI/Web3 Path. Execute It.
        </p>

        <div style={styles.noticeBox}>
          <p style={styles.noticeTitle}>Private Beta Notice</p>

          <p style={styles.noticeText}>
            VEKTÖR is currently a private beta. The app is still being improved
            based on user testing and feedback.
          </p>

          <p style={styles.noticeText}>
            Do not enter seed phrases, private keys, wallet passwords, bank
            passwords, or highly sensitive personal information.
          </p>

          <p style={styles.noticeText}>
            In v1, your profile, reports, tracker data, and feedback are stored
            on this browser/device only. The founder cannot automatically see
            your saved app data unless you choose to share it.
          </p>
        </div>

        <label style={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={acceptedBetaNotice}
            onChange={event => {
              setAcceptedBetaNotice(event.target.checked)
              setError("")
            }}
            style={styles.checkbox}
          />

          <span style={styles.checkboxText}>
            I understand this is a private beta and I will not enter sensitive
            wallet, banking, password, or private-key information.
          </span>
        </label>

        <input
          type="password"
          placeholder="Enter access password"
          value={input}
          onChange={event => {
            setInput(event.target.value)
            setError("")
          }}
          onKeyDown={handleKeyDown}
          style={styles.input}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!acceptedBetaNotice}
          style={{
            ...styles.button,
            ...(!acceptedBetaNotice ? styles.buttonDisabled : {})
          }}
        >
          Enter VEKTÖR →
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050505",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "monospace",
    padding: "24px",
    boxSizing: "border-box"
  },
  card: {
    background: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: "12px",
    padding: "42px",
    width: "100%",
    maxWidth: "460px",
    textAlign: "center",
    boxSizing: "border-box"
  },
  logo: {
    color: "#00ff88",
    fontSize: "42px",
    letterSpacing: "12px",
    margin: "0 0 12px"
  },
  tagline: {
    color: "#666",
    fontSize: "13px",
    margin: "0 0 28px"
  },
  noticeBox: {
    background: "#1a1200",
    border: "1px solid #3a2800",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "18px",
    textAlign: "left"
  },
  noticeTitle: {
    color: "#aa8800",
    fontSize: "13px",
    fontWeight: "bold",
    margin: "0 0 10px"
  },
  noticeText: {
    color: "#998866",
    fontSize: "12px",
    lineHeight: "1.6",
    margin: "0 0 10px"
  },
  checkboxRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    textAlign: "left",
    marginBottom: "18px",
    cursor: "pointer"
  },
  checkbox: {
    marginTop: "3px",
    accentColor: "#00ff88",
    cursor: "pointer"
  },
  checkboxText: {
    color: "#888",
    fontSize: "12px",
    lineHeight: "1.6"
  },
  input: {
    width: "100%",
    padding: "14px",
    background: "#0a0a0a",
    border: "1px solid #333",
    borderRadius: "6px",
    color: "white",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "12px"
  },
  error: {
    color: "#ff4444",
    fontSize: "13px",
    margin: "0 0 12px"
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#00ff88",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  buttonDisabled: {
    opacity: 0.35,
    cursor: "not-allowed"
  }
}

export default PasswordGate