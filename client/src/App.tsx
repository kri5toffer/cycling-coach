import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/message');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        setMessage(data.message);
        
      } catch (err) {
        console.error("Failed to fetch message:", err);
        setError("Failed to load message from backend. Is the backend server running?");
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred.");
        }
      }
    };

    fetchMessage();
  }, []); 

  return (
    <div className="container">
      <header className="App-header">
        <h1>Cycling AI Analyzer</h1>
        <p>Frontend Message: Hello, React App!</p>
        {message ? (
          <p>Backend Message: {message}</p>
        ) : (
          <p style={{ color: 'red' }}>{error || 'Loading message from backend...'}</p>
        )}
        <button onClick={() => window.location.reload()}>Refresh</button>
      </header>
    </div>
  );
}

export default App;