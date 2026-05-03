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

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
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