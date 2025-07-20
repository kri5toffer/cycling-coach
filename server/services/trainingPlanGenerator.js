// server/services/trainingPlanGenerator.js
const TrainingPlan = require('../models/TrainingPlan');
const Workout = require('../models/Workout');
const ClaudeAIService = require('./claudeAI');

/**
 * Enhanced Training Plan Generator with Claude AI Integration
 * Combines structured workout generation with AI-powered personalization
 */

class TrainingPlanGenerator {
  constructor(userProfile) {
    this.userProfile = userProfile;
    this.claudeAI = new ClaudeAIService();
    this.planDuration = this.calculatePlanDuration();
  }

  /**
   * Main method to generate complete training plan with AI enhancement
   */
  async generatePlan() {
    try {
      console.log('🏃‍♂️ Generating AI-enhanced training plan for:', this.userProfile.sessionId);

      // Step 1: Get AI-generated plan structure and insights
      const aiPlanData = await this.claudeAI.generateTrainingPlan(this.userProfile);
      
      // Step 2: Create structured workouts based on AI recommendations
      const workouts = await this.createAIEnhancedWorkouts(aiPlanData);
      
      // Step 3: Build weekly structure with AI insights
      const weeks = this.buildWeeklyStructure(workouts, aiPlanData);
      
      // Step 4: Calculate training zones (prefer AI zones, fallback to calculated)
      const trainingZones = aiPlanData.zones || this.calculateTrainingZones();
      
      // Step 5: Create and save enhanced training plan
      const trainingPlan = new TrainingPlan({
        sessionId: this.userProfile.sessionId,
        planName: aiPlanData.planName || this.generatePlanName(),
        duration: {
          weeks: aiPlanData.duration?.weeks || this.planDuration,
          startDate: new Date(),
          endDate: new Date(Date.now() + (aiPlanData.duration?.weeks || this.planDuration) * 7 * 24 * 60 * 60 * 1000),
          philosophy: aiPlanData.duration?.philosophy || 'Personalized training approach'
        },
        weeklyStructure: aiPlanData.weeklyStructure || this.calculateWeeklyStructure(),
        zones: trainingZones,
        weeks: weeks,
        aiInsights: this.enhanceAIInsights(aiPlanData.aiInsights),
        claudeGenerated: aiPlanData.aiGenerated || false,
        claudeWorkouts: aiPlanData.claudeWorkouts || null // Store AI workout details
      });

      await trainingPlan.save();
      
      console.log('✅ AI-enhanced training plan generated successfully');
      return trainingPlan;

    } catch (error) {
      console.error('❌ Error generating AI training plan:', error);
      throw error;
    }
  }

  /**
   * Create workouts enhanced with AI coaching advice
   */
  async createAIEnhancedWorkouts(aiPlanData) {
    const workouts = [];
    const { goals, experience, schedule } = this.userProfile;

    // If Claude provided detailed workouts, use those as templates
    if (aiPlanData.claudeWorkouts && aiPlanData.claudeWorkouts.length > 0) {
      console.log('🤖 Using Claude-generated workout templates');
      
      for (const claudeWorkout of aiPlanData.claudeWorkouts) {
        const workout = await this.createWorkoutFromClaudeTemplate(claudeWorkout);
        await workout.save();
        workouts.push(workout._id);
      }
    } else {
      console.log('🔧 Creating structured workouts with AI coaching advice');
      
      // Create our standard workout types with AI-enhanced coaching
      const workoutTypes = ['recovery', 'endurance', 'intervals'];
      
      for (const workoutType of workoutTypes) {
        // Get AI coaching advice for this workout type
        const coachingAdvice = await this.claudeAI.getCoachingAdvice(
          this.userProfile, 
          workoutType, 
          1 // week 1 as example
        );
        
        const workout = await this.createEnhancedWorkout(workoutType, coachingAdvice);
        await workout.save();
        workouts.push(workout._id);
      }
    }

    return workouts;
  }

  /**
   * Create workout from Claude's detailed template
   */
  async createWorkoutFromClaudeTemplate(claudeWorkout) {
    const { schedule } = this.userProfile;
    
    return new Workout({
      name: claudeWorkout.name,
      description: claudeWorkout.description,
      dayOfWeek: this.getPreferredDay(claudeWorkout.type),
      workoutType: this.mapClaudeWorkoutType(claudeWorkout.type),
      duration: Math.min(claudeWorkout.duration || 60, schedule.sessionDuration.max),
      structure: {
        warmup: {
          duration: 15,
          description: claudeWorkout.structure?.warmup || 'Gradual warm-up',
          intensity: 'Zone 1-2'
        },
        mainSet: [{
          duration: claudeWorkout.duration - 25,
          intensity: this.extractIntensity(claudeWorkout.structure?.mainSet),
          zone: this.extractZone(claudeWorkout.structure?.mainSet),
          description: claudeWorkout.structure?.mainSet || 'Main workout set',
          repetitions: this.extractRepetitions(claudeWorkout.structure?.mainSet)
        }],
        cooldown: {
          duration: 10,
          description: claudeWorkout.structure?.cooldown || 'Easy cool-down',
          intensity: 'Zone 1'
        }
      },
      intensity: {
        average: this.estimateIntensity(claudeWorkout.type),
        tss: this.calculateTSS(claudeWorkout.duration || 60, 0.7),
        if: 0.7
      },
      equipment: {
        required: ['bike'],
        optional: ['heart_rate_monitor']
      },
      environment: 'either',
      indoorAlternative: claudeWorkout.indoorOption || 'Use indoor trainer',
      outdoorAlternative: claudeWorkout.outdoorOption || 'Outdoor equivalent',
      coachNotes: claudeWorkout.coachingCues ? claudeWorkout.coachingCues.join(' ') : 'Focus on good form and pacing',
      nutritionGuidance: 'Follow pre/during/post workout nutrition guidelines',
      claudeGenerated: true,
      claudeAdvice: {
        coachingCues: claudeWorkout.coachingCues || [],
        indoorOption: claudeWorkout.indoorOption,
        outdoorOption: claudeWorkout.outdoorOption
      }
    });
  }

  /**
   * Create enhanced workout with AI coaching advice
   */
  async createEnhancedWorkout(workoutType, coachingAdvice) {
    const { schedule } = this.userProfile;
    
    const baseWorkouts = {
      'recovery': {
        name: 'AI-Enhanced Recovery Ride',
        description: 'Active recovery with personalized pacing guidance',
        workoutType: 'recovery',
        duration: Math.min(60, schedule.sessionDuration.max),
        structure: {
          warmup: { duration: 5, description: 'Very easy spinning', intensity: 'Zone 1' },
          mainSet: [{
            duration: Math.min(50, schedule.sessionDuration.max - 10),
            intensity: 'Zone 1-2',
            zone: 'Recovery',
            description: 'Maintain conversation pace, focus on smooth pedaling',
            repetitions: 1
          }],
          cooldown: { duration: 5, description: 'Easy spin and stretch', intensity: 'Zone 1' }
        },
        intensity: { average: 3, tss: 35, if: 0.55 }
      },
      'endurance': {
        name: 'AI-Coached Endurance Builder',
        description: 'Aerobic base building with intelligent pacing',
        workoutType: 'endurance',
        duration: schedule.sessionDuration.max,
        structure: {
          warmup: { duration: 15, description: 'Gradual warm-up to endurance pace', intensity: 'Zone 1-2' },
          mainSet: [{
            duration: schedule.sessionDuration.max - 25,
            intensity: 'Zone 2',
            zone: 'Endurance',
            description: 'Steady, sustainable pace. Should be able to hold conversation.',
            repetitions: 1
          }],
          cooldown: { duration: 10, description: 'Easy spinning to cool down', intensity: 'Zone 1' }
        },
        intensity: { average: 6, tss: this.calculateTSS(schedule.sessionDuration.max, 0.65), if: 0.65 }
      },
      'intervals': {
        name: 'AI-Optimized Intervals',
        description: 'Intelligent interval training with personalized recovery',
        workoutType: this.selectIntervalType(),
        duration: Math.min(90, schedule.sessionDuration.max),
        structure: {
          warmup: { duration: 20, description: 'Progressive warm-up with openers', intensity: 'Zone 1-3' },
          mainSet: [{
            duration: 5,
            intensity: 'Zone 4-5',
            zone: 'Threshold/VO2',
            description: 'Controlled high intensity effort',
            repetitions: 4,
            recoveryDuration: 3,
            recoveryIntensity: 'Zone 1'
          }],
          cooldown: { duration: 15, description: 'Easy spinning to clear lactate', intensity: 'Zone 1' }
        },
        intensity: { average: 8, tss: 85, if: 0.85 }
      }
    };

    const baseWorkout = baseWorkouts[workoutType];
    
    return new Workout({
      ...baseWorkout,
      dayOfWeek: this.getPreferredDay(workoutType),
      equipment: { required: ['bike'], optional: ['heart_rate_monitor'] },
      environment: 'either',
      coachNotes: coachingAdvice.coachNotes || baseWorkout.description,
      nutritionGuidance: coachingAdvice.nutritionGuidance || 'Stay hydrated and fuel appropriately',
      aiEnhanced: true,
      claudeCoaching: {
        personalizedNotes: coachingAdvice.coachNotes,
        nutritionAdvice: coachingAdvice.nutritionGuidance,
        motivationalTip: coachingAdvice.motivationalTip
      }
    });
  }

  /**
   * Build weekly structure enhanced with AI periodization
   */
  buildWeeklyStructure(workouts, aiPlanData) {
    const weeks = [];
    const totalWeeks = aiPlanData.duration?.weeks || this.planDuration;
    
    // Use AI periodization if available, otherwise use our logic
    if (aiPlanData.periodization && aiPlanData.periodization.phases) {
      console.log('🤖 Using Claude periodization strategy');
      return this.buildAIPeriodization(workouts, aiPlanData.periodization, totalWeeks);
    }
    
    console.log('🔧 Using structured periodization with AI insights');
    return this.buildStructuredPeriodization(workouts, totalWeeks);
  }

  /**
   * Build periodization based on AI recommendations
   */
  buildAIPeriodization(workouts, periodization, totalWeeks) {
    const weeks = [];
    let currentWeek = 1;
    
    for (const phase of periodization.phases) {
      const phaseWeeks = Math.min(phase.weeks, totalWeeks - currentWeek + 1);
      
      for (let i = 0; i < phaseWeeks; i++) {
        weeks.push({
          weekNumber: currentWeek,
          weekType: phase.name.toLowerCase(),
          totalLoad: this.calculatePhaseLoad(phase.focus, currentWeek, totalWeeks),
          workouts: [...workouts],
          aiPhase: {
            phaseName: phase.name,
            focus: phase.focus,
            guidance: `Week ${i + 1} of ${phase.name} phase: ${phase.focus}`
          }
        });
        currentWeek++;
        
        if (currentWeek > totalWeeks) break;
      }
      
      if (currentWeek > totalWeeks) break;
    }
    
    return weeks;
  }

  /**
   * Build structured periodization with AI insights
   */
  buildStructuredPeriodization(workouts, totalWeeks) {
    const weeks = [];
    
    for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
      let weekType, loadMultiplier;
      
      // Determine week type and load
      const baseWeeks = Math.floor(totalWeeks * 0.6);
      const buildWeeks = Math.floor(totalWeeks * 0.3);
      
      if (weekNum <= baseWeeks) {
        weekType = 'base';
        loadMultiplier = 0.8 + (weekNum / baseWeeks) * 0.2;
      } else if (weekNum <= baseWeeks + buildWeeks) {
        weekType = 'build';
        loadMultiplier = 1.0 + ((weekNum - baseWeeks) / buildWeeks) * 0.3;
      } else {
        weekType = 'peak';
        loadMultiplier = 0.7;
      }

      // Every 4th week is recovery
      if (weekNum % 4 === 0) {
        weekType = 'recovery';
        loadMultiplier = 0.6;
      }

      weeks.push({
        weekNumber: weekNum,
        weekType: weekType,
        totalLoad: Math.round(200 * loadMultiplier),
        workouts: [...workouts]
      });
    }
    
    return weeks;
  }

  /**
   * Enhance AI insights with additional structure
   */
  enhanceAIInsights(aiInsights) {
    if (!aiInsights) {
      return this.getDefaultInsights();
    }

    return {
      ...aiInsights,
      generatedAt: new Date(),
      aiPowered: true,
      enhancedFeatures: [
        'Personalized coaching cues',
        'Adaptive nutrition guidance', 
        'Motivational messaging',
        'Smart periodization'
      ]
    };
  }

  /**
   * Helper methods for AI integration
   */
  mapClaudeWorkoutType(claudeType) {
    const typeMap = {
      'endurance': 'endurance',
      'intervals': 'vo2max',
      'tempo': 'tempo',
      'recovery': 'recovery',
      'threshold': 'threshold',
      'sprint': 'sprint'
    };
    
    return typeMap[claudeType?.toLowerCase()] || 'endurance';
  }

  extractIntensity(mainSetDescription) {
    if (!mainSetDescription) return 'Zone 2';
    
    // Look for zone mentions in Claude's description
    const zoneMatch = mainSetDescription.match(/zone\s*(\d+)/i);
    if (zoneMatch) {
      return `Zone ${zoneMatch[1]}`;
    }
    
    // Look for intensity keywords
    if (mainSetDescription.toLowerCase().includes('hard')) return 'Zone 4-5';
    if (mainSetDescription.toLowerCase().includes('moderate')) return 'Zone 3';
    if (mainSetDescription.toLowerCase().includes('easy')) return 'Zone 1-2';
    
    return 'Zone 2';
  }

  extractZone(mainSetDescription) {
    if (!mainSetDescription) return 'Endurance';
    
    const zones = {
      'recovery': 'Recovery',
      'endurance': 'Endurance', 
      'tempo': 'Tempo',
      'threshold': 'Threshold',
      'vo2': 'VO2 Max',
      'sprint': 'Neuromuscular'
    };
    
    for (const [key, value] of Object.entries(zones)) {
      if (mainSetDescription.toLowerCase().includes(key)) {
        return value;
      }
    }
    
    return 'Endurance';
  }

  extractRepetitions(mainSetDescription) {
    if (!mainSetDescription) return 1;
    
    const repMatch = mainSetDescription.match(/(\d+)\s*x\s*\d+/i);
    if (repMatch) {
      return parseInt(repMatch[1]);
    }
    
    return 1;
  }

  estimateIntensity(workoutType) {
    const intensityMap = {
      'recovery': 3,
      'endurance': 6,
      'tempo': 7,
      'threshold': 8,
      'intervals': 8,
      'vo2max': 9,
      'sprint': 9
    };
    
    return intensityMap[workoutType?.toLowerCase()] || 6;
  }

  calculatePhaseLoad(phaseFocus, currentWeek, totalWeeks) {
    const baseLoad = 200;
    const progressionFactor = currentWeek / totalWeeks;
    
    const phaseMultipliers = {
      'base building': 0.8 + (progressionFactor * 0.2),
      'build': 1.0 + (progressionFactor * 0.3),
      'peak': 1.2,
      'recovery': 0.6,
      'taper': 0.5
    };
    
    const multiplier = phaseMultipliers[phaseFocus?.toLowerCase()] || 0.8;
    return Math.round(baseLoad * multiplier);
  }

  selectIntervalType() {
    const { goals } = this.userProfile;
    
    const goalIntervals = {
      'endurance': 'tempo',
      'speed': 'vo2max',
      'power': 'threshold',
      'event_training': 'threshold'
    };
    
    return goalIntervals[goals.primaryGoal] || 'tempo';
  }

  getDefaultInsights() {
    return {
      focusAreas: ['Build aerobic base', 'Improve consistency'],
      progressionStrategy: 'Gradual progression with proper recovery',
      keyWorkouts: ['Long endurance rides', 'Interval sessions'],
      nutritionTips: ['Stay hydrated', 'Eat adequate carbohydrates'],
      recoveryGuidelines: ['Prioritize sleep', 'Easy days truly easy'],
      aiPowered: false
    };
  }

  /**
   * Existing helper methods (keeping the same)
   */
  calculatePlanDuration() {
    const { goals, experience } = this.userProfile;
    
    const goalDurations = {
      'weight_loss': 12,
      'endurance': 16,
      'speed': 12,
      'event_training': 20,
      'general_fitness': 8,
      'power': 14
    };

    let weeks = goalDurations[goals.primaryGoal] || 12;

    if (experience.level === 'beginner') weeks = Math.max(8, weeks - 4);
    if (experience.level === 'expert') weeks = Math.min(24, weeks + 4);

    return weeks;
  }

  calculateTrainingZones() {
    const { basicInfo } = this.userProfile;
    const maxHR = 220 - basicInfo.age;
    
    return {
      type: 'heart_rate',
      values: {
        recovery: { min: Math.round(maxHR * 0.50), max: Math.round(maxHR * 0.60) },
        endurance: { min: Math.round(maxHR * 0.60), max: Math.round(maxHR * 0.70) },
        tempo: { min: Math.round(maxHR * 0.70), max: Math.round(maxHR * 0.80) },
        threshold: { min: Math.round(maxHR * 0.80), max: Math.round(maxHR * 0.90) },
        vo2max: { min: Math.round(maxHR * 0.90), max: Math.round(maxHR * 0.95) },
        neuromuscular: { min: Math.round(maxHR * 0.95), max: maxHR }
      }
    };
  }

  generatePlanName() {
    const { goals } = this.userProfile;
    const goalNames = {
      'endurance': 'Endurance Development Plan',
      'speed': 'Speed & Power Plan',
      'event_training': 'Event Preparation Plan',
      'weight_loss': 'Fitness & Weight Management Plan',
      'general_fitness': 'General Fitness Plan',
      'power': 'Power Development Plan'
    };

    return goalNames[goals.primaryGoal] || 'Personalized Training Plan';
  }

  calculateWeeklyStructure() {
    const { schedule } = this.userProfile;
    
    const avgDuration = (schedule.sessionDuration.min + schedule.sessionDuration.max) / 2;
    const totalHours = (schedule.daysPerWeek * avgDuration) / 60;
    const estimatedDistance = totalHours * 25;

    return {
      totalHours: Math.round(totalHours),
      totalDistance: Math.round(estimatedDistance),
      numberOfWorkouts: schedule.daysPerWeek
    };
  }

  getPreferredDay(workoutType) {
    const { schedule } = this.userProfile;
    const { preferredDays } = schedule;

    if (workoutType === 'long' && preferredDays.includes('saturday')) return 'saturday';
    if (workoutType === 'long' && preferredDays.includes('sunday')) return 'sunday';
    if (workoutType === 'hard' && preferredDays.includes('tuesday')) return 'tuesday';
    if (workoutType === 'hard' && preferredDays.includes('thursday')) return 'thursday';
    
    return preferredDays[0] || 'saturday';
  }

  calculateTSS(duration, intensityFactor) {
    return Math.round((duration / 60) * (intensityFactor ** 2) * 100);
  }
}

module.exports = TrainingPlanGenerator;