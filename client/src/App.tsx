import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/message');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMessage(data.message);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch message:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
        setIsLoading(false);
      }
    };

    fetchMessage();
  }, []);

  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <div className="logo-container">
              <div className="logo-icon">🚲</div>
              <div className="logo-text">
                <h2>CycleCoach AI</h2>
                <p>Your Personal Cycling Training Assistant</p>
              </div>
            </div>
          </div>
          <div className="navbar-right">
            <div className="step-indicator">Step 1 of 1: Welcome</div>
          </div>
        </div>
      </nav>

      <div className="progress-bar"></div>

      {/* Main Content */}
      <main className="main-content">
        <div className="ai-badge">
          <span className="ai-icon">✨</span>
          <span>Powered by AI</span>
      </div>

        <div className="hero-content">
          <h1>
            <span className="text-light">Train Smarter,</span>
            <span className="text-gradient">Ride Faster</span>
          </h1>
          
          <p className="hero-description">
            Transform your cycling performance with AI-powered training plans that adapt to
            your goals, schedule, and riding style. Get personalized coaching that evolves with you.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>AI-Powered Goals</h3>
            <p>Set personalized objectives with intelligent recommendations</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Performance Analytics</h3>
            <p>Deep insights into your cycling progress and metrics</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Strava Integration</h3>
            <p>Seamlessly sync your rides for enhanced personalization</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Adaptive Training</h3>
            <p>Plans that evolve with your performance and schedule</p>
          </div>
        </div>

        {/* Setup Options */}
        <div className="setup-options">
          <div className="setup-card strava-card">
            <div className="setup-header">
              <div className="setup-icon">🔄</div>
              <div className="setup-title">
                <h3>Connect with Strava</h3>
                <span className="recommended-badge">Recommended</span>
              </div>
            </div>
            
            <p>Get the most personalized training experience by connecting your Strava account. We'll analyze your recent rides to create perfectly tailored training plans.</p>
            
            <ul className="feature-list">
              <li>Analyze your recent performance data</li>
              <li>Personalized power zones and targets</li>
              <li>Adaptive training based on your history</li>
            </ul>
            
            <button className="btn-strava">Continue with Strava <span className="arrow">→</span></button>
          </div>
          
          <div className="setup-card manual-card">
            <div className="setup-header">
              <div className="setup-icon">⚙️</div>
              <div className="setup-title">
                <h3>Manual Setup</h3>
                <span className="quick-badge">Quick start</span>
              </div>
            </div>
            
            <p>Prefer to keep things simple? Create your training plan using just your goals, experience level, and available training time.</p>
            
            <ul className="feature-list">
              <li>Quick questionnaire setup</li>
              <li>Goal-based training plans</li>
              <li>No account connection required</li>
            </ul>
            
            <button className="btn-manual">Get Started</button>
          </div>
        </div>
      </main>

      {/* Backend connection status - for development */}
      <div className="backend-status">
        {isLoading ? (
          <p>Connecting to backend...</p>
        ) : error ? (
          <p className="error">Backend error: {error}</p>
        ) : (
          <p className="success">Backend connected: {message}</p>
        )}
      </div>
    </div>
  );
}

export default App;