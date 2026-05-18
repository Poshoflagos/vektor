import { useState } from "react"
import { saveToStorage, STORAGE_KEYS } from "../logic/storage"

const STRENGTHS_OPTIONS = [
  { id: "writing",      label: "✍️ Writing / Explaining" },
  { id: "research",     label: "🔍 Researching / Finding Info" },
  { id: "community",    label: "🗣️ Community / Networking" },
  { id: "design",       label: "🎨 Design / Visuals" },
  { id: "coding",       label: "💻 Coding / Building" },
  { id: "trading",      label: "📈 Trading / Markets" },
  { id: "organizing",   label: "📋 Organizing / Project Management" },
  { id: "teaching",     label: "🎓 Teaching / Simplifying" },
  { id: "selling",      label: "💰 Selling / Persuading" },
  { id: "analyzing",    label: "📊 Analyzing / Data" },
  { id: "storytelling", label: "🎭 Storytelling / Content" },
  { id: "strategy",     label: "♟️ Strategy / Planning" },
  { id: "operations",   label: "⚙️ Operations / Systems" },
  { id: "languages",    label: "🌍 Multiple Languages" },
  { id: "notsure",      label: "🤷 Not Sure Yet" }
]

const LEARNING_STYLE_OPTIONS = [
  { id: "videos",   label: "🎥 Video tutorials — YouTube, online courses" },
  { id: "llm",      label: "🤖 AI-guided — Claude or ChatGPT as my tutor" },
  { id: "reading",  label: "📖 Reading — articles, docs, books" },
  { id: "building", label: "🔨 Building things — learn by doing" },
  { id: "tasks",    label: "✅ Checklists — give me structured tasks" },
  { id: "cohort",   label: "👥 Cohort courses — learning with other people" },
  { id: "mixed",    label: "🔀 Mixed — combine everything" }
]

function OnboardingForm({ setCurrentScreen, onOnboardingComplete }) {
  const [step, setStep] = useState(0)

  const [form, setForm] = useState({
    name: "",
    interest: "",
    experience: "",
    strengths: [],
    budget: "",
    hoursPerDay: 1,
    urgency: "",
    background: "",
    learningStyle: ""
  })

  const totalSteps = 9

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleStrength(id) {
    setForm(prev => {
      if (prev.strengths.includes(id)) {
        return {
          ...prev,
          strengths: prev.strengths.filter(strength => strength !== id)
        }
      }

      if (prev.strengths.length >= 3) return prev

      return {
        ...prev,
        strengths: [...prev.strengths, id]
      }
    })
  }

  function canProceed() {
    switch (step) {
      case 0:
        return form.name.trim().length > 0
      case 1:
        return form.interest !== ""
      case 2:
        return form.experience !== ""
      case 3:
        return form.strengths.length > 0
      case 4:
        return form.budget !== ""
      case 5:
        return form.hoursPerDay > 0
      case 6:
        return form.urgency !== ""
      case 7:
        return form.background.trim().length > 10
      case 8:
        return form.learningStyle !== ""
      default:
        return true
    }
  }

  function handleFinish() {
    const finalProfile = { ...form }

    saveToStorage(STORAGE_KEYS.USER_PROFILE, finalProfile)
    // Mark intro as seen in case it wasn't already
    if (!localStorage.getItem(STORAGE_KEYS.HAS_SEEN_INTRO)) {
      localStorage.setItem(STORAGE_KEYS.HAS_SEEN_INTRO, 'true');
    }
    // Call parent handler to update app state and navigate
    onOnboardingComplete(finalProfile)
  }

  const progress = Math.round((step / totalSteps) * 100)

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>

        <p style={styles.stepLabel}>Question {step + 1} of {totalSteps}</p>

        {step === 0 && (
          <div>
            <h2 style={styles.question}>What should we call you?</h2>

            <input
              style={styles.input}
              placeholder="Your name or nickname"
              value={form.name}
              onChange={event => updateField("name", event.target.value)}
            />
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={styles.question}>What are you interested in?</h2>

            {[
              { id: "ai", label: "🤖 Artificial Intelligence (AI)" },
              { id: "web3", label: "🌐 Web3 / Crypto / Blockchain" },
              { id: "both", label: "⚡ Both — I want it all" }
            ].map(option => (
              <button
                key={option.id}
                style={{
                  ...styles.optionBtn,
                  ...(form.interest === option.id ? styles.optionBtnActive : {})
                }}
                onClick={() => updateField("interest", option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={styles.question}>What is your current level?</h2>

            {[
              { id: "beginner", label: "🌱 Total Beginner — starting from zero" },
              { id: "some", label: "🌿 Some Exposure — tried a bit" },
              { id: "intermediate", label: "🌳 Intermediate — done some real work" },
              { id: "advanced", label: "🚀 Advanced — I know what I'm doing" }
            ].map(option => (
              <button
                key={option.id}
                style={{
                  ...styles.optionBtn,
                  ...(form.experience === option.id ? styles.optionBtnActive : {})
                }}
                onClick={() => updateField("experience", option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={styles.question}>What are your natural strengths?</h2>

            <p style={styles.hint}>
              Pick your top 3 —{" "}
              <span
                style={{
                  color: form.strengths.length === 3 ? "#00ff88" : "#666"
                }}
              >
                {form.strengths.length}/3 selected
              </span>
              {form.strengths.length === 3 && " ✓ Max reached"}
            </p>

            <div style={styles.checkGrid}>
              {STRENGTHS_OPTIONS.map(option => {
                const isSelected = form.strengths.includes(option.id)
                const isDisabled = !isSelected && form.strengths.length >= 3

                return (
                  <button
                    key={option.id}
                    style={{
                      ...styles.checkBtn,
                      ...(isSelected ? styles.checkBtnActive : {}),
                      ...(isDisabled ? styles.checkBtnDisabled : {})
                    }}
                    onClick={() => toggleStrength(option.id)}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={styles.question}>What is your budget preference?</h2>

            {[
              { id: "free", label: "🆓 Free only — no paid tools or courses" },
              { id: "paid", label: "💳 Paid is fine — I can invest" },
              { id: "mixed", label: "🔀 Mixed — free first, paid selectively" }
            ].map(option => (
              <button
                key={option.id}
                style={{
                  ...styles.optionBtn,
                  ...(form.budget === option.id ? styles.optionBtnActive : {})
                }}
                onClick={() => updateField("budget", option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 style={styles.question}>How many hours per day can you commit?</h2>
            <p style={styles.hint}>Be honest. 1 hour is fine.</p>

            <div style={{ textAlign: "center" }}>
              <span style={styles.hoursText}>{form.hoursPerDay}h</span>

              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={form.hoursPerDay}
                onChange={event =>
                  updateField("hoursPerDay", parseFloat(event.target.value))
                }
                style={styles.range}
              />

              <div style={styles.rangeLabels}>
                <span>0.5h</span>
                <span>10h</span>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h2 style={styles.question}>How urgently do you need income?</h2>

            {[
              { id: "very", label: "🔥 Very urgent — need money in 30-60 days" },
              { id: "soon", label: "⏳ Soon — within 3 months is fine" },
              { id: "longterm", label: "🌱 Long-term — I'm building, not rushing" }
            ].map(option => (
              <button
                key={option.id}
                style={{
                  ...styles.optionBtn,
                  ...(form.urgency === option.id ? styles.optionBtnActive : {})
                }}
                onClick={() => updateField("urgency", option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {step === 7 && (
          <div>
            <h2 style={styles.question}>Tell us about yourself</h2>

            <p style={styles.hint}>
              Skills, hobbies, school, work — anything relevant. More = better match.
            </p>

            <textarea
              style={styles.textarea}
              rows={5}
              placeholder="Example: I studied accounting, I write on Medium, I've been trading crypto casually..."
              value={form.background}
              onChange={event => updateField("background", event.target.value)}
            />

            <p
              style={{
                color: form.background.length > 10 ? "#00ff88" : "#666",
                fontSize: "12px"
              }}
            >
              {form.background.length} characters{" "}
              {form.background.length < 10 ? "(write more)" : "✓"}
            </p>
          </div>
        )}

        {step === 8 && (
          <div>
            <h2 style={styles.question}>How do you learn best?</h2>
            <p style={styles.hint}>This shapes how your entire guide is structured</p>

            {LEARNING_STYLE_OPTIONS.map(option => (
              <button
                key={option.id}
                style={{
                  ...styles.optionBtn,
                  ...(form.learningStyle === option.id
                    ? styles.optionBtnActive
                    : {})
                }}
                onClick={() => updateField("learningStyle", option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        <div style={styles.navRow}>
          {step > 0 && (
            <button
              style={styles.backBtn}
              onClick={() => setStep(previous => previous - 1)}
            >
              ← Back
            </button>
          )}

          {step < totalSteps - 1 ? (
            <button
              style={{
                ...styles.nextBtn,
                opacity: canProceed() ? 1 : 0.4
              }}
              onClick={() => canProceed() && setStep(previous => previous + 1)}
            >
              Next →
            </button>
          ) : (
            <button
              style={{
                ...styles.nextBtn,
                opacity: canProceed() ? 1 : 0.4
              }}
              onClick={() => canProceed() && handleFinish()}
            >
              Calculate My Paths ✓
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#050505",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Courier New', monospace",
    boxSizing: "border-box"
  },
  card: {
    background: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: "12px",
    padding: "40px",
    width: "100%",
    maxWidth: "520px",
    boxSizing: "border-box"
  },
  progressBar: {
    background: "#1a1a1a",
    borderRadius: "4px",
    height: "4px",
    marginBottom: "8px"
  },
  progressFill: {
    background: "#00ff88",
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.3s ease"
  },
  stepLabel: {
    color: "#444",
    fontSize: "12px",
    marginBottom: "32px",
    letterSpacing: "1px"
  },
  question: {
    color: "white",
    fontSize: "20px",
    marginBottom: "24px",
    lineHeight: "1.4"
  },
  hint: {
    color: "#666",
    fontSize: "12px",
    marginBottom: "16px",
    lineHeight: "1.5"
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
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    padding: "14px",
    background: "#0a0a0a",
    border: "1px solid #333",
    borderRadius: "6px",
    color: "white",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    lineHeight: "1.6"
  },
  optionBtn: {
    display: "block",
    width: "100%",
    padding: "14px 16px",
    background: "#0a0a0a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    color: "#aaa",
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "10px",
    textAlign: "left"
  },
  optionBtnActive: {
    border: "1px solid #00ff88",
    color: "#00ff88",
    background: "#001a0d"
  },
  checkGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px"
  },
  checkBtn: {
    padding: "12px",
    background: "#0a0a0a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    color: "#aaa",
    fontSize: "13px",
    cursor: "pointer",
    textAlign: "left"
  },
  checkBtnActive: {
    border: "1px solid #00ff88",
    color: "#00ff88",
    background: "#001a0d"
  },
  checkBtnDisabled: {
    opacity: 0.35,
    cursor: "not-allowed"
  },
  hoursText: {
    display: "block",
    fontSize: "48px",
    color: "#00ff88",
    fontWeight: "bold",
    marginBottom: "8px"
  },
  range: {
    width: "100%",
    marginTop: "16px",
    accentColor: "#00ff88"
  },
  rangeLabels: {
    display: "flex",
    justifyContent: "space-between",
    color: "#666",
    fontSize: "12px"
  },
  navRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "32px"
  },
  backBtn: {
    padding: "12px 18px",
    background: "transparent",
    border: "1px solid #333",
    borderRadius: "6px",
    color: "#888",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold"
  },
  nextBtn: {
    marginLeft: "auto",
    padding: "12px 18px",
    background: "#00ff88",
    border: "none",
    borderRadius: "6px",
    color: "#000",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold"
  }
}

export default OnboardingForm