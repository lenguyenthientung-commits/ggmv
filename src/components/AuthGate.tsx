import React, { useEffect, useState } from 'react';
import App from '../App';

// Shows the app only with a valid session cookie (one year per login); otherwise the password form.
export const AuthGate: React.FC = () => {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authenticated)))
      .catch(() => setAuthed(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) setAuthed(true);
      else setError((await res.json().catch(() => ({}))).error || 'Không đăng nhập được');
    } catch {
      setError('Không kết nối được máy chủ');
    } finally {
      setBusy(false);
    }
  };

  if (authed === null) return null;
  if (authed) return <App />;

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-paper text-ink">
      <form onSubmit={submit} className="panel p-6 w-full max-w-sm">
        <div className="label mb-1">Gay Gang Cinema</div>
        <h1 className="display text-[28px] mb-4">Vào rạp</h1>
        <label className="field-label" htmlFor="club-password">Mật khẩu của hội</label>
        <input
          id="club-password"
          type="password"
          autoFocus
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        {error && <p role="alert" className="text-[13px] mt-2">{error}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary mt-4 w-full">
          Đăng nhập
        </button>
        <p className="text-[12px] text-ink-3 mt-3">Đăng nhập một lần, ghi nhớ trên thiết bị này 1 năm.</p>
      </form>
    </div>
  );
};
