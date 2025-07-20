import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

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
    targetEvent?: {
      eventType?: string;
      eventDate?: string;
      eventName?: string;
    };
    specificGoals: string[];
  };
  equipment: {
    bikes: Array<{
      type: string;
      hasPowerMeter: boolean;
      hasSmartTrainer: boolean;
    }>;
    hasHeartRateMonitor: boolean;
    hasCyclingComputer: boolean;
    hasIndoorTrainer: boolean;
  };
  schedule: {
    daysPerWeek: number;
    preferredDays: string[];
    sessionDuration: {
      min: number;
      max: number;
    };
    preferredTime: string;
  };
}

export default function ProfileForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    basicInfo: {
      age: 0,
      weight: 0,
      height: 0,
      gender: ''
    },
    experience: {
      level: '',
      yearsOfCycling: 0,
      currentWeeklyHours: 0,
      currentWeeklyDistance: 0
    },
    goals: {
      primaryGoal: '',
      targetEvent: {},
      specificGoals: []
    },
    equipment: {
      bikes: [],
      hasHeartRateMonitor: false,
      hasCyclingComputer: false,
      hasIndoorTrainer: false
    },
    schedule: {
      daysPerWeek: 0,
      preferredDays: [],
      sessionDuration: {
        min: 30,
        max: 120
      },
      preferredTime: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3001/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Profile created successfully:', result);
        alert('Profile created successfully! Session ID: ' + result.data.sessionId);
        navigate('/');
      } else {
        const error = await response.json();
        console.error('Error creating profile:', error);
        alert('Error creating profile: ' + error.message);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please check if the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDayToggle = (day: string) => {
    const { preferredDays } = formData.schedule;
    const updatedDays = preferredDays.includes(day)
      ? preferredDays.filter(d => d !== day)
      : [...preferredDays, day];
    
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        preferredDays: updatedDays,
        daysPerWeek: updatedDays.length
      }
    });
  };

  const addBike = () => {
    setFormData({
      ...formData,
      equipment: {
        ...formData.equipment,
        bikes: [...formData.equipment.bikes, {
          type: 'road',
          hasPowerMeter: false,
          hasSmartTrainer: false
        }]
      }
    });
  };

  const removeBike = (index: number) => {
    const newBikes = formData.equipment.bikes.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      equipment: {
        ...formData.equipment,
        bikes: newBikes
      }
    });
  };

  const updateBike = (index: number, field: string, value: any) => {
    const newBikes = [...formData.equipment.bikes];
    newBikes[index] = { ...newBikes[index], [field]: value };
    setFormData({
      ...formData,
      equipment: {
        ...formData.equipment,
        bikes: newBikes
      }
    });
  };

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
            <div className="step-indicator">Profile Setup</div>
          </div>
        </div>
      </nav>

      <div className="progress-bar"></div>

      <main className="main-content">
        <div className="setup-card" style={{ maxWidth: '800px', width: '100%' }}>
          <h2>Create Your Cycling Profile</h2>
          <p>Tell us about yourself to create a personalized training plan</p>

          <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
            {/* Basic Information */}
            <section style={{ marginBottom: '2rem' }}>
              <h3>Basic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label>Age</label>
                  <input
                    type="number"
                    min="13"
                    max="100"
                    required
                    value={formData.basicInfo.age || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      basicInfo: { ...formData.basicInfo, age: parseInt(e.target.value) }
                    })}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    required
                    value={formData.basicInfo.weight || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      basicInfo: { ...formData.basicInfo, weight: parseInt(e.target.value) }
                    })}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    min="120"
                    max="250"
                    required
                    value={formData.basicInfo.height || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      basicInfo: { ...formData.basicInfo, height: parseInt(e.target.value) }
                    })}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label>Gender</label>
                  <select
                    required
                    value={formData.basicInfo.gender}
                    onChange={(e) => setFormData({
                      ...formData,
                      basicInfo: { ...formData.basicInfo, gender: e.target.value }
                    })}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Experience */}
            <section style={{ marginBottom: '2rem' }}>
              <h3>Cycling Experience</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label>Experience Level</label>
                  <select
                    required
                    value={formData.experience.level}
                    onChange={(e) => setFormData({
                      ...formData,
                      experience: { ...formData.experience, level: e.target.value }
                    })}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  >
                    <option value="">Select level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label>Years of Cycling</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience.yearsOfCycling || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      experience: { ...formData.experience, yearsOfCycling: parseInt(e.target.value) || 0 }
                    })}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label>Current Weekly Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience.currentWeeklyHours || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      experience: { ...formData.experience, currentWeeklyHours: parseInt(e.target.value) || 0 }
                    })}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label>Current Weekly Distance (km)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience.currentWeeklyDistance || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      experience: { ...formData.experience, currentWeeklyDistance: parseInt(e.target.value) || 0 }
                    })}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  />
                </div>
              </div>
            </section>

            {/* Goals */}
            <section style={{ marginBottom: '2rem' }}>
              <h3>Training Goals</h3>
              <div>
                <label>Primary Goal</label>
                <select
                  required
                  value={formData.goals.primaryGoal}
                  onChange={(e) => setFormData({
                    ...formData,
                    goals: { ...formData.goals, primaryGoal: e.target.value }
                  })}
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', marginBottom: '1rem' }}
                >
                  <option value="">Select primary goal</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="endurance">Endurance</option>
                  <option value="speed">Speed</option>
                  <option value="event_training">Event Training</option>
                  <option value="general_fitness">General Fitness</option>
                  <option value="power">Power</option>
                </select>
              </div>
            </section>

            {/* Equipment */}
            <section style={{ marginBottom: '2rem' }}>
              <h3>Equipment</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label>Bikes</label>
                <button
                  type="button"
                  onClick={addBike}
                  style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem' }}
                >
                  Add Bike
                </button>
              </div>

              {formData.equipment.bikes.map((bike, index) => (
                <div key={index} style={{ border: '1px solid #333', padding: '1rem', marginBottom: '0.5rem', borderRadius: '4px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                    <div>
                      <label>Bike Type</label>
                      <select
                        value={bike.type}
                        onChange={(e) => updateBike(index, 'type', e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                      >
                        <option value="road">Road</option>
                        <option value="mountain">Mountain</option>
                        <option value="gravel">Gravel</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="tt">Time Trial</option>
                        <option value="track">Track</option>
                      </select>
                    </div>
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          checked={bike.hasPowerMeter}
                          onChange={(e) => updateBike(index, 'hasPowerMeter', e.target.checked)}
                          style={{ marginRight: '0.5rem' }}
                        />
                        Has Power Meter
                      </label>
                    </div>
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          checked={bike.hasSmartTrainer}
                          onChange={(e) => updateBike(index, 'hasSmartTrainer', e.target.checked)}
                          style={{ marginRight: '0.5rem' }}
                        />
                        Has Smart Trainer
                      </label>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeBike(index)}
                        style={{ padding: '0.5rem', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.equipment.hasHeartRateMonitor}
                      onChange={(e) => setFormData({
                        ...formData,
                        equipment: { ...formData.equipment, hasHeartRateMonitor: e.target.checked }
                      })}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Heart Rate Monitor
                  </label>
                </div>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.equipment.hasCyclingComputer}
                      onChange={(e) => setFormData({
                        ...formData,
                        equipment: { ...formData.equipment, hasCyclingComputer: e.target.checked }
                      })}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Cycling Computer
                  </label>
                </div>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.equipment.hasIndoorTrainer}
                      onChange={(e) => setFormData({
                        ...formData,
                        equipment: { ...formData.equipment, hasIndoorTrainer: e.target.checked }
                      })}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Indoor Trainer
                  </label>
                </div>
              </div>
            </section>

            {/* Schedule */}
            <section style={{ marginBottom: '2rem' }}>
              <h3>Training Schedule</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label>Preferred Training Days</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: formData.schedule.preferredDays.includes(day) ? '#fc4c02' : 'transparent',
                        color: formData.schedule.preferredDays.includes(day) ? 'white' : '#e6e6e6',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        textTransform: 'capitalize'
                      }}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label>Min Session Duration (minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    value={formData.schedule.sessionDuration.min}
                    onChange={(e) => setFormData({
                      ...formData,
                      schedule: {
                        ...formData.schedule,
                        sessionDuration: {
                          ...formData.schedule.sessionDuration,
                          min: parseInt(e.target.value) || 30
                        }
                      }
                    })}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label>Max Session Duration (minutes)</label>
                  <input
                    type="number"
                    min="30"
                    max="480"
                    value={formData.schedule.sessionDuration.max}
                    onChange={(e) => setFormData({
                      ...formData,
                      schedule: {
                        ...formData.schedule,
                        sessionDuration: {
                          ...formData.schedule.sessionDuration,
                          max: parseInt(e.target.value) || 120
                        }
                      }
                    })}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label>Preferred Time</label>
                  <select
                    value={formData.schedule.preferredTime}
                    onChange={(e) => setFormData({
                      ...formData,
                      schedule: { ...formData.schedule, preferredTime: e.target.value }
                    })}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  >
                    <option value="">Select preferred time</option>
                    <option value="early_morning">Early Morning</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
            </section>

            <div style={{ borderTop: '1px solid #333', paddingTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', color: '#e6e6e6', border: '1px solid #333', borderRadius: '4px' }}
              >
                Back to Home
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(90deg, #fc4c02, #f7b500)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}