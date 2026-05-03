import { useState, useEffect } from "react"

const NAV_ITEMS = [
  { label: "Home", screen: "results" },
  { label: "Reports", screen: "reports" },
  { label: "Tracker", screen: "tracker" },
  { label: "Settings", screen: "settings" },
]

export default function NavBar({ currentScreen, onNavigate }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    const onResize = () => setIsMobile(window.innerWidth < 600)
    window.addEventListener("scroll", onScroll)
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  const validScreens = NAV_ITEMS.map(i => i.screen)
  if (!validScreens.includes(currentScreen)) return null

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: "#0a0a0a", borderBottom: "1px solid #222",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.6)" : "none",
        height: "56px", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 20px"
      }}>
        <span style={{
          color: "#00ff88", fontWeight: 800, fontSize: "18px",
          letterSpacing: "2px", fontFamily: "monospace"
        }}>
          VEKTÖR
        </span>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "8px" }}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                style={{
                  background: currentScreen === item.screen ? "#00ff88" : "transparent",
                  color: currentScreen === item.screen ? "#0a0a0a" : "#888",
                  border: currentScreen === item.screen ? "none" : "1px solid #333",
                  borderRadius: "6px", padding: "6px 14px", fontSize: "13px",
                  fontWeight: currentScreen === item.screen ? 700 : 400,
                  cursor: "pointer"
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "transparent", border: "1px solid #333",
              borderRadius: "6px", color: "#888", padding: "6px 12px",
              fontSize: "16px", cursor: "pointer"
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: "fixed", top: "56px", left: 0, right: 0,
          background: "#0a0a0a", borderBottom: "1px solid #222",
          display: "flex", flexDirection: "column", zIndex: 999
        }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.screen}
              onClick={() => { onNavigate(item.screen); setMenuOpen(false) }}
              style={{
                background: currentScreen === item.screen ? "#111" : "transparent",
                color: currentScreen === item.screen ? "#00ff88" : "#888",
                border: "none", borderBottom: "1px solid #1a1a1a",
                padding: "16px 24px", fontSize: "15px", textAlign: "left",
                cursor: "pointer",
                fontWeight: currentScreen === item.screen ? 700 : 400
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}