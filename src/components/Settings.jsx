// src/components/Settings.jsx
import { useEffect, useState } from "react";
import { getCloudSession, saveProfileCloud, supabase, signOutCloud } from "../logic/supabase";

export default function Settings({
  setCurrentScreen,
  setIsAuthenticated,
  onClearData,
}) {
  const [userEmail, setUserEmail] = useState("");
  const [operatorName, setOperatorName] = useState("");
  
  // Wipe Data State
  const [isWiping, setIsWiping] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);

  // Terminate Account State
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Change Password State
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ type: "idle", message: "" });

  // Fetch secure user data on load
  useEffect(() => {
    async function fetchOperatorIdentity() {
      const { user } = await getCloudSession();
      if (user) {
        setUserEmail(user.email);
        
        const { data } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();
          
        if (data) setOperatorName(data.username);
      }
    }
    fetchOperatorIdentity();
  }, []);

  const maskedEmail = userEmail
    ? `${userEmail.slice(0, 2)}***@${userEmail.split("@")[1]}`
    : "Loading secure data...";

  // 1. Change Password Flow
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

  // 2. Soft Reset Flow (Erase Data)
  async function handleCloudWipe() {
    if (!confirmWipe) {
      setConfirmWipe(true);
      setConfirmDelete(false); // Close the other prompt if open
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

  // 3. True Account Deletion Flow
  async function handleDeleteAccount() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setConfirmWipe(false); // Close the other prompt if open
      return;
    }

    setIsDeleting(true);
    const { user } = await getCloudSession();

    if (user) {
      try {
        // Calls the secure Postgres function we created to delete the auth user
        await supabase.rpc("delete_user");
      } catch (error) {
        console.error("Account deletion failed:", error);
      }
    }

    // Nuke the local app state and boot them out
    await signOutCloud();
    if (typeof onClearData === "function") onClearData();
    if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
  }

  // 4. Logout Flow
  async function handleLocalLogout() {
    await signOutCloud();
    if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
  }

  return (
    <section className="page-container stack" aria-label="System Settings">
      <header className="page-header">
        <p className="page-kicker">System Configuration</p>
        <div className="row-between">
          <div className="row">
            <h1>Settings</h1>
            <span className="badge active">V2 Private Alpha</span>
          </div>
          <button type="button" onClick={() => setCurrentScreen("welcome")}>
            ← Dashboard
          </button>
        </div>
      </header>

      <section className="card stack">
        <h2>Operator Identity</h2>
        <div className="card-grid">
          <div className="dashboard-card stack">
            <p className="page-kicker">Operator Name</p>
            <h3>{operatorName || "Loading..."}</h3>
          </div>
          <div className="dashboard-card stack">
            <p className="page-kicker">Secure Email</p>
            <h3>{maskedEmail}</h3>
          </div>
        </div>
        <div className="notice-card active">
          <div className="row-between">
            <strong>Network Status</strong>
            <span className="badge active">Connected to VEKTÖR Cloud</span>
          </div>
        </div>
      </section>

      <section className="card stack">
        <h2>Security & Authentication</h2>
        <p className="muted">Update your cloud access credentials.</p>
        
        <form onSubmit={handleChangePassword} className="stack">
          <div className="row-between">
            <input
              type="password"
              placeholder="Enter new password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isUpdatingPassword}
              style={{ flex: 1, maxWidth: '300px' }}
            />
            <button
              type="submit"
              className="primary"
              disabled={isUpdatingPassword || !newPassword}
            >
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
          
          {passwordStatus.message && (
            <div className={`status-message ${passwordStatus.type === "error" ? "error" : "success"}`}>
              {passwordStatus.message}
            </div>
          )}
        </form>
      </section>

      <section className="card stack">
        <p className="page-kicker danger">Danger Zone</p>
        <h2>System Reset & Termination</h2>
        <p className="muted">
          Warning: These actions are permanent. Erasing data keeps your account alive for future use. Terminating your account destroys all data and revokes your Alpha access permanently.
        </p>

        <div className="actions">
          {/* ERASE DATA BUTTON */}
          {!confirmWipe ? (
            <button type="button" className="secondary" onClick={() => setConfirmWipe(true)} disabled={confirmDelete}>
              Erase Cloud Data
            </button>
          ) : (
            <div className="status-message warning stack" style={{ width: '100%' }}>
              <strong>Erase all saved reports and profile data?</strong>
              <div className="row">
                <button type="button" className="secondary" onClick={() => setConfirmWipe(false)} disabled={isWiping}>
                  Cancel
                </button>
                <button type="button" className="danger" onClick={handleCloudWipe} disabled={isWiping}>
                  {isWiping ? "Erasing..." : "Yes, Erase Data"}
                </button>
              </div>
            </div>
          )}

          {/* TERMINATE ACCOUNT BUTTON */}
          {!confirmDelete ? (
            <button type="button" className="danger" onClick={() => setConfirmDelete(true)} disabled={confirmWipe}>
              Terminate Account
            </button>
          ) : (
            <div className="status-message error stack" style={{ width: '100%' }}>
              <strong>Terminate account and destroy all records? This cannot be undone.</strong>
              <div className="row">
                <button type="button" className="secondary" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
                  Cancel
                </button>
                <button type="button" className="danger" onClick={handleDeleteAccount} disabled={isDeleting}>
                  {isDeleting ? "Terminating..." : "Yes, Terminate Account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="card stack">
        <h2>Session Management</h2>
        <div className="actions">
          <button type="button" className="secondary" onClick={handleLocalLogout}>
            Disconnect & Logout
          </button>
        </div>
      </section>
    </section>
  );
}