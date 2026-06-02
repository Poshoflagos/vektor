// src/components/AccountCreation.jsx
import { useState, useRef } from 'react';
import { signUpCloud } from '../logic/supabase';

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
  "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

export default function AccountCreation({ email, accessToken, onComplete, onBack }) {
  const [form, setForm] = useState({
    password: '',
    confirm: '',
    username: '',
    country: '',
    githubLink: '',
    githubUsername: '',
    xLink: '',
    xUsername: '',
    telegramLink: '',
    telegramId: '',
    discordLink: '',
    discordId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [urlSuggestions, setUrlSuggestions] = useState({});
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryList, setShowCountryList] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const fileInputRef = useRef(null);

  const filteredCountries = countrySearch.trim()
    ? COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))
    : COUNTRIES;

  const handleCountryBlur = (e) => {
    setTimeout(() => setShowCountryList(false), 150);
  };

  const selectCountry = (country) => {
    setForm(prev => ({ ...prev, country }));
    setCountrySearch(country);
    setShowCountryList(false);
  };

  const handleUsernameChange = (field, value, urlField, prefix) => {
    const cleaned = value.trim().replace(/^@/, '');
    setForm(prev => ({ ...prev, [field]: value }));
    
    const prevSuggestion = urlSuggestions[urlField];
    const currentUrl = form[urlField];
    
    if (cleaned && (!currentUrl || currentUrl === prevSuggestion || currentUrl === '')) {
      const suggestedUrl = prefix + cleaned;
      setForm(prev => ({ ...prev, [urlField]: suggestedUrl }));
      setUrlSuggestions(prev => ({ ...prev, [urlField]: suggestedUrl }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Avatar must be PNG, JPEG, or WebP.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Avatar must be under 2MB.');
      return;
    }

    setAvatar(file);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadAvatar = async (userId) => {
    if (!avatar) return null;

    try {
      const { supabase } = await import('../logic/supabase');
      const fileExt = avatar.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatar, { upsert: true });

      if (uploadError) {
        console.warn('Avatar upload failed:', uploadError);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return urlData?.publicUrl || null;
    } catch (err) {
      console.warn('Avatar upload error:', err);
      return null;
    }
  };

  const allSocialsFilled = 
    form.githubUsername.trim() &&
    form.xUsername.trim() &&
    form.telegramId.trim() &&
    form.discordId.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!form.username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!form.country) {
      setError('Please select your country.');
      return;
    }
    if (!allSocialsFilled) {
      setError('All identity anchors are required. Please fill in GitHub, X, Telegram, and Discord usernames.');
      return;
    }

    setLoading(true);

    const result = await signUpCloud(email, form.password, form.username.trim());

    if (result.success) {
      // Save profile data even though email isn't confirmed yet
      if (result.user) {
        try {
          const { supabase } = await import('../logic/supabase');
          const avatarUrl = await uploadAvatar(result.user.id);

          await supabase.from('profiles').upsert({
            id: result.user.id,
            username: form.username.trim(),
            email: email,
            country: form.country,
            github_link: form.githubLink.trim() || null,
            github_username: form.githubUsername.trim() || null,
            x_link: form.xLink.trim() || null,
            x_username: form.xUsername.trim() || null,
            telegram_link: form.telegramLink.trim() || null,
            telegram_id: form.telegramId.trim() || null,
            discord_link: form.discordLink.trim() || null,
            discord_id: form.discordId.trim() || null,
            avatar_url: avatarUrl,
            socials_deferred: false,
            email_confirmed: false
          }, { onConflict: 'id' });
        } catch (profileErr) {
          console.warn('Profile save during signup:', profileErr);
        }
      }
      
      setEmailSent(true);
    } else {
      setError(result.error || 'Account creation failed.');
    }

    setLoading(false);
  };

  const canSubmit = form.password && form.confirm && form.username.trim() && form.country && allSocialsFilled;

  // ─── EMAIL SENT CONFIRMATION VIEW ──────────────────
  if (emailSent) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: "'SF Mono', 'Courier New', monospace"
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: '#0a0a0a',
          border: '1px solid rgba(0,255,136,0.2)',
          padding: '2rem 1.5rem',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📩</div>
          <div style={{
            fontSize: '0.65rem',
            color: '#00ff88',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '1rem'
          }}>
            █ Confirmation Sent
          </div>
          <h2 style={{ fontSize: '1rem', margin: '0 0 0.75rem 0' }}>
            Check Your Email
          </h2>
          <p style={{
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: '1.6',
            margin: '0 0 1.5rem 0'
          }}>
            We sent a confirmation link to <strong style={{ color: '#00ff88' }}>{email}</strong>.
            Click the link in the email to verify your account, then sign in.
          </p>
          <p style={{
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.25)',
            margin: '0 0 1.5rem 0'
          }}>
            Didn't receive it? Check spam or wait a few minutes.
          </p>
          <button
            onClick={onBack}
            style={{
              width: '100%',
              padding: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              letterSpacing: '1px',
              fontFamily: "'SF Mono', 'Courier New', monospace",
              background: '#00ff88',
              color: '#050505',
              transition: '0.2s'
            }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // ─── ACCOUNT CREATION FORM ─────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: "'SF Mono', 'Courier New', monospace"
    }}>
      <style>{`
        .acc-card {
          width: 100%;
          max-width: 480px;
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 1.5rem;
          color: #ffffff;
          max-height: 90vh;
          overflow-y: auto;
        }
        .acc-back {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          font-family: inherit;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 0;
          margin-bottom: 1rem;
          transition: color 0.2s;
        }
        .acc-back:hover { color: #00ff88; }
        .acc-label {
          display: block;
          margin-bottom: 0.35rem;
          color: #00ff88;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .acc-label-optional {
          color: rgba(255,255,255,0.38);
        }
        .acc-input {
          width: 100%;
          padding: 0.7rem;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.08);
          color: #ffffff;
          box-sizing: border-box;
          margin-bottom: 0.75rem;
          font-family: inherit;
          font-size: 0.85rem;
          transition: 0.2s;
        }
        .acc-input:focus {
          outline: none;
          border-color: #00ff88;
          box-shadow: 0 0 0 1px rgba(0,255,136,0.15);
        }
        .acc-input::placeholder { color: rgba(255,255,255,0.28); }
        .acc-input-suggested {
          color: rgba(255,255,255,0.45);
        }
        .acc-country-wrapper {
          position: relative;
          margin-bottom: 0.75rem;
        }
        .acc-country-list {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          max-height: 180px;
          overflow-y: auto;
          background: #1a1a1a;
          border: 1px solid #00ff88;
          border-top: none;
          z-index: 10;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .acc-country-item {
          padding: 0.55rem 0.7rem;
          cursor: pointer;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.8);
          transition: background 0.1s;
        }
        .acc-country-item:hover {
          background: rgba(0,255,136,0.1);
          color: #00ff88;
        }
        .acc-country-no-results {
          padding: 0.7rem;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.3);
          text-align: center;
        }
        .acc-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        @media (max-width: 480px) {
          .acc-grid-2 { grid-template-columns: 1fr; gap: 0; }
          .acc-grid-2 > div { margin-bottom: 0.5rem; }
        }
        .acc-btn {
          width: 100%;
          padding: 0.85rem;
          border: none;
          cursor: pointer;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 0.8rem;
          letter-spacing: 1px;
          font-family: inherit;
          transition: 0.2s;
          margin-top: 0.5rem;
        }
        .acc-btn-primary {
          background: #00ff88;
          color: #050505;
        }
        .acc-btn-primary:hover:not(:disabled) { background: #3DDC97; }
        .acc-btn:active:not(:disabled) { transform: translateY(1px); }
        .acc-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .acc-error {
          color: rgba(255,68,68,0.8);
          font-size: 0.7rem;
          padding: 0.6rem;
          border: 1px solid rgba(255,68,68,0.3);
          margin-bottom: 1rem;
          background: rgba(255,68,68,0.03);
        }
        .acc-divider {
          border: none;
          border-top: 1px dashed rgba(0,255,136,0.15);
          margin: 1.25rem 0;
          position: relative;
        }
        .acc-divider-text {
          position: absolute;
          top: -0.55rem;
          left: 50%;
          transform: translateX(-50%);
          background: #0a0a0a;
          padding: 0 0.75rem;
          font-size: 0.6rem;
          color: rgba(255,255,255,0.28);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .acc-avatar-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .acc-avatar-preview {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #1a1a1a;
          border: 2px dashed rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .acc-avatar-preview:hover { border-color: #00ff88; }
        .acc-avatar-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .acc-avatar-placeholder {
          font-size: 1.5rem;
          color: rgba(255,255,255,0.2);
        }
        .acc-avatar-actions {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .acc-avatar-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.6);
          padding: 0.4rem 0.8rem;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: 0.2s;
        }
        .acc-avatar-btn:hover { color: #00ff88; border-color: #00ff88; }
        .acc-avatar-btn-remove {
          color: rgba(255,68,68,0.5);
          border-color: rgba(255,68,68,0.2);
        }
        .acc-avatar-btn-remove:hover {
          color: #ff4444;
          border-color: rgba(255,68,68,0.5);
        }
        .acc-file-input { display: none; }
        .acc-url-hint {
          font-size: 0.55rem;
          color: rgba(255,255,255,0.25);
          margin-top: -0.5rem;
          margin-bottom: 0.75rem;
          font-style: italic;
        }
      `}</style>

      <div className="acc-card">
        {onBack && (
          <button type="button" className="acc-back" onClick={onBack}>
            ← Back
          </button>
        )}

        <div style={{
          fontSize: '0.65rem',
          color: '#00ff88',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '0.25rem',
          textAlign: 'center'
        }}>
          █ Account Setup
        </div>
        <h2 style={{
          fontSize: '1rem',
          margin: '0 0 0.25rem 0',
          textAlign: 'center'
        }}>
          Create Your Operator Profile
        </h2>
        <p style={{
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          margin: '0 0 1.25rem 0'
        }}>
          {email}
        </p>

        {error && <div className="acc-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="acc-label">Profile Picture</label>
          <div className="acc-avatar-section">
            <div
              className="acc-avatar-preview"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload avatar"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" />
              ) : (
                <span className="acc-avatar-placeholder">+</span>
              )}
            </div>
            <div className="acc-avatar-actions">
              <button
                type="button"
                className="acc-avatar-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? 'Change' : 'Upload'}
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  className="acc-avatar-btn acc-avatar-btn-remove"
                  onClick={handleRemoveAvatar}
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarChange}
              className="acc-file-input"
            />
          </div>

          <label className="acc-label">Username</label>
          <input
            className="acc-input"
            type="text"
            placeholder="e.g. ghost_operator"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
          />

          <label className="acc-label">Password</label>
          <input
            className="acc-input"
            type="password"
            placeholder="Min 6 characters"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />

          <label className="acc-label">Confirm Password</label>
          <input
            className="acc-input"
            type="password"
            placeholder="Re-enter password"
            value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })}
            required
          />

          <label className="acc-label">Country</label>
          <div className="acc-country-wrapper">
            <input
              className="acc-input"
              type="text"
              placeholder="Type to search..."
              value={countrySearch}
              onChange={e => {
                setCountrySearch(e.target.value);
                setForm(prev => ({ ...prev, country: '' }));
                setShowCountryList(true);
              }}
              onFocus={() => setShowCountryList(true)}
              onBlur={handleCountryBlur}
              autoComplete="off"
            />
            {showCountryList && (
              <ul className="acc-country-list">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map(c => (
                    <li
                      key={c}
                      className="acc-country-item"
                      onMouseDown={() => selectCountry(c)}
                    >
                      {c}
                    </li>
                  ))
                ) : (
                  <li className="acc-country-no-results">No countries found</li>
                )}
              </ul>
            )}
          </div>

          <div className="acc-divider">
            <span className="acc-divider-text">Identity Anchors (Required)</span>
          </div>

          <div className="acc-grid-2">
            <div>
              <label className="acc-label">GitHub Username</label>
              <input
                className="acc-input"
                type="text"
                placeholder="github"
                value={form.githubUsername}
                onChange={e => handleUsernameChange('githubUsername', e.target.value, 'githubLink', 'https://github.com/')}
                required
              />
            </div>
            <div>
              <label className="acc-label acc-label-optional">GitHub URL</label>
              <input
                className={`acc-input ${urlSuggestions['githubLink'] === form.githubLink && form.githubLink ? 'acc-input-suggested' : ''}`}
                type="url"
                placeholder="Auto-generated"
                value={form.githubLink}
                onChange={e => setForm({ ...form, githubLink: e.target.value })}
              />
              <div className="acc-url-hint">Auto-suggested — clear if not needed</div>
            </div>
          </div>

          <div className="acc-grid-2">
            <div>
              <label className="acc-label">X Username</label>
              <input
                className="acc-input"
                type="text"
                placeholder="@handle"
                value={form.xUsername}
                onChange={e => handleUsernameChange('xUsername', e.target.value, 'xLink', 'https://x.com/')}
                required
              />
            </div>
            <div>
              <label className="acc-label acc-label-optional">X URL</label>
              <input
                className={`acc-input ${urlSuggestions['xLink'] === form.xLink && form.xLink ? 'acc-input-suggested' : ''}`}
                type="url"
                placeholder="Auto-generated"
                value={form.xLink}
                onChange={e => setForm({ ...form, xLink: e.target.value })}
              />
              <div className="acc-url-hint">Auto-suggested — clear if not needed</div>
            </div>
          </div>

          <div className="acc-grid-2">
            <div>
              <label className="acc-label">Telegram ID</label>
              <input
                className="acc-input"
                type="text"
                placeholder="@telegram"
                value={form.telegramId}
                onChange={e => handleUsernameChange('telegramId', e.target.value, 'telegramLink', 'https://t.me/')}
                required
              />
            </div>
            <div>
              <label className="acc-label acc-label-optional">Telegram Link</label>
              <input
                className={`acc-input ${urlSuggestions['telegramLink'] === form.telegramLink && form.telegramLink ? 'acc-input-suggested' : ''}`}
                type="url"
                placeholder="Auto-generated"
                value={form.telegramLink}
                onChange={e => setForm({ ...form, telegramLink: e.target.value })}
              />
              <div className="acc-url-hint">Auto-suggested — clear if not needed</div>
            </div>
          </div>

          <div className="acc-grid-2">
            <div>
              <label className="acc-label">Discord ID</label>
              <input
                className="acc-input"
                type="text"
                placeholder="username"
                value={form.discordId}
                onChange={e => setForm({ ...form, discordId: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="acc-label acc-label-optional">Discord Link</label>
              <input
                className="acc-input"
                type="url"
                placeholder="Optional"
                value={form.discordLink}
                onChange={e => setForm({ ...form, discordLink: e.target.value })}
              />
              <div className="acc-url-hint">Optional</div>
            </div>
          </div>

          <button className="acc-btn acc-btn-primary" type="submit" disabled={loading || !canSubmit}>
            {loading ? '[ Creating Account... ]' : !canSubmit ? 'Fill All Required Fields' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}