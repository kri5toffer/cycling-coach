// server/services/claudeAI.js
const axios = require('axios');

/**
 * Claude AI Service for generating personalized training plans
 * Uses Anthropic's Claude API to create intelligent cycling training recommendations
 */

class ClaudeAIService {
  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.baseURL = 'https://api.anthropic.com/v1/messages';
    
    if (!this.apiKey) {
      console.warn('⚠️  CLAUDE_API_KEY not found in environment variables');
    }
  }

  /**
   * Generate a personalized training plan using Claude AI
   */
  async generateTrainingPlan(userProfile) {
    try {
      console.log('🤖 Generating AI training plan with Claude...');
      
      const prompt = this.buildTrainingPlanPrompt(userProfile);
      
      const response = await this.callClaude(prompt, 'training-plan');
      
      // Parse Claude's response into structured data
      const aiTrainingPlan = this.parseTrainingPlanResponse(response);
      
      console.log('✅ Claude AI training plan generated successfully');
      return aiTrainingPlan;
      
    } catch (error) {
      console.error('❌ Error generating AI training plan:', error.message);
      
      // Fallback to our original logic if Claude fails
      console.log('🔄 Falling back to built-in training logic...');
      return this.generateFallbackPlan(userProfile);
    }
  }

  /**
   * Get personalized coaching advice for specific workouts
   */
  async getCoachingAdvice(userProfile, workoutType, weekNumber) {
    try {
      const prompt = this.buildCoachingPrompt(userProfile, workoutType, weekNumber);
      const response = await this.callClaude(prompt, 'coaching-advice');
      
      return {
        coachNotes: response.coachNotes || '',
        nutritionGuidance: response.nutritionGuidance || '',
        motivationalTip: response.motivationalTip || ''
      };
      
    } catch (error) {
      console.error('Error getting coaching advice:', error.message);
      return this.getFallbackCoachingAdvice(workoutType);
    }
  }

  /**
   * Call Claude API with proper formatting
   */
  async callClaude(prompt, type) {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }

    const response = await axios.post(this.baseURL, {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      timeout: 30000 // 30 second timeout
    });

    return this.extractClaudeResponse(response.data, type);
  }

  /**
   * Build comprehensive training plan prompt for Claude
   */
  buildTrainingPlanPrompt(userProfile) {
    const { basicInfo, experience, goals, equipment, schedule } = userProfile;
    
    return `You are an expert cycling coach with 20+ years of experience creating personalized training plans. Create a comprehensive cycling training plan based on this athlete profile:

ATHLETE PROFILE:
- Age: ${basicInfo.age}, Weight: ${basicInfo.weight}kg, Height: ${basicInfo.height}cm
- Gender: ${basicInfo.gender}
- Experience: ${experience.level} cyclist with ${experience.yearsOfCycling} years of cycling
- Current training: ${experience.currentWeeklyHours} hours/week, ${experience.currentWeeklyDistance}km/week
- Primary goal: ${goals.primaryGoal}
- Target event: ${goals.targetEvent ? `${goals.targetEvent.eventType} on ${goals.targetEvent.eventDate}` : 'No specific event'}
- Specific goals: ${goals.specificGoals ? goals.specificGoals.join(', ') : 'General improvement'}
- Available days: ${schedule.daysPerWeek} days per week (${schedule.preferredDays.join(', ')})
- Session duration: ${schedule.sessionDuration.min}-${schedule.sessionDuration.max} minutes
- Preferred time: ${schedule.preferredTime}
- Equipment: ${this.formatEquipment(equipment)}

Please create a training plan that includes:

1. PLAN OVERVIEW:
   - Plan name and duration (weeks)
   - Training philosophy and approach
   - Key focus areas for this athlete

2. TRAINING ZONES:
   - Heart rate zones based on estimated max HR
   - Power zones if applicable
   - RPE (Rate of Perceived Exertion) guidance

3. WEEKLY STRUCTURE:
   - Typical week breakdown
   - Total training time and distance
   - Workout types and frequency

4. PERIODIZATION:
   - How intensity and volume progress over time
   - Recovery weeks and tapering
   - Peak periods and adaptations

5. KEY WORKOUTS (3-4 specific workouts):
   - Detailed workout descriptions
   - Warm-up, main set, cool-down
   - Indoor/outdoor options
   - Coaching cues and tips

6. NUTRITION & RECOVERY:
   - Pre/during/post workout nutrition
   - Recovery strategies
   - Sleep recommendations

7. PROGRESSION MARKERS:
   - How to know if training is working
   - When to adjust intensity
   - Warning signs of overtraining

8. MOTIVATION & MINDSET:
   - Mental approach for this goal
   - How to stay consistent
   - Dealing with setbacks

Return your response in valid JSON format with this structure:
{
  "planName": "string",
  "duration": { "weeks": number, "philosophy": "string" },
  "focusAreas": ["string"],
  "zones": {
    "heartRate": { "zone1": { "min": number, "max": number, "description": "string" }, ... },
    "rpe": { "zone1": { "value": number, "description": "string" }, ... }
  },
  "weeklyStructure": {
    "totalHours": number,
    "totalDistance": number,
    "workoutTypes": ["string"],
    "typicalWeek": "string description"
  },
  "periodization": {
    "phases": [{ "name": "string", "weeks": number, "focus": "string" }],
    "progressionStrategy": "string"
  },
  "keyWorkouts": [
    {
      "name": "string",
      "type": "string",
      "duration": number,
      "description": "string",
      "structure": {
        "warmup": "string",
        "mainSet": "string",
        "cooldown": "string"
      },
      "coachingCues": ["string"],
      "indoorOption": "string",
      "outdoorOption": "string"
    }
  ],
  "nutrition": {
    "preWorkout": "string",
    "duringWorkout": "string",
    "postWorkout": "string",
    "dailyGuidance": "string"
  },
  "recovery": {
    "sleepGuidance": "string",
    "restDayActivities": "string",
    "recoveryMarkers": "string"
  },
  "progression": {
    "successMarkers": ["string"],
    "adjustmentTriggers": ["string"],
    "overtrainingWarnings": ["string"]
  },
  "motivation": {
    "mentalApproach": "string",
    "consistencyTips": ["string"],
    "setbackStrategies": "string"
  }
}`;
  }

  /**
   * Build coaching advice prompt for specific workouts
   */
  buildCoachingPrompt(userProfile, workoutType, weekNumber) {
    const { basicInfo, goals, experience } = userProfile;
    
    return `As an expert cycling coach, provide specific coaching advice for this workout:

ATHLETE: ${experience.level} cyclist, age ${basicInfo.age}, goal: ${goals.primaryGoal}
WORKOUT: ${workoutType} in week ${weekNumber} of training plan

Provide specific, actionable coaching advice in JSON format:
{
  "coachNotes": "Specific technique and pacing advice for this workout",
  "nutritionGuidance": "What to eat/drink before, during, and after this specific workout",
  "motivationalTip": "Encouraging, personalized message to help them push through this workout"
}`;
  }

  /**
   * Parse Claude's training plan response
   */
  parseTrainingPlanResponse(claudeResponse) {
    try {
      // Claude should return valid JSON, but let's be safe
      const parsed = typeof claudeResponse === 'string' 
        ? JSON.parse(claudeResponse) 
        : claudeResponse;
      
      // Validate required fields
      if (!parsed.planName || !parsed.duration || !parsed.keyWorkouts) {
        throw new Error('Invalid response structure from Claude');
      }
      
      return {
        aiGenerated: true,
        claudeResponse: parsed,
        // Map Claude's structure to our database schema
        planName: parsed.planName,
        duration: {
          weeks: parsed.duration.weeks,
          philosophy: parsed.duration.philosophy
        },
        aiInsights: {
          focusAreas: parsed.focusAreas || [],
          progressionStrategy: parsed.periodization?.progressionStrategy || '',
          keyWorkouts: parsed.keyWorkouts?.map(w => w.name) || [],
          nutritionTips: [
            parsed.nutrition?.preWorkout,
            parsed.nutrition?.duringWorkout,
            parsed.nutrition?.postWorkout,
            parsed.nutrition?.dailyGuidance
          ].filter(Boolean),
          recoveryGuidelines: [
            parsed.recovery?.sleepGuidance,
            parsed.recovery?.restDayActivities,
            parsed.recovery?.recoveryMarkers
          ].filter(Boolean),
          motivationalAdvice: {
            mentalApproach: parsed.motivation?.mentalApproach,
            consistencyTips: parsed.motivation?.consistencyTips || [],
            setbackStrategies: parsed.motivation?.setbackStrategies
          }
        },
        zones: this.mapClaudeZones(parsed.zones),
        weeklyStructure: parsed.weeklyStructure,
        claudeWorkouts: parsed.keyWorkouts // Store Claude's detailed workouts
      };
      
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      throw new Error('Failed to parse AI training plan response');
    }
  }

  /**
   * Extract response from Claude API format
   */
  extractClaudeResponse(apiResponse, type) {
    try {
      const content = apiResponse.content[0].text;
      
      if (type === 'training-plan') {
        // Extract JSON from Claude's response (it might include explanatory text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(content);
      }
      
      if (type === 'coaching-advice') {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return { coachNotes: content };
      }
      
      return content;
      
    } catch (error) {
      console.error('Error extracting Claude response:', error);
      throw new Error('Failed to extract response from Claude API');
    }
  }

  /**
   * Map Claude's zone format to our schema
   */
  mapClaudeZones(claudeZones) {
    if (!claudeZones || !claudeZones.heartRate) {
      // Return default zones if Claude doesn't provide them
      return this.getDefaultZones();
    }
    
    return {
      type: 'heart_rate',
      values: {
        recovery: claudeZones.heartRate.zone1 || { min: 100, max: 130 },
        endurance: claudeZones.heartRate.zone2 || { min: 130, max: 150 },
        tempo: claudeZones.heartRate.zone3 || { min: 150, max: 165 },
        threshold: claudeZones.heartRate.zone4 || { min: 165, max: 175 },
        vo2max: claudeZones.heartRate.zone5 || { min: 175, max: 190 },
        neuromuscular: claudeZones.heartRate.zone6 || { min: 190, max: 220 }
      }
    };
  }

  /**
   * Fallback methods when Claude API is unavailable
   */
  generateFallbackPlan(userProfile) {
    console.log('🔄 Using fallback training plan logic');
    return {
      aiGenerated: false,
      planName: `${userProfile.goals.primaryGoal} Training Plan`,
      aiInsights: {
        focusAreas: ['Build aerobic base', 'Improve consistency'],
        progressionStrategy: 'Gradual progression with proper recovery',
        keyWorkouts: ['Long endurance rides', 'Tempo intervals'],
        nutritionTips: ['Stay hydrated', 'Eat adequate carbohydrates'],
        recoveryGuidelines: ['Prioritize sleep', 'Easy days truly easy']
      }
    };
  }

  getFallbackCoachingAdvice(workoutType) {
    const advice = {
      'endurance': {
        coachNotes: 'Focus on maintaining a conversational pace throughout',
        nutritionGuidance: 'Hydrate well and bring snacks for rides over 90 minutes',
        motivationalTip: 'This builds the foundation for all your cycling fitness!'
      },
      'intervals': {
        coachNotes: 'Execute each interval with controlled intensity and full recovery',
        nutritionGuidance: 'Well-fueled before, recovery drink within 30 minutes after',
        motivationalTip: 'Each interval makes you stronger - embrace the challenge!'
      }
    };
    
    return advice[workoutType] || advice['endurance'];
  }

  getDefaultZones() {
    return {
      type: 'heart_rate',
      values: {
        recovery: { min: 100, max: 130 },
        endurance: { min: 130, max: 150 },
        tempo: { min: 150, max: 165 },
        threshold: { min: 165, max: 175 },
        vo2max: { min: 175, max: 190 },
        neuromuscular: { min: 190, max: 220 }
      }
    };
  }

  /**
   * Helper method to format equipment info
   */
  formatEquipment(equipment) {
    if (!equipment) return 'Basic bike setup';
    
    const items = [];
    if (equipment.bikes) {
      equipment.bikes.forEach(bike => {
        items.push(`${bike.type} bike${bike.hasPowerMeter ? ' with power meter' : ''}`);
      });
    }
    if (equipment.hasHeartRateMonitor) items.push('heart rate monitor');
    if (equipment.hasIndoorTrainer) items.push('indoor trainer');
    if (equipment.hasCyclingComputer) items.push('cycling computer');
    
    return items.length > 0 ? items.join(', ') : 'Basic bike setup';
  }
}

module.exports = ClaudeAIService;