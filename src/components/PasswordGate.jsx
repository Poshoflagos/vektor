import { useState } from "react"
import { save } from "../logic/storage"

function PasswordGate({ setIsAuthenticated, setCurrentScreen }) {
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const CORRECT = import.meta.env.VITE_APP_PASSWORD

  function handleSubmit() {
    if (input === CORRECT) {
      save("access", true)
      setIsAuthenticated(true)
      setCurrentScreen("welcome")
    } else {
      setError("Wrong password. Try again.")
      setInput("")
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:"#050505", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"monospace" }}>
      <div style={{ background:"#111", border:"1px solid #2a2a2a", borderRadius:"12px", padding:"48px", width:"100%", maxWidth:"420px", textAlign:"center" }}>
        <h1 style={{ color:"#00ff88", fontSize:"42px", letterSpacing:"12px" }}>VEKTÖR</h1>
        <p style={{ color:"#666", fontSize:"13px", marginBottom:"32px" }}>Find Your AI/Web3 Path. Execute It.</p>
        <input
          type="password"
          placeholder="Enter access password"
          value={input}
          onChange={e => { setInput(e.target.value); setError("") }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width:"100%", padding:"14px", background:"#0a0a0a", border:"1px solid #333", borderRadius:"6px", color:"white", fontSize:"16px", outline:"none", boxSizing:"border-box", marginBottom:"12px" }}
        />
        {error && <p style={{ color:"#ff4444" }}>{error}</p>}
        <button onClick={handleSubmit} style={{ width:"100%", padding:"14px", background:"#00ff88", color:"#000", border:"none", borderRadius:"6px", fontSize:"15px", fontWeight:"bold", cursor:"pointer" }}>
          Enter VEKTÖR →
        </button>
      </div>
    </div>
  )
}

export default PasswordGate