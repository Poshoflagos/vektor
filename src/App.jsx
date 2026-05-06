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
import IntroLesson from "./components/IntroLesson"
import BeginnerIntroPrompt from "./components/BeginnerIntroPrompt"
import PathDirectory from "./components/PathDirectory"
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

  function handleLogout() {
    try {
      localStorage.removeItem("vektor_access")
    } catch (error) {
      console.warn("Could not remove access key:", error)
    }

    setIsAuthenticated(false)
    setCurrentScreen("password")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <NavBar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onLogout={handleLogout}
      />

      <div
        style={{
          paddingTop: "56px",
          minHeight: "100vh"
        }}
      >
        {currentScreen === "password" && (
          <PasswordGate
            setIsAuthenticated={setIsAuthenticated}
            setCurrentScreen={setCurrentScreen}
          />
        )}

        {currentScreen === "welcome" && (
          <Welcome
            setCurrentScreen={setCurrentScreen}
            userProfile={userProfile}
            selectedPath={selectedPath}
            savedReports={savedReports}
            trackerTasks={trackerTasks}
            recommendedPaths={recommendedPaths}
          />
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

        {currentScreen === "pathDirectory" && (
          <PathDirectory
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
    selectedPath={selectedPath}
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

        {currentScreen === "introLesson" && (
          <IntroLesson setCurrentScreen={setCurrentScreen} />
        )}

        {currentScreen === "introPrompt" && (
          <BeginnerIntroPrompt setCurrentScreen={setCurrentScreen} />
        )}
      </div>
    </div>
  )
}

export default App