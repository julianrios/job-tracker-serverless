import { useEffect, useState } from "react";

type Health = { ok: boolean; service: string; time: string };

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    fetch("http://localhost:3001/health")
      .then(r => r.json())
      .then(setHealth);
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Job Tracker (Local POC)</h1>
      <h2>Backend Health</h2>
      {!health ? <p>Loading...</p> : <pre>{JSON.stringify(health, null, 2)}</pre>}
    </div>
  );
}