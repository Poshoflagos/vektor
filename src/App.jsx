import { useState, useEffect } from "react"
import { load, save } from "./logic/storage"
import OnboardingForm from "./components/OnboardingForm"
import Welcome from "./components/Welcome"
import PathResults from "./components/PathResults"
import GuideSelector from "./components/GuideSelector"
import PromptGenerator from "./components/PromptGenerator"
import PasteResult from "./components/PasteResult"
import SavedReports from "./components/SavedReports"
import NavBar from "./components/NavBar"
import Tracker from "./components/Tracker"
import Settings from "./components/Settings"
import PasswordGate from "./components/PasswordGate"

function App() {
  const [currentScreen, setCurrentScreen] = useState("password")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [pathScores, setPathScores] = useState(null)
  const [recommendedPaths, setRecommendedPaths] = useState(null)
  const [guideType, setGuideType] = useState(null)
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [aiResult, setAiResult] = useState("")
  const [savedReports, setSavedReports] = useState([])
  const [selectedPath, setSelectedPath] = useState(null)
  const [trackerTasks, setTrackerTasks] = useState([])
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("vektor_darkmode")
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    const hasAccess = load("access")
    const savedProfile = load("profile")
    const savedScores = load("scores")
    const savedPaths = load("paths")
    const savedReportsList = load("reports")
    const savedTracker = load("tracker")
    const savedPath = load("selectedPath")

    if (hasAccess) {
      setIsAuthenticated(true)
      setCurrentScreen("welcome")
    }
    if (savedProfile) setUserProfile(savedProfile)
    if (savedScores) setPathScores(savedScores)
    if (savedPaths) setRecommendedPaths(savedPaths)
    if (savedReportsList) setSavedReports(savedReportsList)
    if (savedTracker) setTrackerTasks(savedTracker.tasks || [])
    if (savedPath) setSelectedPath(savedPath)
  }, [])

  function toggleDarkMode() {
    setDarkMode(prev => {
      const next = !prev
      localStorage.setItem("vektor_darkmode", JSON.stringify(next))
      return next
    })
  }

  const theme = {
    bg: darkMode ? "#0a0a0a" : "#f0f0f0",
    card: darkMode ? "#111" : "#ffffff",
    border: darkMode ? "#222" : "#ddd",
    text: darkMode ? "#ffffff" : "#000000",
    subtext: darkMode ? "#888" : "#555",
    accent: "#00ff88",
    muted: darkMode ? "#333" : "#ccc"
  }

  return (
    <div style={{ background: theme.bg, minHeight: "100vh" }}>

      {/* Dark/Light Toggle — always visible */}
      <button
        onClick={toggleDarkMode}
        style={{
          position: "fixed",
          top: "12px",
          right: "16px",
          zIndex: 9999,
          padding: "6px 14px",
          background: darkMode ? "#1a1a1a" : "#e0e0e0",
          border: darkMode ? "1px solid #333" : "1px solid #bbb",
          borderRadius: "20px",
          color: darkMode ? "#fff" : "#000",
          fontSize: "12px",
          cursor: "pointer",
          fontWeight: "600",
          fontFamily: "'Segoe UI', sans-serif"
        }}
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      <NavBar currentScreen={currentScreen} onNavigate={setCurrentScreen} />

      <div style={{ paddingTop: "56px" }}>
        {currentScreen === "password" && (
          <PasswordGate
            setIsAuthenticated={setIsAuthenticated}
            setCurrentScreen={setCurrentScreen}
          />
        )}
        {currentScreen === "welcome" && (
          <Welcome setCurrentScreen={setCurrentScreen} />
        )}
        {currentScreen === "form" && (
          <OnboardingForm
            setCurrentScreen={setCurrentScreen}
            setUserProfile={setUserProfile}
          />
        )}
        {currentScreen === "results" && (
          <PathResults
            userProfile={userProfile}
            pathScores={pathScores}
            setPathScores={setPathScores}
            recommendedPaths={recommendedPaths}
            setRecommendedPaths={setRecommendedPaths}
            setCurrentScreen={setCurrentScreen}
            setSelectedPath={setSelectedPath}
          />
        )}
        {currentScreen === "guideSelect" && (
          <GuideSelector
            setGuideType={setGuideType}
            setCurrentScreen={setCurrentScreen}
          />
        )}
        {currentScreen === "prompt" && (
          <PromptGenerator
            userProfile={userProfile}
            recommendedPaths={recommendedPaths}
            guideType={guideType}
            setCurrentScreen={setCurrentScreen}
          />
        )}
        {currentScreen === "paste" && (
          <PasteResult
            recommendedPaths={recommendedPaths}
            guideType={guideType}
            setCurrentScreen={setCurrentScreen}
            setSavedReports={setSavedReports}
          />
        )}
        {currentScreen === "reports" && (
          <SavedReports setCurrentScreen={setCurrentScreen} />
        )}
        {currentScreen === "tracker" && (
          <Tracker setCurrentScreen={setCurrentScreen} />
        )}
        {currentScreen === "settings" && (
          <Settings
            setCurrentScreen={setCurrentScreen}
            setIsAuthenticated={setIsAuthenticated}
          />
        )}
      </div>
    </div>
  )
}

export default App