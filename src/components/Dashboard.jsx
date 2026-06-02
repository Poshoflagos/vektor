// src/components/Dashboard.jsx
import { useEffect, useState } from "react";
import { getCloudSession, supabase } from "../logic/supabase";
import { pathways } from "../data/pathways";
import ProofHub from "./ProofHub";

export default function Dashboard({ setCurrentScreen }) {
  const [operatorName, setOperatorName] = useState("LOADING...");
  const [currentTime, setCurrentTime] = useState("");
  
  // Navigation State
  const [activeTrack, setActiveTrack] = useState(null); 
  
  // Execution Engine State
  const [activeIngestionTask, setActiveIngestionTask] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]); // Temporary local state for HUD

  useEffect(() => {
    let isMounted = true;
    const timer = setInterval(() => {
      if (isMounted) setCurrentTime(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }, 1000);

    async function fetchOperatorIdentity() {
      try {
        const { session, user } = await getCloudSession();
        if (user) {
          const { data } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
          if (isMounted) setOperatorName(data?.username || "UNKNOWN_OPERATOR");
        }
      } catch (err) {
        if (isMounted) setOperatorName("SYS_ERR");
      }
    }
    fetchOperatorIdentity();

    return () => { isMounted = false; clearInterval(timer); };
  }, []);

  const currentPathway = activeTrack ? pathways[activeTrack] : null;

  return (
    <>
      <style>{`
        .v2-dashboard { max-width: 1000px; margin: 0 auto; padding: 2rem 1rem 5rem 1rem; font-family: 'SF Mono', monospace; color: #F4F7FB; }
        .v2-dash-nav { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 2rem; }
        .v2-dash-logo { font-size: 1.25rem; font-weight: bold; letter-spacing: 2px; color: #fff; }
        .v2-nav-links button { background: transparent; border: none; color: #A7B0C0; font-family: inherit; font-size: 0.8rem; cursor: pointer; text-transform: uppercase; transition: color 0.2s; }
        .v2-nav-links button:hover { color: #fff; }

        .v2-hero-panel { background: #0B0F19; border: 1px solid rgba(255,255,255,0.05); padding: 2rem; margin-bottom: 3rem; position: relative; border-left: 4px solid #3DDC97; }
        .v2-sys-status { font-size: 0.7rem; color: #3DDC97; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem; display: inline-block; }
        .v2-hero-title { font-size: 1.5rem; margin: 0 0 0.5rem 0; color: #fff; text-transform: uppercase; }
        .v2-hero-subtitle { color: #A7B0C0; margin: 0; font-size: 0.85rem; }
        .v2-timestamp { position: absolute; top: 2rem; right: 2rem; font-size: 0.75rem; color: #A7B0C0; opacity: 0.5; }

        .v2-section-title { font-size: 0.85rem; color: #A7B0C0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem; }
        .v2-section-title::after { content: ''; flex-grow: 1; height: 1px; background: rgba(255,255,255,0.05); }

        .v2-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
        .v2-card { background: #05070A; border: 1px solid rgba(255,255,255,0.05); padding: 2rem; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; }
        .v2-card:hover { border-color: #3DDC97; background: #0B0F19; }
        .v2-card-id { font-size: 0.7rem; color: #A7B0C0; margin-bottom: 1rem; letter-spacing: 1px; }
        .v2-card-title { font-size: 1rem; color: #fff; margin: 0 0 1rem 0; text-transform: uppercase; }
        .v2-card-desc { color: #A7B0C0; font-size: 0.8rem; line-height: 1.6; flex-grow: 1; margin: 0 0 2rem 0; }
        .v2-card-action { color: #3DDC97; font-size: 0.75rem; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }

        .v2-task-list { display: flex; flex-direction: column; gap: 1rem; }
        .v2-task-item { background: #0B0F19; border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; }
        .v2-task-meta h4 { color: #fff; margin: 0 0 0.5rem 0; font-size: 0.95rem; text-transform: uppercase; }
        .v2-task-meta p { color: #A7B0C0; margin: 0 0 1rem 0; font-size: 0.8rem; line-height: 1.5; max-width: 600px; }
        .v2-badge { font-size: 0.65rem; border: 1px solid rgba(255,255,255,0.2); color: #A7B0C0; padding: 0.2rem 0.5rem; display: inline-block; letter-spacing: 1px; }
        
        .v2-btn-execute { background: #3DDC97; color: #05070A; border: none; padding: 0.6rem 1.5rem; font-weight: bold; cursor: pointer; font-family: inherit; font-size: 0.75rem; text-transform: uppercase; transition: 0.2s; }
        .v2-btn-execute:hover:not(:disabled) { background: #fff; }
        .v2-btn-execute:disabled { background: #1a4a35; color: #888; cursor: not-allowed; }
      `}</style>

      <div className="v2-dashboard">
        <nav className="v2-dash-nav">
          <div className="v2-dash-logo">VEKTOR █</div>
          <div className="v2-nav-links">
            <button onClick={() => setCurrentScreen("settings")}>[ SETTINGS ]</button>
          </div>
        </nav>

        <section className="v2-hero-panel">
          <div className="v2-sys-status">[ SYS.ACTIVE ]</div>
          <h1 className="v2-hero-title">OPERATOR {operatorName}</h1>
          <p className="v2-hero-subtitle">
            {activeTrack ? `EXECUTING: ${currentPathway.title}` : "SELECT AN EXECUTION TRACK."}
          </p>
          <div className="v2-timestamp">{currentTime}</div>
        </section>

        {!activeTrack ? (
          <>
            <h2 className="v2-section-title">EXECUTION ARTERIES</h2>
            <section className="v2-grid">
              {Object.keys(pathways).map((key) => (
                <div key={key} className="v2-card" onClick={() => setActiveTrack(key)}>
                  <div className="v2-card-id">{pathways[key].id}</div>
                  <h3 className="v2-card-title">{pathways[key].title}</h3>
                  <p className="v2-card-desc">{pathways[key].description}</p>
                  <div className="v2-card-action"><span>INITIALIZE</span><span>››</span></div>
                </div>
              ))}
            </section>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="v2-section-title" style={{ margin: 0, flexGrow: 0 }}>TASK LEDGER</h2>
              <button 
                onClick={() => setActiveTrack(null)} 
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#A7B0C0', padding: '0.4rem 1rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.7rem' }}
              >
                [ ABORT TO GRID ]
              </button>
            </div>
            
            <section className="v2-task-list">
              {currentPathway.tasks.map((task) => {
                const isCompleted = completedTasks.includes(task.id);
                return (
                  <div key={task.id} className="v2-task-item" style={{ borderColor: isCompleted ? '#3DDC97' : 'rgba(255,255,255,0.05)' }}>
                    <div className="v2-task-meta">
                      <h4>{task.title}</h4>
                      <p>{task.desc}</p>
                      <span className="v2-badge" style={{ color: isCompleted ? '#3DDC97' : '#A7B0C0', borderColor: isCompleted ? '#3DDC97' : 'rgba(255,255,255,0.2)' }}>
                        PROOF: {task.proof_type}
                      </span>
                    </div>
                    <button 
                      className="v2-btn-execute" 
                      onClick={() => setActiveIngestionTask(task)}
                      disabled={isCompleted}
                      style={{ opacity: isCompleted ? 0.5 : 1 }}
                    >
                      {isCompleted ? "[ VERIFIED ]" : "EXECUTE"}
                    </button>
                  </div>
                );
              })}
            </section>
          </>
        )}
      </div>

      {/* The Ingestion Engine Overlay */}
      {activeIngestionTask && (
        <ProofHub 
          task={activeIngestionTask} 
          onClose={() => setActiveIngestionTask(null)}
          onInject={(taskId, payload) => {
            console.log(`[ SYS ] TASK ${taskId} PROOF INJECTED:`, payload);
            setCompletedTasks([...completedTasks, taskId]); // Updates HUD instantly
            setActiveIngestionTask(null); // Closes modal
          }}
        />
      )}
    </>
  );
}