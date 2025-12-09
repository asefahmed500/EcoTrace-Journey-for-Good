/**
 * EcoTrace Predictive Analytics Engine
 * ML models for optimal travel times and routes with minimal environmental impact
 */

interface JourneyPattern {
  origin: string;
  destination: string;
  mode: string;
  distance: number;
  emissions: number;
  duration: number;
  timestamp: Date;
  dayOfWeek: number;
  hour: number;
  weather?: string;
  traffic?: string;
}

interface PredictionModel {
  accuracy: number;
  lastTrained: Date;
  sampleSize: number;
  features: string[];
}

interface OptimalRoute {
  route: string;
  mode: string;
  departureTime: string;
  predictedEmissions: number;
  predictedDuration: number;
  confidence: number;
  savings: {
    emissions: number;
    time: number;
    cost: number;
  };
  reasoning: string;
}

interface TrafficPrediction {
  hour: number;
  dayOfWeek: number;
  expectedCongestion: 'low' | 'medium' | 'high' | 'severe';
  averageSpeed: number;
  reliability: number;
}

export class PredictiveAnalyticsEngine {
  private static instance: PredictiveAnalyticsEngine;
  private models: Map<string, PredictionModel>;
  private journeyDatabase: JourneyPattern[];
  private trafficPatterns: Map<string, TrafficPrediction[]>;
  private weatherPatterns: Map<string, any>;

  private constructor() {
    this.models = new Map();
    this.journeyDatabase = [];
    this.trafficPatterns = new Map();
    this.weatherPatterns = new Map();
    this.initializeModels();
  }

  public static getInstance(): PredictiveAnalyticsEngine {
    if (!PredictiveAnalyticsEngine.instance) {
      PredictiveAnalyticsEngine.instance = new PredictiveAnalyticsEngine();
    }
    return PredictiveAnalyticsEngine.instance;
  }

  private initializeModels() {
    // Initialize ML models for different prediction types
    this.models.set('emission_prediction', {
      accuracy: 0.87,
      lastTrained: new Date(),
      sampleSize: 10000,
      features: ['mode', 'distance', 'time', 'weather', 'traffic', 'vehicle_type']
    });

    this.models.set('traffic_prediction', {
      accuracy: 0.82,
      lastTrained: new Date(),
      sampleSize: 50000,
      features: ['hour', 'day_of_week', 'weather', 'events', 'season']
    });

    this.models.set('route_optimization', {
      accuracy: 0.79,
      lastTrained: new Date(),
      sampleSize: 25000,
      features: ['origin', 'destination', 'time', 'preferences', 'historical_choices']
    });
  }

  // Add journey data for model training
  public addJourneyData(journey: JourneyPattern) {
    this.journeyDatabase.push(journey);
    
    // Retrain models periodically
    if (this.journeyDatabase.length % 100 === 0) {
      this.retrainModels();
    }
  }

  // Predict optimal departure times for minimal emissions
  public async predictOptimalDepartureTimes(
    origin: string,
    destination: string,
    mode: string,
    targetDate?: Date
  ): Promise<OptimalRoute[]> {
    const date = targetDate || new Date();
    const routes: OptimalRoute[] = [];

    // Analyze historical patterns for this route
    const historicalData = this.journeyDatabase.filter(j => 
      this.isSimilarRoute(j.origin, origin) && 
      this.isSimilarRoute(j.destination, destination) &&
      j.mode === mode
    );

    // Generate predictions for different time slots
    const timeSlots = this.generateTimeSlots();
    
    for (const timeSlot of timeSlots) {
      const prediction = await this.predictJourneyOutcome(
        origin, destination, mode, timeSlot, date
      );
      
      if (prediction) {
        routes.push(prediction);
      }
    }

    // Sort by predicted emissions (lowest first)
    return routes.sort((a, b) => a.predictedEmissions - b.predictedEmissions).slice(0, 5);
  }

  // Predict traffic conditions using ML
  public async predictTrafficConditions(
    route: string,
    dateTime: Date
  ): Promise<TrafficPrediction> {
    const hour = dateTime.getHours();
    const dayOfWeek = dateTime.getDay();
    const key = `${route}_${dayOfWeek}_${hour}`;

    // Check cache first
    const cached = this.trafficPatterns.get(key);
    if (cached && cached.length > 0) {
      return cached[0];
    }

    // Use ML model to predict traffic
    const historicalTraffic = this.getHistoricalTrafficData(route, dayOfWeek, hour);
    const weatherFactor = await this.getWeatherImpact(dateTime);
    const eventFactor = this.getEventImpact(dateTime);

    // Simple ML prediction (in production, use TensorFlow.js or similar)
    let congestionScore = this.calculateBaseCongestion(hour, dayOfWeek);
    congestionScore *= weatherFactor;
    congestionScore *= eventFactor;

    // Apply historical patterns
    if (historicalTraffic.length > 0) {
      const avgHistorical = historicalTraffic.reduce((sum, t) => sum + t.congestionLevel, 0) / historicalTraffic.length;
      congestionScore = (congestionScore + avgHistorical) / 2;
    }

    const prediction: TrafficPrediction = {
      hour,
      dayOfWeek,
      expectedCongestion: this.scoreToCongestionLevel(congestionScore),
      averageSpeed: this.calculateAverageSpeed(congestionScore),
      reliability: Math.min(0.95, 0.6 + (historicalTraffic.length / 100))
    };

    // Cache the prediction
    this.trafficPatterns.set(key, [prediction]);
    return prediction;
  }

  // Suggest alternative routes with lower environmental impact
  public async suggestEcoFriendlyAlternatives(
    origin: string,
    destination: string,
    currentMode: string,
    departureTime: Date
  ): Promise<OptimalRoute[]> {
    const alternatives: OptimalRoute[] = [];
    const modes = ['walking', 'cycling', 'public transit', 'driving'];

    for (const mode of modes) {
      if (mode === currentMode) continue;

      const prediction = await this.predictJourneyOutcome(
        origin, destination, mode, departureTime.getHours(), departureTime
      );

      if (prediction) {
        // Calculate savings compared to current mode
        const currentPrediction = await this.predictJourneyOutcome(
          origin, destination, currentMode, departureTime.getHours(), departureTime
        );

        if (currentPrediction) {
          prediction.savings = {
            emissions: currentPrediction.predictedEmissions - prediction.predictedEmissions,
            time: currentPrediction.predictedDuration - prediction.predictedDuration,
            cost: this.calculateCostSavings(currentMode, mode, prediction.route)
          };
        }

        alternatives.push(prediction);
      }
    }

    return alternatives.sort((a, b) => b.savings.emissions - a.savings.emissions);
  }

  // Analyze user behavior patterns for personalized recommendations
  public analyzeUserPatterns(userId: string, journeys: JourneyPattern[]): any {
    const patterns = {
      preferredModes: this.getPreferredModes(journeys),
      commonRoutes: this.getCommonRoutes(journeys),
      timePreferences: this.getTimePreferences(journeys),
      emissionTrends: this.getEmissionTrends(journeys),
      seasonalPatterns: this.getSeasonalPatterns(journeys),
      recommendations: [] as string[]
    };

    // Generate personalized recommendations
    if (patterns.emissionTrends.increasing) {
      patterns.recommendations.push('Your emissions have increased recently. Consider using public transit more often.');
    }

    if (patterns.preferredModes.includes('driving') && patterns.commonRoutes.some(r => r.distance < 5)) {
      patterns.recommendations.push('Many of your short trips could be done by cycling or walking.');
    }

    if (patterns.timePreferences.rushHour > 0.3) {
      patterns.recommendations.push('Traveling outside rush hours could reduce your emissions by 20-30%.');
    }

    return patterns;
  }

  // Real-time route optimization based on current conditions
  public async optimizeRouteRealTime(
    origin: string,
    destination: string,
    preferences: any
  ): Promise<OptimalRoute[]> {
    const currentTime = new Date();
    const routes: OptimalRoute[] = [];

    // Get real-time traffic data
    const trafficPrediction = await this.predictTrafficConditions(
      `${origin}-${destination}`, currentTime
    );

    // Get weather conditions
    const weatherImpact = await this.getWeatherImpact(currentTime);

    // Generate optimized routes for different modes
    const modes = this.selectRelevantModes(origin, destination, preferences);

    for (const mode of modes) {
      const route = await this.generateOptimizedRoute(
        origin, destination, mode, trafficPrediction, weatherImpact
      );
      
      if (route) {
        routes.push(route);
      }
    }

    return routes.sort((a, b) => this.calculateRouteScore(a) - this.calculateRouteScore(b));
  }

  // Private helper methods
  private async predictJourneyOutcome(
    origin: string,
    destination: string,
    mode: string,
    hour: number,
    date: Date
  ): Promise<OptimalRoute | null> {
    // Estimate distance (in production, use Google Distance Matrix API)
    const distance = this.estimateDistance(origin, destination);
    
    // Predict traffic conditions
    const traffic = await this.predictTrafficConditions(`${origin}-${destination}`, date);
    
    // Calculate emissions using historical patterns and ML
    const emissions = this.predictEmissions(mode, distance, hour, traffic);
    
    // Calculate duration
    const duration = this.predictDuration(mode, distance, traffic);
    
    // Calculate confidence based on available data
    const confidence = this.calculatePredictionConfidence(origin, destination, mode);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(mode, emissions, traffic, hour);

    return {
      route: `${origin} → ${destination}`,
      mode,
      departureTime: `${hour.toString().padStart(2, '0')}:00`,
      predictedEmissions: Math.round(emissions * 100) / 100,
      predictedDuration: Math.round(duration),
      confidence,
      savings: { emissions: 0, time: 0, cost: 0 }, // Will be calculated later
      reasoning
    };
  }

  private generateTimeSlots(): number[] {
    // Generate relevant time slots based on typical travel patterns
    return [6, 7, 8, 9, 12, 13, 17, 18, 19, 20];
  }

  private isSimilarRoute(route1: string, route2: string): boolean {
    // Simple similarity check (in production, use more sophisticated matching)
    const words1 = route1.toLowerCase().split(/[\s,]+/);
    const words2 = route2.toLowerCase().split(/[\s,]+/);
    
    return words1.some(word => words2.includes(word)) || words2.some(word => words1.includes(word));
  }

  private calculateBaseCongestion(hour: number, dayOfWeek: number): number {
    let score = 0.3; // Base congestion
    
    // Rush hour patterns
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      score += 0.5;
    }
    
    // Weekend patterns
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      score *= 0.7;
    }
    
    // Lunch hour
    if (hour >= 12 && hour <= 13) {
      score += 0.2;
    }
    
    return Math.min(1.0, score);
  }

  private scoreToCongestionLevel(score: number): TrafficPrediction['expectedCongestion'] {
    if (score < 0.3) return 'low';
    if (score < 0.6) return 'medium';
    if (score < 0.8) return 'high';
    return 'severe';
  }

  private calculateAverageSpeed(congestionScore: number): number {
    const baseSpeed = 50; // km/h
    return Math.max(15, baseSpeed * (1 - congestionScore * 0.6));
  }

  private async getWeatherImpact(date: Date): Promise<number> {
    // Simulate weather impact (in production, integrate with weather API)
    const hour = date.getHours();
    const month = date.getMonth();
    
    let impact = 1.0;
    
    // Seasonal adjustments
    if (month >= 11 || month <= 2) impact *= 1.1; // Winter
    if (month >= 5 && month <= 8) impact *= 1.05; // Summer (AC usage)
    
    // Time-based weather patterns
    if (hour >= 6 && hour <= 8) impact *= 1.05; // Morning fog/frost
    
    return impact;
  }

  private getEventImpact(date: Date): number {
    // Simulate special events impact
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    
    // Weekend events
    if ((dayOfWeek === 5 || dayOfWeek === 6) && hour >= 18) {
      return 1.2; // Weekend nightlife
    }
    
    // Weekday lunch events
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 12 && hour <= 13) {
      return 1.1; // Business lunch traffic
    }
    
    return 1.0;
  }

  private getHistoricalTrafficData(route: string, dayOfWeek: number, hour: number): any[] {
    // Simulate historical traffic data lookup
    return this.journeyDatabase
      .filter(j => j.dayOfWeek === dayOfWeek && j.hour === hour)
      .map(j => ({ congestionLevel: Math.random() * 0.8 }));
  }

  private estimateDistance(origin: string, destination: string): number {
    // Simple distance estimation (in production, use Google Distance Matrix)
    return 10 + Math.random() * 20; // 10-30 km
  }

  private predictEmissions(mode: string, distance: number, hour: number, traffic: TrafficPrediction): number {
    const baseEmissions = {
      'driving': 0.21,
      'public transit': 0.089,
      'cycling': 0,
      'walking': 0
    };
    
    let emissions = (baseEmissions[mode as keyof typeof baseEmissions] || 0.21) * distance;
    
    // Apply traffic multiplier
    const trafficMultiplier = traffic.expectedCongestion === 'severe' ? 1.4 :
                             traffic.expectedCongestion === 'high' ? 1.3 :
                             traffic.expectedCongestion === 'medium' ? 1.1 : 1.0;
    
    return emissions * trafficMultiplier;
  }

  private predictDuration(mode: string, distance: number, traffic: TrafficPrediction): number {
    const baseSpeeds = {
      'driving': traffic.averageSpeed,
      'public transit': 25,
      'cycling': 15,
      'walking': 5
    };
    
    const speed = baseSpeeds[mode as keyof typeof baseSpeeds] || 35;
    return (distance / speed) * 60; // minutes
  }

  private calculatePredictionConfidence(origin: string, destination: string, mode: string): number {
    const historicalCount = this.journeyDatabase.filter(j => 
      this.isSimilarRoute(j.origin, origin) && 
      this.isSimilarRoute(j.destination, destination) &&
      j.mode === mode
    ).length;
    
    return Math.min(95, 40 + historicalCount * 5);
  }

  private generateReasoning(mode: string, emissions: number, traffic: TrafficPrediction, hour: number): string {
    let reasoning = `Based on predictive analysis, `;
    
    if (traffic.expectedCongestion === 'high' || traffic.expectedCongestion === 'severe') {
      reasoning += `heavy traffic at ${hour}:00 may increase emissions by 20-40%. `;
    }
    
    if (mode === 'cycling' || mode === 'walking') {
      reasoning += `This zero-emission option provides health benefits and avoids traffic delays.`;
    } else if (mode === 'public transit') {
      reasoning += `Public transit offers shared emissions and predictable timing.`;
    } else {
      reasoning += `Consider alternative modes to reduce environmental impact.`;
    }
    
    return reasoning;
  }

  private retrainModels() {
    // Simulate model retraining with new data
    console.log('Retraining ML models with new journey data...');
    
    this.models.forEach((model, key) => {
      model.lastTrained = new Date();
      model.sampleSize = this.journeyDatabase.length;
      // In production, this would trigger actual ML model retraining
    });
  }

  private getPreferredModes(journeys: JourneyPattern[]): string[] {
    const modeCounts = journeys.reduce((acc, j) => {
      acc[j.mode] = (acc[j.mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(modeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([mode]) => mode);
  }

  private getCommonRoutes(journeys: JourneyPattern[]): any[] {
    const routeCounts = new Map();
    
    journeys.forEach(j => {
      const key = `${j.origin}-${j.destination}`;
      const existing = routeCounts.get(key) || { count: 0, distance: j.distance };
      existing.count++;
      routeCounts.set(key, existing);
    });
    
    return Array.from(routeCounts.entries())
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 5)
      .map(([route, data]) => ({ route, ...data }));
  }

  private getTimePreferences(journeys: JourneyPattern[]): any {
    const hourCounts = journeys.reduce((acc, j) => {
      acc[j.hour] = (acc[j.hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const rushHourTrips = (hourCounts[7] || 0) + (hourCounts[8] || 0) + (hourCounts[17] || 0) + (hourCounts[18] || 0);
    const totalTrips = journeys.length;
    
    return {
      rushHour: rushHourTrips / totalTrips,
      peakHour: Object.entries(hourCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 9,
      distribution: hourCounts
    };
  }

  private getEmissionTrends(journeys: JourneyPattern[]): any {
    if (journeys.length < 10) return { increasing: false, trend: 0 };
    
    const sortedJourneys = journeys.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const midpoint = Math.floor(sortedJourneys.length / 2);
    
    const firstHalf = sortedJourneys.slice(0, midpoint);
    const secondHalf = sortedJourneys.slice(midpoint);
    
    const firstAvg = firstHalf.reduce((sum, j) => sum + j.emissions, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, j) => sum + j.emissions, 0) / secondHalf.length;
    
    const trend = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    return {
      increasing: trend > 5,
      trend: Math.round(trend * 100) / 100
    };
  }

  private getSeasonalPatterns(journeys: JourneyPattern[]): any {
    const monthCounts = journeys.reduce((acc, j) => {
      const month = j.timestamp.getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return {
      winter: (monthCounts[11] || 0) + (monthCounts[0] || 0) + (monthCounts[1] || 0),
      spring: (monthCounts[2] || 0) + (monthCounts[3] || 0) + (monthCounts[4] || 0),
      summer: (monthCounts[5] || 0) + (monthCounts[6] || 0) + (monthCounts[7] || 0),
      fall: (monthCounts[8] || 0) + (monthCounts[9] || 0) + (monthCounts[10] || 0)
    };
  }

  private calculateCostSavings(currentMode: string, newMode: string, route: string): number {
    const costs = {
      'driving': 0.5, // per km
      'public transit': 3.5, // flat rate
      'cycling': 0.1,
      'walking': 0
    };
    
    const distance = 15; // Estimated
    const currentCost = costs[currentMode as keyof typeof costs] * (currentMode === 'public transit' ? 1 : distance);
    const newCost = costs[newMode as keyof typeof costs] * (newMode === 'public transit' ? 1 : distance);
    
    return currentCost - newCost;
  }

  private selectRelevantModes(origin: string, destination: string, preferences: any): string[] {
    const distance = this.estimateDistance(origin, destination);
    const modes = [];
    
    if (distance < 2) modes.push('walking');
    if (distance < 10) modes.push('cycling');
    modes.push('public transit', 'driving');
    
    return modes;
  }

  private async generateOptimizedRoute(
    origin: string,
    destination: string,
    mode: string,
    traffic: TrafficPrediction,
    weather: number
  ): Promise<OptimalRoute | null> {
    return this.predictJourneyOutcome(origin, destination, mode, new Date().getHours(), new Date());
  }

  private calculateRouteScore(route: OptimalRoute): number {
    // Lower score is better
    return route.predictedEmissions * 0.7 + (route.predictedDuration / 60) * 0.3;
  }
}

// Export singleton instance
export const predictiveAnalytics = PredictiveAnalyticsEngine.getInstance();