import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { generateToken, verifyToken, decodeToken } from '../utils/jwt';
import { mockValidateCredentials } from '../data/users';

const TOKEN_STORAGE_KEY = 'jwt_auth_experiment_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('checking'); // checking | authenticated | guest
  const [lastEvent, setLastEvent] = useState(null); // drives the "conceptual flow" log in the UI

  const log = useCallback((message) => {
    setLastEvent({ message, at: new Date().toLocaleTimeString() });
  }, []);

  // On first load, look for a token that survived a page refresh —
  // this is what makes the architecture "stateless": the server
  // holds no session, the client's token IS the session.
  useEffect(() => {
    (async () => {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!stored) {
        setStatus('guest');
        return;
      }
      const result = await verifyToken(stored);
      if (result.valid) {
        setToken(stored);
        setUser(result.payload);
        setStatus('authenticated');
        log('Restored session from stored token (signature + expiry verified).');
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setStatus('guest');
        log(`Stored token rejected: ${result.reason}. Cleared it.`);
      }
    })();
  }, [log]);

  const login = useCallback(
    async (username, password) => {
      log(`Sending credentials for "${username}" to the server for validation…`);
      const validatedUser = await mockValidateCredentials(username, password);

      if (!validatedUser) {
        log('Server rejected credentials.');
        return { success: false, error: 'Invalid username or password.' };
      }

      log('Credentials valid. Server is issuing a signed JWT…');
      const newToken = await generateToken({
        sub: validatedUser.id,
        username: validatedUser.username,
        name: validatedUser.name,
        role: validatedUser.role,
      });

      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      setToken(newToken);
      setUser(decodeToken(newToken).payload);
      setStatus('authenticated');
      log('Token stored in localStorage and attached to the session.');

      return { success: true };
    },
    [log]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setStatus('guest');
    log('Token discarded. Client-side session ended (server did not need to be told).');
  }, [log]);

  /**
   * Simulates attaching the token to an outgoing API request, the way
   * a real app would do with an Authorization: Bearer <token> header,
   * and simulates the server verifying it independently of any
   * session store.
   */
  const callProtectedEndpoint = useCallback(async () => {
    if (!token) return { success: false, error: 'No token attached to request.' };
    log('Simulating request with header  Authorization: Bearer <token>…');
    const result = await verifyToken(token);
    if (!result.valid) {
      log(`Server rejected request: ${result.reason}`);
      return { success: false, error: result.reason };
    }
    log('Server verified signature + expiry independently. Access granted.');
    return { success: true, data: `Hello ${result.payload.name}, here is your protected data.` };
  }, [token, log]);

  const value = {
    token,
    user,
    status,
    lastEvent,
    login,
    logout,
    callProtectedEndpoint,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
