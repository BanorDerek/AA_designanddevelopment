import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminSecurity.css';

export default function AdminSecurity() {
  const { authFetch, user } = useAuth();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [setupCode, setSetupCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [enabled, setEnabled] = useState(user?.twoFactorEnabled || false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const startSetup = async () => {
    setError('');
    setBusy(true);
    try {
      const res = await authFetch('/auth/2fa/setup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQrCodeDataUrl(data.qrCodeDataUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmSetup = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await authFetch('/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: setupCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEnabled(true);
      setQrCodeDataUrl(null);
      setSetupCode('');
      setMessage('Two-factor authentication is now enabled.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const disable2FA = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await authFetch('/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: disableCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEnabled(false);
      setDisableCode('');
      setMessage('Two-factor authentication has been disabled.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="admin-page__title">Security</h1>
      <p className="admin-page__subtitle">Two-factor authentication for your own admin account.</p>

      {message && <p className="admin-security__message">{message}</p>}
      {error && <p className="admin-page__error">{error}</p>}

      <div className="admin-security__section">
        {enabled ? (
          <>
            <p className="admin-security__status admin-security__status--on">
              ✓ Two-factor authentication is enabled
            </p>
            <form className="admin-security__form" onSubmit={disable2FA}>
              <label>
                Enter a current code to disable
                <input
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  maxLength={6}
                  inputMode="numeric"
                  required
                />
              </label>
              <button className="admin-btn admin-btn--danger" type="submit" disabled={busy}>
                {busy ? 'Working…' : 'Disable 2FA'}
              </button>
            </form>
          </>
        ) : qrCodeDataUrl ? (
          <>
            <p>Scan this with Google Authenticator, Authy, or any TOTP app:</p>
            <img src={qrCodeDataUrl} alt="2FA QR code" className="admin-security__qr" />
            <form className="admin-security__form" onSubmit={confirmSetup}>
              <label>
                Enter the 6-digit code to confirm
                <input
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value)}
                  maxLength={6}
                  inputMode="numeric"
                  autoFocus
                  required
                />
              </label>
              <button className="admin-btn" type="submit" disabled={busy}>
                {busy ? 'Verifying…' : 'Confirm & Enable'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="admin-security__status">Two-factor authentication is not enabled.</p>
            <button className="admin-btn" onClick={startSetup} disabled={busy}>
              {busy ? 'Loading…' : 'Set Up Two-Factor Authentication'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}