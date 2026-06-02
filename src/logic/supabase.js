// src/logic/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing. Running in offline mode.')
}

export const supabase = createClient(supabaseUrl || 'http://localhost', supabaseAnonKey || 'fake-key')

export async function signUpCloud(email, password, name) {
  try {
    // 1. Pre-check: Does this username already exist in the database?
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', name)
      .maybeSingle();

    if (existingUser) {
      return { success: false, error: "That Operator Name is already taken. Please choose another." };
    }

    // 2. If unique, proceed with creating the Auth account
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { name: name }
      }
    })
    
    if (error) throw error

    // 3. Lock in the username, assign Tier, and check for Admin RBAC
    if (data.user) {
      const isAdmin = email.toLowerCase() === 'taphabiola@gmail.com';

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: data.user.id, 
          username: name, 
          email: email,
          tier: 'alpha',
          is_admin: isAdmin
        }]);
        
      if (profileError) console.error("Profile creation error:", profileError);
    }
    
    return { success: true, user: data.user }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function signInCloud(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { success: true, session: data.session, user: data.user }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Securely kill the cloud session
export async function signOutCloud() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Sign out failed:", err.message);
    return { success: false, error: err.message };
  }
}

// Check if a user is currently logged in on the cloud
export async function getCloudSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session: data.session, user: data.session?.user || null };
  } catch (error) {
    console.error("Session check failed:", error.message);
    return { session: null, user: null };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (err) {
    return null
  }
}

export async function saveProfileCloud(userId, profileData) {
  try {
    const { data, error } = await supabase.from('profiles').upsert({ id: userId, ...profileData }, { onConflict: 'id' }).select()
    if (error) throw error
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function loadProfileCloud(userId) {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (error && error.code !== 'PGRST116') throw error
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function saveReportCloud(userId, reportData) {
  try {
    const { data, error } = await supabase.from('reports').insert([{ user_id: userId, ...reportData }]).select()
    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function loadReportsCloud(userId) {
  try {
    const { data, error } = await supabase.from('reports').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function saveTrackerTasksCloud(userId, pathId, tasks) {
  try {
    await supabase.from('tracker_tasks').delete().eq('user_id', userId).eq('path_id', pathId)
    const tasksToInsert = tasks.map((t, idx) => ({ user_id: userId, path_id: pathId, task_order: idx, title: t.title, description: t.description || '', category: t.category || 'Learn', phase: t.phase || '', completed: t.completed || false, proof_link: t.proof_link || '' }))
    const { data, error } = await supabase.from('tracker_tasks').insert(tasksToInsert).select()
    if (error) throw error
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function loadTrackerTasksCloud(userId, pathId) {
  try {
    const { data, error } = await supabase.from('tracker_tasks').select('*').eq('user_id', userId).eq('path_id', pathId).order('task_order', { ascending: true })
    if (error) throw error
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function updateTrackerTaskCloud(taskId, updates) {
  try {
    const { data, error } = await supabase.from('tracker_tasks').update(updates).eq('id', taskId).select()
    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function savePathProgressCloud(userId, pathId, progressData) {
  try {
    const { data, error } = await supabase.from('user_path_progress').upsert({ user_id: userId, path_id: pathId, ...progressData }, { onConflict: 'user_id,path_id' }).select()
    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function loadPathProgressCloud(userId, pathId) {
  try {
    const { data, error } = await supabase.from('user_path_progress').select('*').eq('user_id', userId).eq('path_id', pathId).single()
    if (error && error.code !== 'PGRST116') throw error
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function addProofLinkCloud(userId, pathId, url, taskId) {
  try {
    const { data, error } = await supabase.from('proof_links').insert([{ user_id: userId, path_id: pathId, tracker_task_id: taskId || null, url }]).select()
    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function logActivityCloud(userId, action, screen, metadata = {}) {
  try {
    await supabase.from('activity_logs').insert([{ user_id: userId, action, screen, metadata }])
    return { success: true }
  } catch (err) {
    return { success: false }
  }
}

export async function submitBetaReportCloud(userId, reportData) {
  try {
    const { data, error } = await supabase.from('beta_reports').insert([{ user_id: userId, ...reportData }]).select()
    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// ==========================================
// WAITLIST & TOKEN LOGIC (V2 ALPHA)
// ==========================================
export async function joinWaitlistCloud(name, email, interest, experience) {
  try {
    const { count } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });
    if (count >= 100) return { success: false, error: 'The early access beta is currently full (100/100).' };

    // 🔒 FIX: Cryptographically secure token generation
    const token = 'VKT-' + crypto.randomUUID().substring(0, 8).toUpperCase();

    const { data: wl, error: wlError } = await supabase.from('waitlist').insert([{
      name, email, primary_interest: interest, experience_level: experience, consent_accepted: true
    }]).select().single();
    
    if (wlError) {
      if (wlError.code === '23505') return { success: false, error: 'This email is already on the waitlist.' };
      throw wlError;
    }

    // 🔒 FIX: Token now has 7-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: tkError } = await supabase.from('waitlist_access_tokens').insert([{
      waitlist_id: wl.id, email, token, status: 'active', expires_at: expiresAt.toISOString()
    }]);
    if (tkError) throw tkError;

    return { success: true, token };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function verifyAccessToken(email, token) {
  try {
    // 🔒 FIX: Also checks token hasn't expired
    const { data, error } = await supabase.from('waitlist_access_tokens')
      .select('*').eq('email', email).eq('token', token).eq('status', 'active')
      .gt('expires_at', new Date().toISOString()).single();
    if (error || !data) return { success: false, error: 'Invalid or expired access token.' };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function burnAccessToken(tokenStr) {
  if (!tokenStr) return { success: false };
  try {
    const { error } = await supabase
      .from('waitlist_access_tokens')
      .update({ status: 'used' })
      .eq('token', tokenStr);
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Token burn error:", error.message);
    return { success: false };
  }
}

// ==========================================
// PROOF VERIFICATION (DAY 2)
// ==========================================

// Extract handle from a URL
function extractHandleFromUrl(url, platform) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\/|\/$/g, '');
    
    switch (platform) {
      case 'github':
        return path.split('/')[0]?.toLowerCase() || null;
      case 'x':
      case 'twitter':
        return path.split('/')[0]?.replace('@', '').toLowerCase() || null;
      case 'telegram':
        return path.replace('@', '').toLowerCase() || null;
      default:
        return null;
    }
  } catch {
    return null;
  }
}

// Cross-reference a submitted proof URL against operator's stored social handles
export async function verifyProofIdentity(userId, proofUrl, proofType) {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('github_username, x_username, telegram_id')
      .eq('id', userId)
      .single();
      
    if (profileError || !profile) {
      return { verified: false, reason: 'Operator profile not found.' };
    }

    let extractedHandle = null;
    let storedHandle = null;
    let platform = null;

    if (proofType === 'LINK' || proofUrl.includes('github.com')) {
      extractedHandle = extractHandleFromUrl(proofUrl, 'github');
      storedHandle = profile.github_username?.toLowerCase();
      platform = 'GitHub';
    } else if (proofUrl.includes('x.com') || proofUrl.includes('twitter.com')) {
      extractedHandle = extractHandleFromUrl(proofUrl, 'x');
      storedHandle = profile.x_username?.toLowerCase();
      platform = 'X';
    } else if (proofUrl.includes('t.me')) {
      extractedHandle = extractHandleFromUrl(proofUrl, 'telegram');
      storedHandle = profile.telegram_id?.toLowerCase();
      platform = 'Telegram';
    }

    if (!platform) {
      return { verified: true, reason: 'No identity check needed for this proof type.' };
    }

    if (!extractedHandle) {
      return { verified: false, reason: `Could not extract ${platform} handle from URL.` };
    }

    if (!storedHandle) {
      return { verified: false, reason: `No ${platform} handle linked to your profile. Please add it in Settings.` };
    }

    if (extractedHandle === storedHandle) {
      return { verified: true, reason: `${platform} handle matches.` };
    }

    return { 
      verified: false, 
      reason: `URL handle (${extractedHandle}) does not match your linked ${platform} (${storedHandle}).` 
    };

  } catch (err) {
    console.error('Proof identity verification error:', err);
    return { verified: false, reason: 'Verification failed due to a system error.' };
  }
}

// Mark a proof as validated or challenged
export async function updateProofValidation(proofId, status, reason = null) {
  try {
    const { data, error } = await supabase
      .from('proof_links')
      .update({ 
        validated: status === 'validated',
        validation_status: status,
        validation_reason: reason,
        validated_at: status === 'validated' ? new Date().toISOString() : null
      })
      .eq('id', proofId)
      .select();
      
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Load all proofs for an operator (with validation status)
export async function loadProofsCloud(userId) {
  try {
    const { data, error } = await supabase
      .from('proof_links')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}