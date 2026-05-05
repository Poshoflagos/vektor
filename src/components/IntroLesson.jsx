// IntroLesson.jsx
// Beginner education screen for VEKTÖR v1

function IntroLesson({ setCurrentScreen, onIntroComplete = null }) {
  function continueToResults() {
    try {
      localStorage.setItem("vektor_hasSeenIntro", JSON.stringify(true))
    } catch (error) {
      console.warn("localStorage unavailable:", error)
    }

    if (onIntroComplete) {
      onIntroComplete()
    }

    setCurrentScreen("results")
  }

  function goHome() {
    setCurrentScreen("welcome")
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <p style={styles.kicker}>BEGINNER INTRO</p>
          <h1 style={styles.title}>Before You Choose a Path</h1>
          <p style={styles.subtitle}>
            A simple guide to what AI is, what Web3 is, why it matters in 2026,
            and why understanding both can give you an edge.
          </p>
        </div>

        <Section title="What VEKTÖR Is Helping You Do">
          VEKTÖR helps you find a practical direction inside AI, Web3, or the
          intersection of both. It is not just trying to give you a random career
          label. It is trying to help you understand where you fit, what to learn,
          what to build, and how to move toward useful proof of work.
        </Section>

        <Section title="What AI Is">
          AI means Artificial Intelligence. In simple terms, AI is software that
          can help humans think, create, analyse, automate, and make decisions faster.
          <br />
          <br />
          AI can help with writing, research, coding, design, video creation,
          customer support, data analysis, workflow automation, and business
          operations. The real opportunity is not just using AI tools. The real
          opportunity is learning how to use AI to solve real problems.
        </Section>

        <Section title="What Web3 Is">
          Web3 is the part of the internet built around blockchains, crypto assets,
          wallets, smart contracts, digital ownership, and decentralized networks.
          <br />
          <br />
          It includes areas like DeFi, NFTs, DAOs, crypto trading, on-chain data,
          smart contract security, wallets, token communities, and decentralized
          applications.
          <br />
          <br />
          In simple terms, Web3 changes how people own, move, verify, and coordinate
          value online.
        </Section>

        <Section title="Why 2026 Is Still Early">
          In 2026, AI and Web3 are no longer hidden underground trends. Big companies,
          startups, governments, creators, developers, traders, and online communities
          are already paying attention.
          <br />
          <br />
          But that does not mean the opportunity is gone.
          <br />
          <br />
          It means the market has moved from the “nobody knows what this is” stage
          into the “serious people are starting to build with it” stage.
          <br />
          <br />
          That is usually where real careers begin.
          <br />
          <br />
          The early internet had people building websites before most businesses
          understood why websites mattered. The early mobile era had people building
          apps before every company knew it needed one. The early creator economy
          had people learning content before personal brands became normal.
          <br />
          <br />
          AI and Web3 are at a similar transition point. The tools exist now. The
          communities exist now. The use cases are becoming clearer. But the number
          of people who can explain, build, research, design, sell, secure, or
          operate inside these markets is still small compared to where demand could go.
        </Section>

        <Section title="Why It Is Important to Understand This">
          You do not need to be the first person in the world. You need to be early
          enough to understand the language, build proof of work, and become useful
          before the space becomes crowded with polished professionals.
          <br />
          <br />
          Being early does not remove the need for skill. It gives you time to build
          skill before the bar gets much higher.
        </Section>

        <Section title="Opportunities in AI">
          AI creates opportunities for people who can help others use intelligence,
          automation, and tools more effectively.
          <br />
          <br />
          Examples include AI content creation, prompt engineering, AI workflow
          consulting, AI automation, AI research, AI tool building, AI education,
          AI operations, AI design support, and AI-assisted business services.
        </Section>

        <Section title="Opportunities in Web3">
          Web3 creates opportunities for people who understand crypto networks,
          online communities, digital ownership, and on-chain activity.
          <br />
          <br />
          Examples include Web3 content writing, community management, DeFi research,
          on-chain analysis, smart contract security, protocol research, ecosystem
          growth, trading research, and wallet behaviour analysis.
        </Section>

        <Section title="Why AI x Web3 Creates Even More Opportunity">
          AI and Web3 solve different problems, but they can strengthen each other.
          <br />
          <br />
          AI helps people think, create, analyse, and automate. Web3 helps people
          own, verify, coordinate, and transact online.
          <br />
          <br />
          When both meet, new categories appear: AI agents using wallets, autonomous
          on-chain actions, AI-powered trading research, AI-assisted smart contract
          auditing, decentralized AI infrastructure, crypto data analysis, and new
          creator/community economies.
          <br />
          <br />
          This does not mean every AI x Web3 idea will work. Many will fail. But
          the intersection matters because it combines two major technology shifts
          happening at the same time.
        </Section>

        <Section title="Where These Markets Sit Compared to Older Tech">
          The internet created websites, search engines, e-commerce, online media,
          and social networks.
          <br />
          <br />
          Mobile created apps, ride-hailing, food delivery, mobile payments, and
          always-online consumer behavior.
          <br />
          <br />
          Cloud created modern software companies, remote work tools, SaaS products,
          and scalable internet businesses.
          <br />
          <br />
          AI and Web3 are still being shaped. That means the best roles, tools,
          business models, and career paths are not fully settled yet. This creates
          confusion, but it also creates room for learners, builders, researchers,
          educators, and operators to position early.
        </Section>

        <Section title="What Beginners Should Avoid">
          Early does not mean easy.
          <br />
          <br />
          Most people who enter AI or Web3 will waste time chasing hype, tools,
          coins, trends, or fake shortcuts.
          <br />
          <br />
          The advantage belongs to people who do three things:
          <br />
          <br />
          1. Understand the technology well enough to explain it simply.
          <br />
          2. Build visible proof of work.
          <br />
          3. Position themselves around real problems people will pay to solve.
        </Section>

        <div style={styles.truthBox}>
          <h2 style={styles.truthTitle}>The Real Message</h2>
          <p style={styles.truthText}>
            You are not late. You are not guaranteed anything. You have a window.
            Use it properly.
          </p>
        </div>

        <div style={styles.buttonRow}>
          <button onClick={goHome} style={styles.secondaryButton}>
            Back Home
          </button>

          <button onClick={continueToResults} style={styles.primaryButton}>
            Continue to My Path Results →
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.sectionText}>{children}</div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#fff",
    fontFamily: "'Courier New', monospace",
    padding: "86px 20px 70px",
    boxSizing: "border-box"
  },
  container: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto"
  },
  header: {
    marginBottom: "28px"
  },
  kicker: {
    color: "#00ff88",
    fontSize: "12px",
    letterSpacing: "2px",
    margin: "0 0 10px"
  },
  title: {
    color: "#fff",
    fontSize: "36px",
    lineHeight: "1.2",
    margin: "0 0 12px"
  },
  subtitle: {
    color: "#888",
    fontSize: "14px",
    lineHeight: "1.7",
    maxWidth: "720px",
    margin: 0
  },
  section: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "12px",
    padding: "22px",
    marginBottom: "16px"
  },
  sectionTitle: {
    color: "#00ff88",
    fontSize: "18px",
    margin: "0 0 12px",
    lineHeight: "1.4"
  },
  sectionText: {
    color: "#aaa",
    fontSize: "14px",
    lineHeight: "1.8",
    margin: 0
  },
  truthBox: {
    background: "#001a0d",
    border: "1px solid #00ff88",
    borderRadius: "12px",
    padding: "24px",
    marginTop: "24px",
    marginBottom: "24px"
  },
  truthTitle: {
    color: "#00ff88",
    fontSize: "18px",
    margin: "0 0 10px"
  },
  truthText: {
    color: "#fff",
    fontSize: "18px",
    lineHeight: "1.7",
    margin: 0,
    fontWeight: "bold"
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "space-between",
    flexWrap: "wrap"
  },
  primaryButton: {
    background: "#00ff88",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    padding: "14px 18px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    flex: "1",
    minWidth: "240px"
  },
  secondaryButton: {
    background: "transparent",
    color: "#888",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "14px 18px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    flex: "1",
    minWidth: "160px"
  }
}

export default IntroLesson