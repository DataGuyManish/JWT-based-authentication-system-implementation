import { useAuth, AuthProvider } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import EventLog from './components/EventLog';

function Shell() {
  const { status } = useAuth();

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <span className="eyebrow">Experiment 1.3.1</span>
          <h1>JWT Authentication &amp; Stateless Sessions</h1>
        </div>
      </header>

      <main>
        {status === 'checking' && <p className="muted">Checking for an existing session…</p>}
        {status === 'guest' && <LoginForm />}
        {status === 'authenticated' && <Dashboard />}
      </main>

      <EventLog />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
