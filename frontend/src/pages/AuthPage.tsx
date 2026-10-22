import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { ApiError } from '../lib/api';

export function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCountry, setRegCountry] = useState('');
  const [registered, setRegistered] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to log in');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        username: regUsername,
        email: regEmail,
        password: regPassword,
        country: regCountry,
      });
      setRegistered(true);
      setLoginEmail(regEmail);
      setTab('login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
    <div className="auth-card">
      <span className="eyebrow">Account</span>
      <div className="page-header">
        <h1>Welcome</h1>
      </div>
      <div className="tabs">
        <button
          type="button"
          className={`tab ${tab === 'login' ? 'active' : ''}`}
          onClick={() => {
            setTab('login');
            setError(null);
          }}
        >
          Log in
        </button>
        <button
          type="button"
          className={`tab ${tab === 'register' ? 'active' : ''}`}
          onClick={() => {
            setTab('register');
            setError(null);
          }}
        >
          Register
        </button>
      </div>

      {registered && tab === 'login' && (
        <p className="subtitle">Account created! You can log in now.</p>
      )}
      {error && <div className="error-banner">{error}</div>}

      {tab === 'login' ? (
        <form className="form" onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      ) : (
        <form className="form" onSubmit={handleRegister}>
          <div className="field">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              required
              minLength={4}
              maxLength={40}
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              required
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              maxLength={40}
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="reg-country">Country</label>
            <input
              id="reg-country"
              required
              value={regCountry}
              onChange={(e) => setRegCountry(e.target.value)}
            />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      )}
    </div>
    </div>
  );
}
