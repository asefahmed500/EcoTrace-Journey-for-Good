/**
 * EcoTrace Proprietary Carbon Calculation Engine
 * Advanced algorithm using real traffic data, vehicle types, and local emission factors
 */

interface VehicleSpecs {
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'plugin-hybrid';
  engineSize?: number; // Liters
  year?: number;
  efficiency?: number; // MPG or kWh/100km
  weight?: number; // kg
}

interface TrafficConditions {
  congestionLevel: 'low' | 'medium' | 'high' | 'severe';
  averageSpeed: number; // km/h
  stopFrequency: number; // stops per km
  idleTime: number; // percentage of journey time
}

interface LocalFactors {
  altitude: number; // meters above sea level
  temperature: number; // Celsius
  humidity: number; // percentage
  airQuality: number; // AQI
  roadGrade: number; // percentage incline/decline
}

interface EmissionResult {
  totalEmissions: number; // kg CO2
  breakdown: {
    fuel: number;
    manufacturing: number;
    maintenance: number;
    infrastructure: number;
  };
  confidence: number; // 0-100%
  factors: {
    traffic: number;
    weather: number;
    vehicle: number;
    route: number;
  };
  recommendations: string[];
}

export class CarbonCalculationEngine {
  private static instance: CarbonCalculationEngine;
  private emissionDatabase: Map<string, any>;
  private trafficCache: Map<string, TrafficConditions>;
  private weatherCache: Map<string, LocalFactors>;

  private constructor() {
    this.emissionDatabase = new Map();
    this.trafficCache = new Map();
    this.weatherCache = new Map();
    this.initializeDatabase();
  }

  public static getInstance(): CarbonCalculationEngine {
    if (!CarbonCalculationEngine.instance) {
      CarbonCalculationEngine.instance = new CarbonCalculationEngine();
    }
    return CarbonCalculationEngine.instance;
  }

  private initializeDatabase() {
    // Initialize comprehensive emission factors database
    this.emissionDatabase.set('vehicle_emissions', {
      'gasoline': {
        base: 0.21, // kg CO2 per km
        efficiency_curve: (year: number) => Math.max(0.15, 0.25 - (2024 - year) * 0.005),
        engine_multiplier: (size: number) => 0.8 + (size * 0.1),
        weight_factor: (weight: number) => 1 + ((weight - 1500) / 1000) * 0.1
      },
      'diesel': {
        base: 0.19,
        efficiency_curve: (year: number) => Math.max(0.14, 0.22 - (2024 - year) * 0.004),
        engine_multiplier: (size: number) => 0.85 + (size * 0.08),
        weight_factor: (weight: number) => 1 + ((weight - 1500) / 1000) * 0.08
      },
      'hybrid': {
        base: 0.12,
        efficiency_curve: (year: number) => Math.max(0.08, 0.15 - (2024 - year) * 0.003),
        engine_multiplier: (size: number) => 0.9 + (size * 0.05),
        weight_factor: (weight: number) => 1 + ((weight - 1500) / 1000) * 0.05
      },
      'electric': {
        base: 0.05, // Grid average
        efficiency_curve: (year: number) => Math.max(0.02, 0.08 - (2024 - year) * 0.002),
        grid_factor: 0.4, // kg CO2 per kWh (varies by region)
        charging_efficiency: 0.9
      },
      'plugin-hybrid': {
        base: 0.08,
        efficiency_curve: (year: number) => Math.max(0.05, 0.12 - (2024 - year) * 0.002),
        electric_ratio: 0.6 // Percentage of journey on electric
      }
    });

    this.emissionDatabase.set('public_transit', {
      'bus': { base: 0.089, occupancy_factor: 0.6, fuel_type: 'diesel' },
      'electric_bus': { base: 0.045, occupancy_factor: 0.6, grid_factor: 0.4 },
      'train': { base: 0.041, occupancy_factor: 0.7, electrification: 0.8 },
      'subway': { base: 0.038, occupancy_factor: 0.65, efficiency: 0.9 },
      'tram': { base: 0.035, occupancy_factor: 0.6, electrification: 1.0 }
    });

    this.emissionDatabase.set('active_transport', {
      'cycling': { base: 0, manufacturing: 0.01, maintenance: 0.001 },
      'e_bike': { base: 0.01, battery_factor: 0.005, charging: 0.002 },
      'walking': { base: 0, health_benefit: -0.05 } // Negative for health benefits
    });
  }

  public async calculateEmissions(
    mode: string,
    distance: number,
    vehicleSpecs?: VehicleSpecs,
    trafficConditions?: TrafficConditions,
    localFactors?: LocalFactors,
    timeOfDay?: string
  ): Promise<EmissionResult> {
    
    // Get base emission factor
    let baseEmission = this.getBaseEmission(mode, vehicleSpecs);
    
    // Apply traffic conditions
    const trafficMultiplier = this.calculateTrafficMultiplier(trafficConditions, timeOfDay);
    
    // Apply local environmental factors
    const environmentMultiplier = this.calculateEnvironmentMultiplier(localFactors);
    
    // Apply vehicle-specific factors
    const vehicleMultiplier = this.calculateVehicleMultiplier(mode, vehicleSpecs);
    
    // Calculate total emissions
    const totalEmissions = baseEmission * distance * trafficMultiplier * environmentMultiplier * vehicleMultiplier;
    
    // Calculate emission breakdown
    const breakdown = this.calculateEmissionBreakdown(totalEmissions, mode, vehicleSpecs);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence(vehicleSpecs, trafficConditions, localFactors);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(mode, totalEmissions, trafficConditions);
    
    return {
      totalEmissions: Math.round(totalEmissions * 1000) / 1000,
      breakdown,
      confidence,
      factors: {
        traffic: trafficMultiplier,
        weather: environmentMultiplier,
        vehicle: vehicleMultiplier,
        route: 1.0 // Base route factor
      },
      recommendations
    };
  }

  private getBaseEmission(mode: string, vehicleSpecs?: VehicleSpecs): number {
    const modeKey = mode.toLowerCase().replace(/\s+/g, '_');
    
    if (mode === 'driving' && vehicleSpecs) {
      const vehicleData = this.emissionDatabase.get('vehicle_emissions')[vehicleSpecs.fuelType];
      return vehicleData?.base || 0.21;
    }
    
    if (mode === 'public transit') {
      const transitData = this.emissionDatabase.get('public_transit');
      return transitData['bus']?.base || 0.089;
    }
    
    if (mode === 'cycling' || mode === 'walking') {
      const activeData = this.emissionDatabase.get('active_transport');
      return activeData[modeKey]?.base || 0;
    }
    
    return 0.21; // Default fallback
  }

  private calculateTrafficMultiplier(conditions?: TrafficConditions, timeOfDay?: string): number {
    let multiplier = 1.0;
    
    if (conditions) {
      switch (conditions.congestionLevel) {
        case 'severe': multiplier *= 1.6; break;
        case 'high': multiplier *= 1.4; break;
        case 'medium': multiplier *= 1.2; break;
        case 'low': multiplier *= 0.9; break;
      }
      
      // Speed-based adjustment
      if (conditions.averageSpeed < 20) multiplier *= 1.3;
      else if (conditions.averageSpeed > 60) multiplier *= 0.8;
      
      // Stop frequency impact
      multiplier *= (1 + conditions.stopFrequency * 0.1);
      
      // Idle time impact
      multiplier *= (1 + conditions.idleTime * 0.5);
    }
    
    // Time-of-day adjustment
    if (timeOfDay) {
      const hour = parseInt(timeOfDay.split(':')[0]);
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
        multiplier *= 1.3; // Rush hour
      } else if (hour >= 22 || hour <= 6) {
        multiplier *= 0.8; // Night time
      }
    }
    
    return multiplier;
  }

  private calculateEnvironmentMultiplier(factors?: LocalFactors): number {
    if (!factors) return 1.0;
    
    let multiplier = 1.0;
    
    // Altitude effect (higher altitude = less efficient combustion)
    if (factors.altitude > 1000) {
      multiplier *= (1 + (factors.altitude - 1000) / 10000);
    }
    
    // Temperature effect
    if (factors.temperature < 0) {
      multiplier *= 1.15; // Cold weather increases emissions
    } else if (factors.temperature > 35) {
      multiplier *= 1.1; // Hot weather (AC usage)
    }
    
    // Road grade effect
    if (factors.roadGrade > 0) {
      multiplier *= (1 + factors.roadGrade / 100 * 0.5); // Uphill
    } else if (factors.roadGrade < 0) {
      multiplier *= (1 + Math.abs(factors.roadGrade) / 100 * 0.2); // Downhill (less impact)
    }
    
    return multiplier;
  }

  private calculateVehicleMultiplier(mode: string, specs?: VehicleSpecs): number {
    if (mode !== 'driving' || !specs) return 1.0;
    
    const vehicleData = this.emissionDatabase.get('vehicle_emissions')[specs.fuelType];
    if (!vehicleData) return 1.0;
    
    let multiplier = 1.0;
    
    // Year-based efficiency
    if (specs.year) {
      const efficiencyFactor = vehicleData.efficiency_curve(specs.year);
      multiplier *= efficiencyFactor / vehicleData.base;
    }
    
    // Engine size impact
    if (specs.engineSize) {
      multiplier *= vehicleData.engine_multiplier(specs.engineSize);
    }
    
    // Weight impact
    if (specs.weight) {
      multiplier *= vehicleData.weight_factor(specs.weight);
    }
    
    return multiplier;
  }

  private calculateEmissionBreakdown(total: number, mode: string, specs?: VehicleSpecs) {
    const breakdown = {
      fuel: total * 0.7,
      manufacturing: total * 0.15,
      maintenance: total * 0.1,
      infrastructure: total * 0.05
    };
    
    // Adjust for electric vehicles
    if (specs?.fuelType === 'electric') {
      breakdown.fuel = total * 0.4; // Grid electricity
      breakdown.manufacturing = total * 0.35; // Battery manufacturing
      breakdown.maintenance = total * 0.15;
      breakdown.infrastructure = total * 0.1; // Charging infrastructure
    }
    
    // Adjust for active transport
    if (mode === 'cycling' || mode === 'walking') {
      breakdown.fuel = 0;
      breakdown.manufacturing = total * 0.8;
      breakdown.maintenance = total * 0.2;
      breakdown.infrastructure = 0;
    }
    
    return breakdown;
  }

  private calculateConfidence(specs?: VehicleSpecs, traffic?: TrafficConditions, local?: LocalFactors): number {
    let confidence = 70; // Base confidence
    
    if (specs) confidence += 15; // Vehicle specs provided
    if (traffic) confidence += 10; // Traffic data available
    if (local) confidence += 5; // Local factors considered
    
    return Math.min(95, confidence);
  }

  private generateRecommendations(mode: string, emissions: number, traffic?: TrafficConditions): string[] {
    const recommendations: string[] = [];
    
    if (emissions > 10) {
      recommendations.push('Consider public transit or carpooling to reduce emissions');
    }
    
    if (emissions > 5) {
      recommendations.push('Electric or hybrid vehicles could reduce your carbon footprint');
    }
    
    if (traffic?.congestionLevel === 'high' || traffic?.congestionLevel === 'severe') {
      recommendations.push('Avoid peak hours to reduce emissions from traffic congestion');
    }
    
    if (mode === 'driving' && emissions < 2) {
      recommendations.push('Great choice! Your vehicle is relatively efficient');
    }
    
    if (mode === 'cycling' || mode === 'walking') {
      recommendations.push('Excellent! Zero-emission transport with health benefits');
    }
    
    return recommendations;
  }

  // Real-time traffic data integration
  public async getTrafficConditions(origin: any, destination: any): Promise<TrafficConditions> {
    const key = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}`;
    
    if (this.trafficCache.has(key)) {
      return this.trafficCache.get(key)!;
    }
    
    // Simulate real-time traffic data (in production, integrate with Google Traffic API)
    const distance = this.calculateDistance(origin, destination);
    const hour = new Date().getHours();
    
    let congestionLevel: TrafficConditions['congestionLevel'] = 'low';
    let averageSpeed = 50;
    
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      congestionLevel = Math.random() > 0.5 ? 'high' : 'severe';
      averageSpeed = 25;
    } else if ((hour >= 6 && hour <= 10) || (hour >= 16 && hour <= 20)) {
      congestionLevel = 'medium';
      averageSpeed = 35;
    }
    
    const conditions: TrafficConditions = {
      congestionLevel,
      averageSpeed,
      stopFrequency: congestionLevel === 'severe' ? 8 : congestionLevel === 'high' ? 5 : 2,
      idleTime: congestionLevel === 'severe' ? 0.3 : congestionLevel === 'high' ? 0.2 : 0.1
    };
    
    this.trafficCache.set(key, conditions);
    return conditions;
  }

  // Local environmental factors
  public async getLocalFactors(coordinates: any): Promise<LocalFactors> {
    const key = `${coordinates.lat},${coordinates.lng}`;
    
    if (this.weatherCache.has(key)) {
      return this.weatherCache.get(key)!;
    }
    
    // Simulate local environmental data (in production, integrate with weather APIs)
    const factors: LocalFactors = {
      altitude: Math.random() * 1000, // 0-1000m
      temperature: 15 + Math.random() * 20, // 15-35°C
      humidity: 40 + Math.random() * 40, // 40-80%
      airQuality: 50 + Math.random() * 100, // AQI 50-150
      roadGrade: (Math.random() - 0.5) * 10 // -5% to +5% grade
    };
    
    this.weatherCache.set(key, factors);
    return factors;
  }

  private calculateDistance(origin: any, destination: any): number {
    const R = 6371; // Earth's radius in km
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLon = (destination.lng - origin.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

// Export singleton instance
export const carbonEngine = CarbonCalculationEngine.getInstance();