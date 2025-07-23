import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

interface TrainingPlan {
  _id: string;
  sessionId: string;
  planName: string;
  duration: {
    weeks: number;
    startDate: string;
    endDate: string;
  };
  weeklyStructure: {
    totalHours: number;
    totalDistance: number;
    numberOfWorkouts: number;
  };
  zones: {
    type: string;
    values: {
      recovery: { min: number; max: number };
      endurance: { min: number; max: number };
      tempo: { min: number; max: number };
      threshold: { min: number; max: number };
      vo2max: { min: number; max: number };
      neuromuscular: { min: number; max: number };
    };
  };
  weeks: Array<{
    weekNumber: number;
    weekType: string;
    totalLoad: number;
    workouts: string[];
  }>;
  aiInsights: {
    focusAreas: string[];
    progressionStrategy: string;
    keyWorkouts: string[];
    nutritionTips: string[];
    recoveryGuidelines: string[];
  };
  createdAt: string;
}

interface UserProfile {
  basicInfo: {
    age: number;
    weight: number;
    height: number;
    gender: string;
  };
  experience: {
    level: string;
    yearsOfCycling: number;
    currentWeeklyHours: number;
    currentWeeklyDistance: number;
  };
  goals: {
    primaryGoal: string;
  };
}

export default function TrainingPlan() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainingData = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch complete session data
        const response = await fetch(`http://localhost:3001/api/session/${sessionId}/complete`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setUserProfile(data.data.userProfile);
          setTrainingPlan(data.data.trainingPlan);
        } else {
          setError('Failed to load training data');
        }
      } catch (err) {
        console.error('Error fetching training data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainingData();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="app">
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
              <div className="step-indicator">Loading Training Plan...</div>
            </div>
          </div>
        </nav>
        <div className="progress-bar"></div>
        <main className="main-content">
          <div className="setup-card">
            <h2>🤖 Generating Your AI Training Plan...</h2>
            <p>Please wait while we create your personalized training recommendations.</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
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
              <div className="step-indicator">Error Loading Plan</div>
            </div>
          </div>
        </nav>
        <div className="progress-bar"></div>
        <main className="main-content">
          <div className="setup-card">
            <h2>❌ Error Loading Training Plan</h2>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(90deg, #fc4c02, #f7b500)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                marginTop: '1rem'
              }}
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!trainingPlan) {
    return (
      <div className="app">
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
              <div className="step-indicator">Plan Not Ready</div>
            </div>
          </div>
        </nav>
        <div className="progress-bar"></div>
        <main className="main-content">
          <div className="setup-card">
            <h2>⏳ Training Plan Not Ready</h2>
            <p>Your training plan is still being generated. Please check back in a few moments.</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(90deg, #fc4c02, #f7b500)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                marginTop: '1rem'
              }}
            >
              Refresh Page
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
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
            <div className="step-indicator">Your Training Plan</div>
          </div>
        </div>
      </nav>

      <div className="progress-bar"></div>

      <main className="main-content">
        <div className="ai-badge">
          <span className="ai-icon">✨</span>
          <span>AI Generated Plan</span>
        </div>

        <div style={{ maxWidth: '900px', width: '100%' }}>
          {/* Plan Header */}
          <div className="setup-card" style={{ marginBottom: '2rem' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>{trainingPlan.planName}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'center' }}>
              <div>
                <h3 style={{ color: '#fc4c02', marginBottom: '0.5rem' }}>{trainingPlan.duration.weeks}</h3>
                <p>Weeks</p>
              </div>
              <div>
                <h3 style={{ color: '#fc4c02', marginBottom: '0.5rem' }}>{trainingPlan.weeklyStructure.totalHours}</h3>
                <p>Hours per Week</p>
              </div>
              <div>
                <h3 style={{ color: '#fc4c02', marginBottom: '0.5rem' }}>{trainingPlan.weeklyStructure.numberOfWorkouts}</h3>
                <p>Workouts per Week</p>
              </div>
              <div>
                <h3 style={{ color: '#fc4c02', marginBottom: '0.5rem' }}>{trainingPlan.weeklyStructure.totalDistance}</h3>
                <p>km per Week</p>
              </div>
            </div>
          </div>

          {/* Training Zones */}
          <div className="setup-card" style={{ marginBottom: '2rem' }}>
            <h2>🎯 Your Training Zones</h2>
            <p>Train in these heart rate zones for optimal results</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              {Object.entries(trainingPlan.zones.values).map(([zone, values]) => (
                <div key={zone} style={{ padding: '1rem', border: '1px solid #333', borderRadius: '8px', textAlign: 'center' }}>
                  <h4 style={{ textTransform: 'capitalize', marginBottom: '0.5rem', color: '#fc4c02' }}>{zone}</h4>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{values.min} - {values.max} bpm</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="setup-card" style={{ marginBottom: '2rem' }}>
            <h2>🤖 AI Training Insights</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3>Focus Areas</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {trainingPlan.aiInsights.focusAreas.map((area, index) => (
                  <span key={index} style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(252, 76, 2, 0.1)',
                    color: '#fc4c02',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3>Progression Strategy</h3>
              <p>{trainingPlan.aiInsights.progressionStrategy}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div>
                <h3>Key Workouts</h3>
                <ul style={{ paddingLeft: '1.5rem' }}>
                  {trainingPlan.aiInsights.keyWorkouts.map((workout, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>{workout}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3>Nutrition Tips</h3>
                <ul style={{ paddingLeft: '1.5rem' }}>
                  {trainingPlan.aiInsights.nutritionTips.map((tip, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h3>Recovery Guidelines</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                {trainingPlan.aiInsights.recoveryGuidelines.map((guideline, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>{guideline}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Weekly Breakdown */}
          <div className="setup-card" style={{ marginBottom: '2rem' }}>
            <h2>📅 Weekly Breakdown</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              {trainingPlan.weeks.slice(0, 4).map((week) => (
                <div key={week.weekNumber} style={{ 
                  padding: '1rem', 
                  border: '1px solid #333', 
                  borderRadius: '8px',
                  backgroundColor: '#1a1a1a'
                }}>
                  <h4 style={{ color: '#fc4c02', marginBottom: '0.5rem' }}>
                    Week {week.weekNumber} - {week.weekType}
                  </h4>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Training Load: {week.totalLoad}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#a0a0a0' }}>
                    {week.workouts.length} workouts scheduled
                  </p>
                </div>
              ))}
            </div>
            {trainingPlan.weeks.length > 4 && (
              <p style={{ textAlign: 'center', marginTop: '1rem', color: '#a0a0a0' }}>
                + {trainingPlan.weeks.length - 4} more weeks in your complete plan
              </p>
            )}
          </div>

          {/* Profile Summary */}
          {userProfile && (
            <div className="setup-card" style={{ marginBottom: '2rem' }}>
              <h2>👤 Your Profile</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <h4>Experience Level</h4>
                  <p style={{ textTransform: 'capitalize' }}>{userProfile.experience.level}</p>
                </div>
                <div>
                  <h4>Primary Goal</h4>
                  <p style={{ textTransform: 'capitalize' }}>{userProfile.goals.primaryGoal.replace('_', ' ')}</p>
                </div>
                <div>
                  <h4>Current Training</h4>
                  <p>{userProfile.experience.currentWeeklyHours} hours/week</p>
                </div>
                <div>
                  <h4>Experience</h4>
                  <p>{userProfile.experience.yearsOfCycling} years cycling</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="setup-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#e6e6e6',
                  border: '1px solid #333',
                  borderRadius: '4px'
                }}
              >
                Back to Home
              </button>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => alert('Export to PDF feature coming soon!')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: '#fc4c02',
                    border: '1px solid #fc4c02',
                    borderRadius: '4px'
                  }}
                >
                  📄 Export PDF
                </button>
                
                <button
                  onClick={() => alert('Export to Calendar feature coming soon!')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(90deg, #fc4c02, #f7b500)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                >
                  📅 Export to Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}