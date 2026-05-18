// src/App.jsx
import { useEffect, useRef, useState } from "react";
import {
  hydrateVektorState,
  persistVektorState,
  removeFromStorage,
  resetAll,
  saveToStorage,
  STORAGE_KEYS,
} from "./logic/storage";

import OnboardingForm from "./components/OnboardingForm";
import Welcome from "./components/Welcome";
import PathResults from "./components/PathResults";
import GuideSelector from "./components/GuideSelector";
import PromptGenerator from "./components/PromptGenerator";
import PasteResult from "./components/PasteResult";
import SavedReports from "./components/SavedReports";
import NavBar from "./components/NavBar";
import Tracker from "./components/Tracker";
import Settings from "./components/Settings";
import IntroLesson from "./components/IntroLesson";
import BeginnerIntroPrompt from "./components/BeginnerIntroPrompt";
import PathDirectory from "./components/PathDirectory";
import PasswordGate from "./components/PasswordGate";

const SCREENS = {
  PASSWORD: "password",
  WELCOME: "welcome",
  FORM: "form",
  RESULTS: "results",
  PATH_DIRECTORY: "pathDirectory",
  GUIDE_SELECT: "guideSelect",
  PROMPT: "prompt",
  PASTE: "paste",
  REPORTS: "reports",
  TRACKER: "tracker",
  SETTINGS: "settings",
  INTRO_LESSON: "introLesson",
  INTRO_PROMPT: "introPrompt",
};

const VALID_SCREENS = new Set(Object.values(SCREENS));

const PATH_REQUIRED_SCREENS = new Set([
  SCREENS.GUIDE_SELECT,
  SCREENS.PROMPT,
  SCREENS.PASTE,
]);

function isFilled(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object" && value !== null) {
    return Object.values(value).some((item) => isFilled(item));
  }
  return String(value || "").trim().length > 0;
}

function isProfileComplete(profile) {
  if (!profile || typeof profile !== "object") return false;
  const usefulFields = [
    profile.name,
    profile.fullName,
    profile.username,
    profile.interestArea,
    profile.interests,
    profile.primaryInterest,
    profile.experienceLevel,
    profile.experience,
    profile.strengths,
    profile.naturalStrengths,
    profile.background,
    profile.hoursPerDay,
    profile.availableTime,
    profile.timePerDay,
    profile.urgency,
    profile.learningStyle,
    profile.budget,
    profile.goal,
    profile.mainGoal,
    profile.constraints,
  ];
  return usefulFields.filter(isFilled).length >= 4;
}

function hasUsablePath(selectedPath, recommendedPaths) {
  if (selectedPath && isFilled(selectedPath)) return true;
  if (Array.isArray(recommendedPaths)) return recommendedPaths.length > 0;
  if (recommendedPaths?.best) return isFilled(recommendedPaths.best);
  if (recommendedPaths?.top) return isFilled(recommendedPaths.top);
  return false;
}

function getStartScreen({
  authenticated,
  profile,
  hasSeenIntro,
  selectedPath,
  recommendedPaths,
}) {
  if (!authenticated) return SCREENS.PASSWORD;
  if (!isProfileComplete(profile)) {
    return hasSeenIntro ? SCREENS.FORM : SCREENS.INTRO_PROMPT;
  }
  if (!hasUsablePath(selectedPath, recommendedPaths)) return SCREENS.RESULTS;
  return SCREENS.WELCOME;
}

function App() {
  const hasHydrated = useRef(false);

  const appStateRef = useRef({
    isAuthenticated: false,
    userProfile: null,
    recommendedPaths: null,
    selectedPath: null,
    trackerData: null,
    hasSeenIntro: false,
  });

  const [currentScreen, setCurrentScreen] = useState(SCREENS.PASSWORD);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [userProfile, setUserProfile] = useState(null);
  const [pathScores, setPathScores] = useState(null);
  const [recommendedPaths, setRecommendedPaths] = useState(null);
  const [guideType, setGuideType] = useState(null);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [pastedOutput, setPastedOutput] = useState("");
  const [savedReports, setSavedReports] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);

  const [activeGuide, setActiveGuide] = useState(null);
  const [activeReportId, setActiveReportId] = useState(null);
  const [trackerData, setTrackerData] = useState(null);
  const [trackerProgress, setTrackerProgress] = useState({});
  const [checkInData, setCheckInData] = useState(null);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  function setAuthState(value) {
    const resolved = Boolean(value);
    appStateRef.current.isAuthenticated = resolved;
    setIsAuthenticated(resolved);
  }

  function updateUserProfile(nextProfile) {
    const resolved =
      typeof nextProfile === "function"
        ? nextProfile(appStateRef.current.userProfile)
        : nextProfile;
    appStateRef.current.userProfile = resolved;
    setUserProfile(resolved);
  }

  function updateRecommendedPaths(nextPaths) {
    const resolved =
      typeof nextPaths === "function"
        ? nextPaths(appStateRef.current.recommendedPaths)
        : nextPaths;
    appStateRef.current.recommendedPaths = resolved;
    setRecommendedPaths(resolved);
  }

  function updateSelectedPath(nextPath) {
    const resolved =
      typeof nextPath === "function"
        ? nextPath(appStateRef.current.selectedPath)
        : nextPath;
    appStateRef.current.selectedPath = resolved;
    setSelectedPath(resolved);
  }

  function updateTrackerData(nextTrackerData) {
    const resolved =
      typeof nextTrackerData === "function"
        ? nextTrackerData(appStateRef.current.trackerData)
        : nextTrackerData;
    appStateRef.current.trackerData = resolved;
    setTrackerData(resolved);
  }

  function updateHasSeenIntro(value) {
    const resolved = Boolean(value);
    appStateRef.current.hasSeenIntro = resolved;
    setHasSeenIntro(resolved);
    saveToStorage(STORAGE_KEYS.HAS_SEEN_INTRO, resolved);
  }

  useEffect(() => {
    const hydrated = hydrateVektorState();

    const hydratedUserProfile = hydrated.userProfile;
    const hydratedRecommendedPaths = hydrated.paths?.length ? hydrated.paths : null;
    const hydratedSelectedPath = hydrated.selectedPath;
    const hydratedTrackerData = hydrated.trackerData;
    const hydratedHasSeenIntro = Boolean(hydrated.hasSeenIntro);

    // V1 private beta rule:
    // Always require the password again on page refresh/reopen.
    // User progress still persists; access session does not.
    const hydratedHasAccess = false;
    removeFromStorage(STORAGE_KEYS.ACCESS);

    appStateRef.current = {
      isAuthenticated: hydratedHasAccess,
      userProfile: hydratedUserProfile,
      recommendedPaths: hydratedRecommendedPaths,
      selectedPath: hydratedSelectedPath,
      trackerData: hydratedTrackerData,
      hasSeenIntro: hydratedHasSeenIntro,
    };

    setIsAuthenticated(hydratedHasAccess);
    setUserProfile(hydratedUserProfile);
    setPathScores(hydrated.scores);
    setRecommendedPaths(hydratedRecommendedPaths);
    setGuideType(hydrated.guideType);
    setGeneratedPrompt(hydrated.generatedPrompt || "");
    setPastedOutput(hydrated.pastedOutput || "");
    setSavedReports(Array.isArray(hydrated.savedReports) ? hydrated.savedReports : []);
    setSelectedPath(hydratedSelectedPath);
    setActiveGuide(hydrated.activeGuide);
    setActiveReportId(hydrated.activeReportId);
    setTrackerData(hydratedTrackerData);
    setTrackerProgress(hydrated.trackerProgress || {});
    setCheckInData(hydrated.checkInData);
    setHasSeenIntro(hydratedHasSeenIntro);

    setCurrentScreen(SCREENS.PASSWORD);

    hasHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;

    persistVektorState({
      userProfile,
      scores: pathScores,
      paths: recommendedPaths || [],
      guideType,
      generatedPrompt,
      pastedOutput,
      savedReports,
      selectedPath,
      activeGuide,
      activeReportId,
      trackerData,
      trackerProgress,
      checkInData,
      hasSeenIntro,
    });
  }, [
    userProfile,
    pathScores,
    recommendedPaths,
    guideType,
    generatedPrompt,
    pastedOutput,
    savedReports,
    selectedPath,
    activeGuide,
    activeReportId,
    trackerData,
    trackerProgress,
    checkInData,
    hasSeenIntro,
  ]);

  function markIntroSeen() {
    updateHasSeenIntro(true);
  }

  function getGuardState() {
    return {
      authenticated: appStateRef.current.isAuthenticated,
      profile: appStateRef.current.userProfile,
      hasSeenIntro: appStateRef.current.hasSeenIntro,
      selectedPath: appStateRef.current.selectedPath,
      recommendedPaths: appStateRef.current.recommendedPaths,
      trackerData: appStateRef.current.trackerData,
    };
  }

  function goToScreen(screen) {
    const guard = getGuardState();

    if (!VALID_SCREENS.has(screen)) {
      setCurrentScreen(
        getStartScreen({
          authenticated: guard.authenticated,
          profile: guard.profile,
          hasSeenIntro: guard.hasSeenIntro,
          selectedPath: guard.selectedPath,
          recommendedPaths: guard.recommendedPaths,
        })
      );
      return;
    }

    if (!guard.authenticated && screen !== SCREENS.PASSWORD) {
      setCurrentScreen(SCREENS.PASSWORD);
      return;
    }

    if (screen === SCREENS.PASSWORD) {
      setCurrentScreen(SCREENS.PASSWORD);
      return;
    }

    if (screen === SCREENS.INTRO_PROMPT) {
      setCurrentScreen(SCREENS.INTRO_PROMPT);
      return;
    }

    if (screen === SCREENS.INTRO_LESSON) {
      markIntroSeen();
      setCurrentScreen(SCREENS.INTRO_LESSON);
      return;
    }

    if (screen === SCREENS.FORM) {
      markIntroSeen();
      setCurrentScreen(SCREENS.FORM);
      return;
    }

    if (screen === SCREENS.WELCOME) {
      if (!isProfileComplete(guard.profile)) {
        setCurrentScreen(guard.hasSeenIntro ? SCREENS.FORM : SCREENS.INTRO_PROMPT);
        return;
      }
      if (!hasUsablePath(guard.selectedPath, guard.recommendedPaths)) {
        setCurrentScreen(SCREENS.RESULTS);
        return;
      }
      setCurrentScreen(SCREENS.WELCOME);
      return;
    }

    if (screen === SCREENS.RESULTS) {
      setCurrentScreen(SCREENS.RESULTS);
      return;
    }

    if (PATH_REQUIRED_SCREENS.has(screen)) {
      if (!isProfileComplete(guard.profile)) {
        setCurrentScreen(SCREENS.FORM);
        return;
      }
      if (!hasUsablePath(guard.selectedPath, guard.recommendedPaths)) {
        setCurrentScreen(SCREENS.RESULTS);
        return;
      }
      setCurrentScreen(screen);
      return;
    }

    if (screen === SCREENS.TRACKER && !guard.trackerData) {
      if (!isProfileComplete(guard.profile)) {
        setCurrentScreen(SCREENS.FORM);
        return;
      }
      if (!hasUsablePath(guard.selectedPath, guard.recommendedPaths)) {
        setCurrentScreen(SCREENS.RESULTS);
        return;
      }
      setCurrentScreen(SCREENS.PASTE);
      return;
    }

    setCurrentScreen(screen);
  }

  function handleAuthChange(value) {
    const authenticated = Boolean(value);
    setAuthState(authenticated);
    if (!authenticated) {
      removeFromStorage(STORAGE_KEYS.ACCESS);
      setCurrentScreen(SCREENS.PASSWORD);
      return;
    }
    const guard = getGuardState();
    setCurrentScreen(
      getStartScreen({
        authenticated,
        profile: guard.profile,
        hasSeenIntro: guard.hasSeenIntro,
        selectedPath: guard.selectedPath,
        recommendedPaths: guard.recommendedPaths,
      })
    );
  }

  function handleLogout() {
    removeFromStorage(STORAGE_KEYS.ACCESS);
    setAuthState(false);
    setCurrentScreen(SCREENS.PASSWORD);
  }

  function resetVektorApp() {
    resetAll();
    appStateRef.current = {
      isAuthenticated: false,
      userProfile: null,
      recommendedPaths: null,
      selectedPath: null,
      trackerData: null,
      hasSeenIntro: false,
    };
    setIsAuthenticated(false);
    setUserProfile(null);
    setPathScores(null);
    setRecommendedPaths(null);
    setGuideType(null);
    setGeneratedPrompt("");
    setPastedOutput("");
    setSavedReports([]);
    setSelectedPath(null);
    setActiveGuide(null);
    setActiveReportId(null);
    setTrackerData(null);
    setTrackerProgress({});
    setCheckInData(null);
    setHasSeenIntro(false);
    setCurrentScreen(SCREENS.PASSWORD);
  }

  function updateSavedReports(nextReports) {
    setSavedReports((currentReports) => {
      const resolvedReports =
        typeof nextReports === "function" ? nextReports(currentReports) : nextReports;
      return Array.isArray(resolvedReports) ? resolvedReports : currentReports;
    });
  }

  function updateTrackerProgress(nextTrackerProgress) {
    setTrackerProgress((currentProgress) => {
      if (typeof nextTrackerProgress === "function") {
        return nextTrackerProgress(currentProgress);
      }
      return nextTrackerProgress || {};
    });
  }

  // ========== FIX: add this function ==========
  function handleOnboardingComplete(profile) {
    updateUserProfile(profile);
    // Ensure intro is marked as seen
    if (!appStateRef.current.hasSeenIntro) {
      updateHasSeenIntro(true);
    }
    // Directly go to results – no guard re-check needed
    goToScreen(SCREENS.RESULTS);
  }
  // ============================================

  return (
    <div className="app-shell">
      {isAuthenticated && currentScreen !== SCREENS.PASSWORD && (
        <NavBar
          currentScreen={currentScreen}
          onNavigate={goToScreen}
          onLogout={handleLogout}
        />
      )}

      <main className="app-main">
        {currentScreen === SCREENS.PASSWORD && (
          <PasswordGate
            setIsAuthenticated={handleAuthChange}
            setCurrentScreen={goToScreen}
          />
        )}

        {currentScreen === SCREENS.WELCOME && (
          <Welcome
            setCurrentScreen={goToScreen}
            userProfile={userProfile}
            selectedPath={selectedPath}
            savedReports={savedReports}
            trackerTasks={trackerData?.tasks || []}
            trackerData={trackerData}
            trackerProgress={trackerProgress}
            recommendedPaths={recommendedPaths}
            activeReportId={activeReportId}
            checkInData={checkInData}
          />
        )}

        {currentScreen === SCREENS.FORM && (
          <OnboardingForm
            // FIX: use onOnboardingComplete instead of setCurrentScreen + setUserProfile
            onOnboardingComplete={handleOnboardingComplete}
          />
        )}

        {currentScreen === SCREENS.RESULTS && (
          <PathResults
            userProfile={userProfile}
            pathScores={pathScores}
            setPathScores={setPathScores}
            recommendedPaths={recommendedPaths}
            setRecommendedPaths={updateRecommendedPaths}
            setCurrentScreen={goToScreen}
            selectedPath={selectedPath}
            setSelectedPath={updateSelectedPath}
          />
        )}

        {currentScreen === SCREENS.PATH_DIRECTORY && (
          <PathDirectory
            setCurrentScreen={goToScreen}
            selectedPath={selectedPath}
            setSelectedPath={updateSelectedPath}
          />
        )}

        {currentScreen === SCREENS.GUIDE_SELECT && (
          <GuideSelector
            guideType={guideType}
            setGuideType={setGuideType}
            setCurrentScreen={goToScreen}
          />
        )}

        {currentScreen === SCREENS.PROMPT && (
          <PromptGenerator
            userProfile={userProfile}
            recommendedPaths={recommendedPaths}
            selectedPath={selectedPath}
            guideType={guideType}
            generatedPrompt={generatedPrompt}
            setGeneratedPrompt={setGeneratedPrompt}
            setCurrentScreen={goToScreen}
          />
        )}

        {currentScreen === SCREENS.PASTE && (
          <PasteResult
            recommendedPaths={recommendedPaths}
            selectedPath={selectedPath}
            guideType={guideType}
            pastedOutput={pastedOutput}
            setPastedOutput={setPastedOutput}
            setCurrentScreen={goToScreen}
            savedReports={savedReports}
            setSavedReports={updateSavedReports}
            setActiveGuide={setActiveGuide}
            setActiveReportId={setActiveReportId}
            setTrackerData={updateTrackerData}
            setTrackerProgress={updateTrackerProgress}
          />
        )}

        {currentScreen === SCREENS.REPORTS && (
          <SavedReports
            setCurrentScreen={goToScreen}
            savedReports={savedReports}
            setSavedReports={updateSavedReports}
            activeReportId={activeReportId}
            setActiveReportId={setActiveReportId}
            setActiveGuide={setActiveGuide}
            setTrackerData={updateTrackerData}
            setTrackerProgress={updateTrackerProgress}
          />
        )}

        {currentScreen === SCREENS.TRACKER && (
          <Tracker
            setCurrentScreen={goToScreen}
            trackerData={trackerData}
            setTrackerData={updateTrackerData}
            trackerProgress={trackerProgress}
            setTrackerProgress={updateTrackerProgress}
            activeGuide={activeGuide}
            activeReportId={activeReportId}
          />
        )}

        {currentScreen === SCREENS.SETTINGS && (
          <Settings
            setCurrentScreen={goToScreen}
            setIsAuthenticated={handleAuthChange}
            onClearData={resetVektorApp}
          />
        )}

        {currentScreen === SCREENS.INTRO_LESSON && (
          <IntroLesson setCurrentScreen={goToScreen} />
        )}

        {currentScreen === SCREENS.INTRO_PROMPT && (
          <BeginnerIntroPrompt
            setCurrentScreen={goToScreen}
            setHasSeenIntro={updateHasSeenIntro}
          />
        )}
      </main>
    </div>
  );
}

export default App;