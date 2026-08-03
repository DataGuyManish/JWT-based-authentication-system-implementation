import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);
    if (!result.success) setError(result.error);
  };

  const fillDemo = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="card">
      <h2>Sign in</h2>
      <p className="muted">Credentials are checked against a mock user store.</p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Verifying…' : 'Log in'}
        </button>
      </form>

      <div className="demo-users">
        <span className="muted">Demo accounts:</span>
        <button className="link" onClick={() => fillDemo('admin', 'admin123')}>
          admin / admin123
        </button>
        <button className="link" onClick={() => fillDemo('student', 'student123')}>
          student / student123
        </button>
      </div>
    </div>
  );
}
