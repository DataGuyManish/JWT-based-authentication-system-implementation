import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import TokenInspector from './TokenInspector';

export default function Dashboard() {
  const { user, token, logout, callProtectedEndpoint } = useAuth();
  const [response, setResponse] = useState(null);

  const handleCallApi = async () => {
    const result = await callProtectedEndpoint();
    setResponse(result);
  };

  const expiresAt = user?.exp ? new Date(user.exp * 1000).toLocaleTimeString() : '—';

  return (
    <div className="stack">
      <div className="card">
        <div className="row-between">
          <div>
            <h2>Welcome, {user.name}</h2>
            <p className="muted">
              Role: <strong>{user.role}</strong> · Token expires at {expiresAt}
            </p>
          </div>
          <button className="secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Protected resource</h2>
        <p className="muted">
          Simulates calling an API route that requires a valid{' '}
          <code>Authorization: Bearer &lt;token&gt;</code> header. No server session is
          checked — only the token itself.
        </p>
        <button onClick={handleCallApi}>Call protected endpoint</button>
        {response && (
          <div className={response.success ? 'result-ok' : 'error'}>
            {response.success ? response.data : response.error}
          </div>
        )}
      </div>

      <TokenInspector token={token} />
    </div>
  );
}
