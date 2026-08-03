/**
 * Mock "server-side" user store.
 * In a real backend, passwords would be hashed (e.g. bcrypt) and
 * stored in a database — never compared as plain text like this.
 * This file exists purely to simulate a credential check for the
 * experiment.
 */
export const MOCK_USERS = [
  {
    id: 'u001',
    username: 'admin',
    password: 'admin123',
    name: 'Administrator',
    role: 'admin',
  },
  {
    id: 'u002',
    username: 'student',
    password: 'student123',
    name: 'Priya Sharma',
    role: 'student',
  },
];

/** Simulates a POST /login request-response cycle with network delay. */
export function mockValidateCredentials(username, password) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(
        (u) => u.username === username && u.password === password
      );
      resolve(user ? { ...user, password: undefined } : null);
    }, 500);
  });
}
