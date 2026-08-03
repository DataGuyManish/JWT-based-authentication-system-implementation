import { useAuth } from '../context/AuthContext';

export default function EventLog() {
  const { lastEvent } = useAuth();
  if (!lastEvent) return null;

  return (
    <div className="event-log">
      <span className="event-time">{lastEvent.at}</span>
      <span>{lastEvent.message}</span>
    </div>
  );
}
