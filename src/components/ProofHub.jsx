// src/components/ProofHub.jsx
import { useState } from 'react';
import { supabase, addProofLinkCloud, updateTrackerTaskCloud } from '../logic/supabase';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'video/mp4'];

export default function ProofHub({ task, onClose, onInject }) {
  const [payload, setPayload] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setErrorMsg('[ ERR: INVALID FILE TYPE. USE PNG, JPEG, WEBP, OR MP4. ]');
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMsg('[ ERR: FILE EXCEEDS 50MB LIMIT. ]');
      return;
    }

    setFile(selectedFile);
    setErrorMsg("");
  };

  const handleExecute = async () => {
    if (!payload && task.proof_type !== 'VISUAL') return;
    if (task.proof_type === 'VISUAL' && !file) {
      setErrorMsg('[ ERR: NO FILE SELECTED. ]');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg("");
    setUploadProgress(0);
    
    try {
      let finalPayload = payload;

      // 1. Get authenticated user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error("Authentication required.");

      const userId = authData.user.id;

      // 2. Handle Visual Proof Upload
      if (task.proof_type === 'VISUAL' && file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${task.id}_${Date.now()}.${fileExt}`;
        
        setUploadProgress(25);
        
        const { error: uploadError } = await supabase.storage
          .from('proof_vault')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;

        setUploadProgress(75);

        const { data: publicUrlData } = supabase.storage
          .from('proof_vault')
          .getPublicUrl(filePath);
          
        finalPayload = publicUrlData.publicUrl;
        setUploadProgress(100);
      }

      // 3. Write to the Operator's Ledger
      // addProofLinkCloud(userId, pathId, url, taskId)
      await addProofLinkCloud(userId, task.pathId || 'general', finalPayload, task.id);
      
      // 4. Mark task as completed with proof link
      await updateTrackerTaskCloud(task.id, { 
        completed: true, 
        proof_link: finalPayload 
      });
      
      // 5. Update local state via parent
      onInject(task.id, finalPayload);
      onClose();
      
    } catch (error) {
      console.error("[ SYS ] Proof Ingestion Error:", error);
      setErrorMsg(`[ ERR: ${error.message.toUpperCase()} ]`);
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProofLabel = () => {
    switch (task.proof_type) {
      case 'VISUAL': return 'Visual Proof (Screenshot/Recording)';
      case 'LINK': return 'URL (GitHub / X Thread / Contract)';
      case 'TEXT': return 'Text (Analysis / Report)';
      default: return 'Proof';
    }
  };

  const getPlaceholder = () => {
    switch (task.proof_type) {
      case 'LINK': return 'https://github.com/your-username/repo or https://x.com/your-handle/status/...';
      case 'TEXT': return 'Paste your analysis, architecture, or report here...';
      default: return '';
    }
  };

  return (
    <>
      <style>{`
        .ph-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(5,5,5,0.92); backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center;
          z-index: 999; padding: 1rem; box-sizing: border-box;
        }
        .ph-panel {
          background: #0a0a0a; border: 1px solid rgba(0,255,136,0.2);
          width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
          padding: 1.5rem; font-family: 'SF Mono', 'Courier New', monospace;
          color: #ffffff;
        }
        .ph-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 1.5rem; padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .ph-kicker {
          font-size: 0.65rem; color: #00ff88; letter-spacing: 2px;
          margin-bottom: 0.35rem; display: block; text-transform: uppercase;
        }
        .ph-title {
          color: #ffffff; font-size: 1rem; margin: 0; font-weight: bold;
        }
        .ph-close {
          background: none; border: none; color: rgba(255,255,255,0.4);
          cursor: pointer; font-size: 1.2rem; transition: color 0.2s;
          font-family: inherit; padding: 0; line-height: 1;
        }
        .ph-close:hover { color: #ffffff; }
        .ph-desc {
          color: rgba(255,255,255,0.6); font-size: 0.8rem;
          line-height: 1.6; margin-bottom: 1.5rem;
        }
        .ph-label {
          display: block; font-size: 0.65rem; color: #00ff88;
          margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 1px;
        }
        .ph-textarea {
          width: 100%; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);
          color: #ffffff; padding: 0.75rem; font-family: inherit; font-size: 0.85rem;
          min-height: 140px; resize: vertical; box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .ph-textarea:focus { outline: none; border-color: #00ff88; }
        .ph-textarea::placeholder { color: rgba(255,255,255,0.25); }
        .ph-input {
          width: 100%; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);
          color: #ffffff; padding: 0.75rem; font-family: inherit; font-size: 0.85rem;
          box-sizing: border-box; transition: border-color 0.2s;
        }
        .ph-input:focus { outline: none; border-color: #00ff88; }
        .ph-input::placeholder { color: rgba(255,255,255,0.25); }
        .ph-dropzone {
          border: 2px dashed rgba(255,255,255,0.12); background: #1a1a1a;
          padding: 2.5rem 1rem; text-align: center; cursor: pointer;
          transition: 0.2s; border-radius: 4px;
        }
        .ph-dropzone:hover { border-color: #00ff88; background: rgba(0,255,136,0.03); }
        .ph-dropzone-text {
          color: rgba(255,255,255,0.4); font-size: 0.75rem; pointer-events: none;
        }
        .ph-dropzone-text.active { color: #00ff88; }
        .ph-progress {
          margin-top: 0.75rem; background: #1a1a1a; border-radius: 3px;
          height: 4px; overflow: hidden;
        }
        .ph-progress-fill {
          background: #00ff88; height: 100%; transition: width 0.3s;
        }
        .ph-progress-text {
          font-size: 0.6rem; color: rgba(255,255,255,0.4);
          margin-top: 0.25rem; text-align: right;
        }
        .ph-footer {
          display: flex; justify-content: flex-end; gap: 0.75rem;
          margin-top: 1.5rem; padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .ph-btn {
          padding: 0.7rem 1.25rem; font-family: inherit; font-size: 0.7rem;
          cursor: pointer; text-transform: uppercase; letter-spacing: 1px;
          font-weight: bold; transition: 0.2s; border: none;
        }
        .ph-btn-cancel {
          background: transparent; color: rgba(255,255,255,0.4);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .ph-btn-cancel:hover { color: #ffffff; border-color: rgba(255,255,255,0.25); }
        .ph-btn-submit {
          background: #00ff88; color: #050505;
        }
        .ph-btn-submit:hover:not(:disabled) { background: #3DDC97; }
        .ph-btn-submit:active:not(:disabled) { transform: translateY(1px); }
        .ph-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ph-error {
          border: 1px solid rgba(255,68,68,0.3); color: rgba(255,68,68,0.8);
          padding: 0.7rem; font-size: 0.7rem; margin-top: 1rem;
          text-align: center; background: rgba(255,68,68,0.03);
        }
      `}</style>

      <div className="ph-overlay">
        <div className="ph-panel">
          
          <div className="ph-header">
            <div>
              <span className="ph-kicker">Evidence Vault · {task.id}</span>
              <h3 className="ph-title">{task.title}</h3>
            </div>
            <button className="ph-close" onClick={onClose} disabled={isSubmitting}>×</button>
          </div>

          <div className="ph-desc">{task.desc || task.description}</div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="ph-label">{getProofLabel()}</label>
            
            {task.proof_type === 'TEXT' && (
              <textarea 
                className="ph-textarea" 
                placeholder={getPlaceholder()}
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                disabled={isSubmitting}
              />
            )}

            {task.proof_type === 'LINK' && (
              <input 
                type="url" 
                className="ph-input" 
                placeholder={getPlaceholder()}
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                disabled={isSubmitting}
              />
            )}

            {task.proof_type === 'VISUAL' && (
              <>
                <div 
                  className="ph-dropzone" 
                  onClick={() => !isSubmitting && document.getElementById('proof-visual-upload')?.click()}
                  style={{ opacity: isSubmitting ? 0.5 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  <span className={`ph-dropzone-text ${file ? 'active' : ''}`}>
                    {file ? `[ SELECTED: ${file.name.toUpperCase()} ]` : 'Click to browse or drag file here'}
                  </span>
                  <input 
                    id="proof-visual-upload"
                    type="file" 
                    accept="image/png,image/jpeg,image/webp,video/mp4"
                    style={{ display: 'none' }} 
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                </div>
                {uploadProgress > 0 && (
                  <div className="ph-progress">
                    <div className="ph-progress-fill" style={{ width: `${uploadProgress}%` }} />
                    <div className="ph-progress-text">
                      {uploadProgress < 100 ? `[ UPLOADING... ${uploadProgress}% ]` : '[ EVIDENCE VAULTED ]'}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {errorMsg && <div className="ph-error">{errorMsg}</div>}
          </div>

          <div className="ph-footer">
            <button className="ph-btn ph-btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button className="ph-btn ph-btn-submit" onClick={handleExecute} disabled={isSubmitting}>
              {isSubmitting ? (uploadProgress > 0 ? `[ Uploading... ${uploadProgress}% ]` : '[ Saving... ]') : 'Submit Proof'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}