import { useState } from "react"

const NAV_ITEMS = [
  { label: "Home", screen: "welcome", icon: "⌂" },
  { label: "Intro", screen: "introLesson", icon: "◇" },
  { label: "Reports", screen: "reports", icon: "📋" },
  { label: "Tracker", screen: "tracker", icon: "✓" },
  { label: "Settings", screen: "settings", icon: "⚙" },
]

// These are screens where the navbar should still be visible.
// Without this, the navbar may disappear on screens like prompt, paste, or guideSelect.
const VISIBLE_SCREENS = [
  "welcome",
  "form",
  "results",
  "introLesson",
  "guideSelect",
  "prompt",
  "paste",
  "reports",
  "tracker",
  "settings"
]

export default function NavBar({ currentScreen, onNavigate }) {
  const [open, setOpen] = useState(false)

  if (!VISIBLE_SCREENS.includes(currentScreen)) return null

  function handleNavigate(screen) {
    onNavigate(screen)
    setOpen(false)
  }

  return (
    <>
      {/* Top bar — always visible */}
      <div style={styles.topBar}>
        <button onClick={() => setOpen(!open)} style={styles.hamburger}>
          {open ? "✕" : "☰"}
        </button>

        <span style={styles.logo}>VEKTÖR</span>

        <div style={{ width: "40px" }} />
      </div>

      {/* Overlay — closes sidebar when clicking outside */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={styles.overlay}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          ...styles.sidebar,
          transform: open ? "translateX(0)" : "translateX(-100%)"
        }}
      >
        {/* Sidebar header */}
        <div style={styles.sidebarHeader}>
          <span style={styles.sidebarLogo}>VEKTÖR</span>
          <button onClick={() => setOpen(false)} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        <div style={styles.sidebarDivider} />

        {/* Nav items */}
        <div style={styles.navItems}>
          {NAV_ITEMS.map(item => {
            const isActive = currentScreen === item.screen

            return (
              <button
                key={item.screen}
                onClick={() => handleNavigate(item.screen)}
                style={{
                  ...styles.navItem,
                  background: isActive ? "#0d2a1a" : "transparent",
                  color: isActive ? "#00ff88" : "#888",
                  borderLeft: isActive
                    ? "3px solid #00ff88"
                    : "3px solid transparent"
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span style={styles.navLabel}>{item.label}</span>

                {isActive && (
                  <span style={styles.activeDot} />
                )}
              </button>
            )
          })}
        </div>

        {/* Sidebar footer */}
        <div style={styles.sidebarFooter}>
          <div style={styles.sidebarDivider} />
          <p style={styles.footerVersion}>v1.0.0</p>
          <p style={styles.footerText}>Your data stays on your device.</p>
        </div>
      </div>
    </>
  )
}

const styles = {
  topBar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 900,
    height: "56px",
    background: "#0a0a0a",
    borderBottom: "1px solid #1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    boxSizing: "border-box"
  },
  hamburger: {
    background: "transparent",
    border: "1px solid #222",
    borderRadius: "6px",
    color: "#888",
    width: "40px",
    height: "36px",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  logo: {
    color: "#00ff88",
    fontWeight: 800,
    fontSize: "18px",
    letterSpacing: "2px",
    fontFamily: "monospace"
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(2px)"
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "260px",
    zIndex: 1100,
    background: "#0d0d0d",
    borderRight: "1px solid #1e1e1e",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.25s ease"
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 20px 16px"
  },
  sidebarLogo: {
    color: "#00ff88",
    fontWeight: 800,
    fontSize: "20px",
    letterSpacing: "2px",
    fontFamily: "monospace"
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#444",
    fontSize: "18px",
    cursor: "pointer",
    padding: "4px 8px"
  },
  sidebarDivider: {
    height: "1px",
    background: "#1a1a1a",
    margin: "0 16px"
  },
  navItems: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "16px 12px",
    flex: 1
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "none",
    borderLeft: "3px solid transparent",
    cursor: "pointer",
    fontSize: "15px",
    fontFamily: "monospace",
    fontWeight: 500,
    textAlign: "left",
    transition: "all 0.15s ease",
    position: "relative",
    width: "100%"
  },
  navIcon: {
    fontSize: "16px",
    width: "20px",
    textAlign: "center",
    flexShrink: 0
  },
  navLabel: {
    flex: 1
  },
  activeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#00ff88",
    flexShrink: 0
  },
  sidebarFooter: {
    padding: "0 0 24px"
  },
  footerVersion: {
    color: "#333",
    fontSize: "11px",
    fontFamily: "monospace",
    padding: "12px 20px 2px",
    margin: 0
  },
  footerText: {
    color: "#2a2a2a",
    fontSize: "11px",
    padding: "0 20px",
    margin: 0,
    lineHeight: "1.4"
  }
}