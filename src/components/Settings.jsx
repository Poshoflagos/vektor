// src/components/Settings.jsx
import { useEffect, useState } from "react";
import { getCloudSession, saveProfileCloud, supabase, signOutCloud } from "../logic/supabase";

export default function Settings({
  setCurrentScreen,
  setIsAuthenticated,
  onClearData,
}) {
  // --- EXISTING STATE ---
  const [userEmail, setUserEmail] = useState("");
  const [operatorName, setOperatorName] = useState("");
  
  const [isWiping, setIsWiping] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ type: "idle", message: "" });

  // --- NEW V2 IDENTITY STATE ---
  const [identity, setIdentity] = useState({ x_handle: '', github_handle: '', bio: '' });
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const [identityStatusMsg, setIdentityStatusMsg] = useState('[ AWAITING INPUT ]');

  // Fetch secure user data on load (MERGED)
  useEffect(() => {
    let isMounted = true;

    async function fetchOperatorIdentity() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          if (isMounted) setUserEmail("ERROR: No active session");
          return;
        }

        if (isMounted) setUserEmail(user.email);
        
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("username, x_handle, github_handle, bio")
          .eq("id", user.id)
          .maybeSingle();
          
        if (isMounted) {
          if (data) {
            setOperatorName(data.username || "UNKNOWN_OPERATOR");
            setIdentity({
              x_handle: data.x_handle || '',
              github_handle: data.github_handle || '',
              bio: data.bio || ''
            });
          } else {
            setOperatorName("UNKNOWN_OPERATOR"); 
          }
        }
      } catch (err) {
        console.error("Identity fetch failed:", err);
        if (isMounted) setOperatorName("SYSTEM_ERROR");
      }
    }

    fetchOperatorIdentity();

    return () => { isMounted = false; };
  }, []);

  const maskedEmail = userEmail && !userEmail.includes("ERROR")
    ? `${userEmail.slice(0, 2)}***@${userEmail.split("@")[1]}`
    : userEmail || "Loading...";

  // --- NEW V2 IDENTITY HANDLERS ---
  const handleIdentityChange = (e) => {
    setIdentity({ ...identity, [e.target.name]: e.target.value });
    setIdentityStatusMsg('[ UNSAVED CHANGES ]');
  };

  const handleSaveIdentity = async () => {
    setIsSavingIdentity(true);
    setIdentityStatusMsg('[ SYNCING TO CLOUD... ]');
    
    try {
      const { user } = await getCloudSession();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            x_handle: identity.x_handle,
            github_handle: identity.github_handle,
            bio: identity.bio
          })
          .eq('id', user.id);

        if (error) throw error;
        setIdentityStatusMsg('[ SYS.STATUS: IDENTITY SECURED ]');
      }
    } catch (err) {
      console.error(err);
      setIdentityStatusMsg('[ SYS.ERR: SYNC FAILED ]');
    } finally {
      setIsSavingIdentity(false);
    }
  };

  // --- EXISTING HANDLERS ---
  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    setIsUpdatingPassword(true);
    setPasswordStatus({ type: "info", message: "Updating security protocols..." });
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordStatus({ type: "error", message: error.message });
    } else {
      setPasswordStatus({ type: "success", message: "Password successfully updated." });
      setNewPassword("");
    }
    setIsUpdatingPassword(false);
  }

  async function handleCloudWipe() {
    if (!confirmWipe) {
      setConfirmWipe(true);
      setConfirmDelete(false);
      return;
    }
    setIsWiping(true);
    const { user } = await getCloudSession();
    if (user) {
      try {
        await supabase.from("reports").delete().eq("user_id", user.id);
        await saveProfileCloud(user.id, {
          operator_profile: null,
          recommended_paths: null,
          selected_path: null,
          tracker_data: null,
          has_seen_intro: false,
        });
      } catch (error) {
        console.error("Cloud wipe failed:", error);
      }
    }
    if (typeof onClearData === "function") onClearData();
    setIsWiping(false);
    setConfirmWipe(false);
  }

  async function handleDeleteAccount() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setConfirmWipe(false);
      return;
    }
    setIsDeleting(true);
    const { user } = await getCloudSession();
    if (user) {
      try {
        await supabase.rpc("delete_user");
      } catch (error) {
        console.error("Account deletion failed:", error);
      }
    }
    await signOutCloud();
    if (typeof onClearData === "function") onClearData();
    if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
  }

  async function handleLocalLogout() {
    await signOutCloud();
    if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
  }

  return (
    <>
      <style>{`
        .v2-settings-wrapper { max-width: 800px; margin: 0 auto; padding: 2rem 1rem 5rem 1rem; font-family: 'SF Mono', monospace; color: #F4F7FB; }
        .v2-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 2rem; }
        .v2-header h1 { margin: 0; font-size: 1.25rem; color: #fff; font-weight: bold; letter-spacing: 2px; }
        .v2-btn-back { background: transparent; color: #A7B0C0; border: none; font-size: 0.8rem; cursor: pointer; font-family: inherit; text-transform: uppercase; transition: color 0.2s; }
        .v2-btn-back:hover { color: #fff; }
        
        .v2-panel { background: #0B0F19; border: 1px solid rgba(255,255,255,0.05); padding: 2rem; margin-bottom: 2rem; position: relative; }
        .v2-panel-title { font-size: 1rem; color: #fff; text-transform: uppercase; margin: 0 0 1.5rem 0; display: flex; justify-content: space-between; align-items: center; }
        .v2-sys-status { font-size: 0.7rem; color: #3DDC97; letter-spacing: 1px; }

        .v2-form-group { margin-bottom: 1.5rem; }
        .v2-label { display: block; font-size: 0.75rem; color: #A7B0C0; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px; }
        
        .v2-input { width: 100%; background: #05070A; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem 1rem; font-family: inherit; font-size: 0.85rem; transition: border-color 0.2s; }
        .v2-input:focus { outline: none; border-color: #3DDC97; }
        
        .v2-textarea { width: 100%; background: #05070A; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem 1rem; font-family: inherit; font-size: 0.85rem; min-height: 100px; resize: vertical; transition: border-color 0.2s; }
        .v2-textarea:focus { outline: none; border-color: #3DDC97; }

        .v2-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
        .v2-data-box { background: #05070A; border: 1px solid rgba(255,255,255,0.05); padding: 1rem; }
        .v2-data-label { font-size: 0.7rem; color: #3DDC97; text-transform: uppercase; margin-bottom: 0.5rem; display: block; }
        .v2-data-value { font-size: 1rem; color: #fff; margin: 0; font-weight: bold; }
        
        .v2-btn-row { display: flex; justify-content: flex-end; align-items: center; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); }
        .v2-btn-primary { background: #3DDC97; color: #05070A; border: none; padding: 0.75rem 2rem; font-weight: bold; cursor: pointer; font-family: inherit; font-size: 0.75rem; text-transform: uppercase; transition: background 0.2s; }
        .v2-btn-primary:hover:not(:disabled) { background: #fff; }
        .v2-btn-primary:disabled { background: #1a4a35; color: #888; cursor: not-allowed; }
        
        .v2-btn-danger { background: transparent; color: #FF5C7A; border: 1px solid rgba(255,92,122,0.3); padding: 0.75rem 1.5rem; cursor: pointer; font-family: inherit; font-size: 0.75rem; text-transform: uppercase; transition: all 0.2s; }
        .v2-btn-danger:hover:not(:disabled) { background: rgba(255,92,122,0.1); border-color: #FF5C7A; }
        .v2-btn-danger-solid { background: #FF5C7A; color: #fff; border: none; padding: 0.75rem 1.5rem; font-weight: bold; cursor: pointer; font-family: inherit; font-size: 0.75rem; text-transform: uppercase; }
        
        .v2-alert-box { background: rgba(255,92,122,0.05); border-left: 3px solid #FF5C7A; padding: 1rem; margin-top: 1rem; }
        .v2-alert-box p { color: #FF5C7A; margin: 0 0 1rem 0; font-size: 0.85rem; text-transform: uppercase; }
        
        @media (max-width: 600px) { .v2-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <div className="v2-settings-wrapper">
        <header className="v2-header">
          <h1>VEKTOR █</h1>
          <button className="v2-btn-back" onClick={() => setCurrentScreen("dashboard")}>[ RETURN TO DASHBOARD ]</button>
        </header>

        <section className="v2-panel">
          <h2 className="v2-panel-title">SYSTEM CLASSIFICATION</h2>
          <div className="v2-grid-2">
            <div className="v2-data-box">
              <span className="v2-data-label">OPERATOR ID</span>
              <p className="v2-data-value">{operatorName}</p>
            </div>
            <div className="v2-data-box">
              <span className="v2-data-label">SECURE COMM LINK</span>
              <p className="v2-data-value">{maskedEmail}</p>
            </div>
          </div>
        </section>

        <section className="v2-panel">
          <h2 className="v2-panel-title">
            PUBLIC LEDGER IDENTITY
            <span className="v2-sys-status" style={{ color: identityStatusMsg.includes('ERR') ? '#FF5C7A' : '#3DDC97' }}>
              {identityStatusMsg}
            </span>
          </h2>
          
          <div className="v2-form-group">
            <label className="v2-label">X / TWITTER HANDLE</label>
            <input 
              type="text" 
              name="x_handle"
              className="v2-input" 
              placeholder="@username"
              value={identity.x_handle}
              onChange={handleIdentityChange}
            />
          </div>

          <div className="v2-form-group">
            <label className="v2-label">GITHUB HANDLE</label>
            <input 
              type="text" 
              name="github_handle"
              className="v2-input" 
              placeholder="username"
              value={identity.github_handle}
              onChange={handleIdentityChange}
            />
          </div>

          <div className="v2-form-group">
            <label className="v2-label">OPERATOR BIO (TECHNICAL CLASSIFICATION)</label>
            <textarea 
              name="bio"
              className="v2-textarea" 
              placeholder="e.g., DeFi Researcher | Smart Contract Analyst | Protocol Architect"
              value={identity.bio}
              onChange={handleIdentityChange}
            />
          </div>

          <div className="v2-btn-row">
            <button className="v2-btn-primary" onClick={handleSaveIdentity} disabled={isSavingIdentity}>
              {isSavingIdentity ? "[ SYNCING... ]" : "SAVE IDENTITY"}
            </button>
          </div>
        </section>

        <section className="v2-panel">
          <h2 className="v2-panel-title">SECURITY PROTOCOLS</h2>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              type="password"
              className="v2-input"
              style={{ flexGrow: 1, maxWidth: '400px' }}
              placeholder="Enter new master password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isUpdatingPassword}
            />
            <button type="submit" className="v2-btn-primary" disabled={isUpdatingPassword || !newPassword}>
              {isUpdatingPassword ? "UPDATING..." : "OVERRIDE PASSWORD"}
            </button>
          </form>
          {passwordStatus.message && (
            <div style={{ marginTop: '1rem', color: passwordStatus.type === 'error' ? '#FF5C7A' : '#3DDC97', fontSize: '0.85rem' }}>
              [ SYS: {passwordStatus.message.toUpperCase()} ]
            </div>
          )}
        </section>

        <section className="v2-panel" style={{ borderColor: 'rgba(255,92,122,0.2)' }}>
          <h2 className="v2-panel-title" style={{ color: '#FF5C7A' }}>DANGER ZONE</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            
            {!confirmWipe ? (
              <button type="button" className="v2-btn-danger" onClick={() => setConfirmWipe(true)} disabled={confirmDelete}>ERASE CLOUD DATA</button>
            ) : (
              <div className="v2-alert-box" style={{ width: '100%' }}>
                <p>ERASE ALL SAVED REPORTS AND PROFILE DATA? THIS CANNOT BE UNDONE.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className="v2-btn-danger" onClick={() => setConfirmWipe(false)} disabled={isWiping}>ABORT</button>
                  <button type="button" className="v2-btn-danger-solid" onClick={handleCloudWipe} disabled={isWiping}>{isWiping ? "ERASING..." : "CONFIRM WIPE"}</button>
                </div>
              </div>
            )}

            {!confirmDelete ? (
              <button type="button" className="v2-btn-danger" onClick={() => setConfirmDelete(true)} disabled={confirmWipe}>TERMINATE ACCOUNT</button>
            ) : (
              <div className="v2-alert-box" style={{ width: '100%' }}>
                <p>DESTROY ALL RECORDS AND TERMINATE ACCESS? THIS IS PERMANENT.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className="v2-btn-danger" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>ABORT</button>
                  <button type="button" className="v2-btn-danger-solid" onClick={handleDeleteAccount} disabled={isDeleting}>{isDeleting ? "TERMINATING..." : "CONFIRM TERMINATION"}</button>
                </div>
              </div>
            )}

          </div>
        </section>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button type="button" className="v2-btn-back" onClick={handleLocalLogout}>[ DISCONNECT & LOGOUT ]</button>
        </div>

      </div>
    </>
  );
}