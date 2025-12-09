import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Journey from '@/models/Journey';
import User from '@/models/User';

interface CityStats {
  cityId: string;
  cityName: string;
  population: number;
  activeUsers: number;
  totalEmissions: number;
  emissionsPerCapita: number;
  emissionsByDistrict: Record<string, number>;
  emissionsByMode: Record<string, number>;
  airQualityImpact: {
    currentAQI: number;
    projectedImprovement: number;
    healthBenefits: string[];
  };
  infrastructureRecommendations: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    estimatedCost: number;
    expectedImpact: string;
    timeline: string;
  }>;
  sustainabilityGoals: {
    current: number;
    target2030: number;
    onTrack: boolean;
    requiredReduction: number;
  };
  publicTransitUsage: {
    ridership: number;
    growth: number;
    efficiency: number;
    coverage: number;
  };
  cyclingInfrastructure: {
    bikeKm: number;
    usage: number;
    safety: number;
    expansion: string[];
  };
  economicImpact: {
    healthSavings: number;
    productivityGains: number;
    tourismBoost: number;
    totalBenefit: number;
  };
}

interface DistrictAnalysis {
  districtId: string;
  districtName: string;
  population: number;
  emissions: number;
  emissionsPerCapita: number;
  dominantTransportMode: string;
  airQuality: number;
  infrastructureScore: number;
  recommendations: string[];
  hotspots: Array<{
    location: string;
    emissions: number;
    cause: string;
    solution: string;
  }>;
}

interface InfrastructurePlanning {
  projectId: string;
  projectName: string;
  type: 'bike_lane' | 'transit_station' | 'ev_charging' | 'pedestrian_zone';
  location: string;
  estimatedCost: number;
  expectedUsers: number;
  emissionReduction: number;
  roi: number;
  timeline: string;
  stakeholders: string[];
}

// Government dashboard endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('cityId');
    const govApiKey = request.headers.get('x-gov-api-key');
    
    if (!govApiKey) {
      return NextResponse.json({ error: 'Government API key required' }, { status: 401 });
    }
    
    if (!isValidGovernmentApiKey(govApiKey)) {
      return NextResponse.json({ error: 'Invalid government API key' }, { status: 401 });
    }
    
    if (!cityId) {
      return NextResponse.json({ error: 'City ID required' }, { status: 400 });
    }

    await dbConnect();
    
    const stats = await generateCityStats(cityId);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in government API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch government data' },
      { status: 500 }
    );
  }
}

// Infrastructure planning and analysis endpoint
export async function POST(request: NextRequest) {
  try {
    const govApiKey = request.headers.get('x-gov-api-key');
    
    if (!govApiKey || !isValidGovernmentApiKey(govApiKey)) {
      return NextResponse.json({ error: 'Invalid government API key' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'analyze_district':
        return await analyzeDistrict(data.districtId, data.cityId);
      case 'plan_infrastructure':
        return await planInfrastructure(data);
      case 'simulate_policy':
        return await simulatePolicy(data);
      case 'generate_report':
        return await generateGovernmentReport(data.cityId, data.reportType);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in government POST API:', error);
    return NextResponse.json(
      { error: 'Failed to process government request' },
      { status: 500 }
    );
  }
}

async function generateCityStats(cityId: string): Promise<CityStats> {
  // Get city data (mock for demo)
  const cityData = getCityData(cityId);
  const journeys = await getCityJourneys(cityId);
  const users = await getCityUsers(cityId);
  
  const totalEmissions = journeys.reduce((sum, j) => sum + j.emissions, 0);
  const emissionsPerCapita = totalEmissions / cityData.population;
  
  // Calculate emissions by district
  const emissionsByDistrict = calculateEmissionsByDistrict(journeys);
  
  // Calculate emissions by transport mode
  const emissionsByMode = journeys.reduce((acc, j) => {
    acc[j.mode] = (acc[j.mode] || 0) + j.emissions;
    return acc;
  }, {} as Record<string, number>);
  
  // Air quality impact analysis
  const airQualityImpact = calculateAirQualityImpact(totalEmissions, cityData.population);
  
  // Generate infrastructure recommendations
  const infrastructureRecommendations = generateInfrastructureRecommendations(journeys, cityData);
  
  // Sustainability goals tracking
  const sustainabilityGoals = calculateSustainabilityGoals(emissionsPerCapita, cityData);
  
  // Public transit analysis
  const publicTransitUsage = analyzePublicTransitUsage(journeys);
  
  // Cycling infrastructure analysis
  const cyclingInfrastructure = analyzeCyclingInfrastructure(journeys, cityData);
  
  // Economic impact calculation
  const economicImpact = calculateEconomicImpact(journeys, cityData);

  return {
    cityId,
    cityName: cityData.name,
    population: cityData.population,
    activeUsers: users.length,
    totalEmissions: Math.round(totalEmissions * 100) / 100,
    emissionsPerCapita: Math.round(emissionsPerCapita * 100) / 100,
    emissionsByDistrict,
    emissionsByMode,
    airQualityImpact,
    infrastructureRecommendations,
    sustainabilityGoals,
    publicTransitUsage,
    cyclingInfrastructure,
    economicImpact
  };
}

async function analyzeDistrict(districtId: string, cityId: string) {
  const districtData = getDistrictData(districtId);
  const journeys = await getDistrictJourneys(districtId);
  
  const emissions = journeys.reduce((sum, j) => sum + j.emissions, 0);
  const emissionsPerCapita = emissions / districtData.population;
  
  // Find dominant transport mode
  const modeCounts = journeys.reduce((acc, j) => {
    acc[j.mode] = (acc[j.mode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantTransportMode = Object.entries(modeCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'unknown';
  
  // Calculate air quality (mock)
  const airQuality = Math.max(20, 150 - (emissions / districtData.population) * 50);
  
  // Infrastructure score (mock)
  const infrastructureScore = Math.min(100, 60 + Math.random() * 40);
  
  // Generate recommendations
  const recommendations = generateDistrictRecommendations(journeys, districtData);
  
  // Identify emission hotspots
  const hotspots = identifyEmissionHotspots(journeys);
  
  const analysis: DistrictAnalysis = {
    districtId,
    districtName: districtData.name,
    population: districtData.population,
    emissions: Math.round(emissions * 100) / 100,
    emissionsPerCapita: Math.round(emissionsPerCapita * 100) / 100,
    dominantTransportMode,
    airQuality: Math.round(airQuality),
    infrastructureScore: Math.round(infrastructureScore),
    recommendations,
    hotspots
  };
  
  return NextResponse.json(analysis);
}

async function planInfrastructure(data: any) {
  const { cityId, projectType, location, budget } = data;
  
  // Generate infrastructure planning recommendations
  const projects = generateInfrastructureProjects(cityId, projectType, location, budget);
  
  return NextResponse.json({
    success: true,
    message: 'Infrastructure planning completed',
    projects,
    totalCost: projects.reduce((sum, p) => sum + p.estimatedCost, 0),
    totalEmissionReduction: projects.reduce((sum, p) => sum + p.emissionReduction, 0),
    averageROI: projects.reduce((sum, p) => sum + p.roi, 0) / projects.length
  });
}

async function simulatePolicy(data: any) {
  const { cityId, policyType, parameters } = data;
  
  // Simulate policy impact
  const simulation = {
    policyType,
    parameters,
    projectedImpact: {
      emissionReduction: Math.random() * 30 + 10, // 10-40% reduction
      costSavings: Math.random() * 5000000 + 1000000, // $1-6M savings
      healthBenefits: Math.random() * 100 + 50, // 50-150 lives saved
      economicGrowth: Math.random() * 2 + 1 // 1-3% growth
    },
    timeline: '2-5 years',
    implementationCost: Math.random() * 10000000 + 5000000, // $5-15M
    stakeholders: ['City Council', 'Transportation Dept', 'Environmental Agency', 'Citizens'],
    risks: [
      'Public resistance to change',
      'Budget constraints',
      'Technical implementation challenges'
    ],
    mitigationStrategies: [
      'Public awareness campaigns',
      'Phased implementation',
      'Pilot programs in select areas'
    ]
  };
  
  return NextResponse.json({
    success: true,
    simulation
  });
}

async function generateGovernmentReport(cityId: string, reportType: string) {
  const reportData = {
    reportId: `report_${Date.now()}`,
    cityId,
    reportType,
    generatedAt: new Date(),
    summary: {
      totalEmissions: 12450.6,
      emissionTrend: -8.3, // 8.3% decrease
      topConcerns: ['Traffic congestion in downtown', 'Limited cycling infrastructure', 'Air quality in industrial zones'],
      keyAchievements: ['15% increase in public transit usage', '25% growth in cycling', '10% reduction in car dependency']
    },
    recommendations: [
      {
        priority: 'high',
        action: 'Expand bike lane network',
        impact: 'High',
        cost: '$2.5M',
        timeline: '18 months'
      },
      {
        priority: 'medium',
        action: 'Implement congestion pricing',
        impact: 'Medium',
        cost: '$500K',
        timeline: '12 months'
      }
    ],
    dataVisualization: {
      charts: ['emission_trends', 'mode_distribution', 'district_comparison'],
      maps: ['hotspot_analysis', 'infrastructure_gaps', 'air_quality_zones']
    }
  };
  
  return NextResponse.json({
    success: true,
    report: reportData
  });
}

// Helper functions
function isValidGovernmentApiKey(apiKey: string): boolean {
  const validKeys = [
    'gov_demo_key_123',
    'gov_test_key_456',
    'gov_prod_key_789'
  ];
  return validKeys.includes(apiKey);
}

function getCityData(cityId: string) {
  const cities = {
    'city_001': { name: 'San Francisco', population: 875000 },
    'city_002': { name: 'Portland', population: 650000 },
    'city_003': { name: 'Austin', population: 980000 },
    'city_004': { name: 'Seattle', population: 750000 }
  };
  return cities[cityId as keyof typeof cities] || { name: 'Unknown City', population: 500000 };
}

function getDistrictData(districtId: string) {
  const districts = {
    'dist_001': { name: 'Downtown', population: 45000 },
    'dist_002': { name: 'Residential North', population: 120000 },
    'dist_003': { name: 'Industrial South', population: 35000 },
    'dist_004': { name: 'University District', population: 80000 }
  };
  return districts[districtId as keyof typeof districts] || { name: 'Unknown District', population: 25000 };
}

async function getCityJourneys(cityId: string): Promise<any[]> {
  // Mock city journey data
  const modes = ['driving', 'public transit', 'cycling', 'walking'];
  const journeys = [];
  
  for (let i = 0; i < 2000; i++) {
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const distance = 2 + Math.random() * 20;
    const emissions = calculateMockEmissions(mode, distance);
    
    journeys.push({
      id: `journey_${i + 1}`,
      cityId,
      districtId: `dist_${Math.floor(Math.random() * 4) + 1}`,
      mode,
      distance,
      emissions,
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Last 90 days
    });
  }
  
  return journeys;
}

async function getCityUsers(cityId: string): Promise<any[]> {
  // Mock active users
  return Array.from({ length: 1500 }, (_, i) => ({
    id: `user_${i + 1}`,
    cityId,
    active: true
  }));
}

async function getDistrictJourneys(districtId: string): Promise<any[]> {
  const journeys = await getCityJourneys('city_001');
  return journeys.filter(j => j.districtId === districtId);
}

function calculateMockEmissions(mode: string, distance: number): number {
  const factors = {
    'driving': 0.21,
    'public transit': 0.089,
    'cycling': 0,
    'walking': 0
  };
  return distance * (factors[mode as keyof typeof factors] || 0.21);
}

function calculateEmissionsByDistrict(journeys: any[]) {
  return journeys.reduce((acc, j) => {
    const district = j.districtId || 'unknown';
    acc[district] = (acc[district] || 0) + j.emissions;
    return acc;
  }, {} as Record<string, number>);
}

function calculateAirQualityImpact(totalEmissions: number, population: number) {
  const emissionsPerCapita = totalEmissions / population;
  const currentAQI = Math.max(20, Math.min(200, 50 + emissionsPerCapita * 100));
  
  return {
    currentAQI: Math.round(currentAQI),
    projectedImprovement: Math.round(Math.random() * 20 + 10), // 10-30% improvement
    healthBenefits: [
      'Reduced respiratory illness by 15%',
      'Decreased cardiovascular disease risk',
      'Improved life expectancy by 1.2 years',
      'Lower healthcare costs by $2.3M annually'
    ]
  };
}

function generateInfrastructureRecommendations(journeys: any[], cityData: any) {
  const recommendations = [
    {
      type: 'bike_lane_expansion',
      priority: 'high' as const,
      description: 'Expand protected bike lane network by 50km',
      estimatedCost: 2500000,
      expectedImpact: '15% increase in cycling, 8% emission reduction',
      timeline: '18 months'
    },
    {
      type: 'transit_frequency',
      priority: 'high' as const,
      description: 'Increase bus frequency during peak hours',
      estimatedCost: 1200000,
      expectedImpact: '20% increase in ridership, 5% emission reduction',
      timeline: '6 months'
    },
    {
      type: 'ev_charging_network',
      priority: 'medium' as const,
      description: 'Install 200 public EV charging stations',
      estimatedCost: 3000000,
      expectedImpact: '25% increase in EV adoption, 12% emission reduction',
      timeline: '24 months'
    },
    {
      type: 'pedestrian_zones',
      priority: 'medium' as const,
      description: 'Create car-free zones in downtown core',
      estimatedCost: 800000,
      expectedImpact: '30% increase in walking, improved air quality',
      timeline: '12 months'
    }
  ];
  
  return recommendations;
}

function calculateSustainabilityGoals(emissionsPerCapita: number, cityData: any) {
  const current = Math.round(emissionsPerCapita * 365); // Annual emissions per capita
  const target2030 = Math.round(current * 0.5); // 50% reduction target
  const requiredReduction = current - target2030;
  
  return {
    current,
    target2030,
    onTrack: Math.random() > 0.5, // Mock tracking status
    requiredReduction
  };
}

function analyzePublicTransitUsage(journeys: any[]) {
  const transitJourneys = journeys.filter(j => j.mode === 'public transit');
  const totalJourneys = journeys.length;
  
  return {
    ridership: transitJourneys.length,
    growth: Math.round((Math.random() * 20 - 5) * 100) / 100, // -5% to +15% growth
    efficiency: Math.round(Math.random() * 30 + 70), // 70-100% efficiency
    coverage: Math.round(Math.random() * 20 + 75) // 75-95% coverage
  };
}

function analyzeCyclingInfrastructure(journeys: any[], cityData: any) {
  const cyclingJourneys = journeys.filter(j => j.mode === 'cycling');
  
  return {
    bikeKm: Math.round(Math.random() * 200 + 150), // 150-350 km of bike lanes
    usage: cyclingJourneys.length,
    safety: Math.round(Math.random() * 30 + 60), // 60-90% safety score
    expansion: [
      'Connect downtown to university district',
      'Protected lanes on major arterials',
      'Bike-share station network expansion'
    ]
  };
}

function calculateEconomicImpact(journeys: any[], cityData: any) {
  const population = cityData.population;
  
  return {
    healthSavings: Math.round(population * 150), // $150 per capita health savings
    productivityGains: Math.round(population * 200), // $200 per capita productivity
    tourismBoost: Math.round(population * 50), // $50 per capita tourism
    totalBenefit: Math.round(population * 400) // Total economic benefit
  };
}

function generateDistrictRecommendations(journeys: any[], districtData: any): string[] {
  const recommendations = [
    'Implement bike-sharing program with 20 stations',
    'Improve bus stop accessibility and frequency',
    'Create pedestrian-friendly streetscapes',
    'Install smart traffic signals to reduce congestion',
    'Develop park-and-ride facilities at district edges'
  ];
  
  return recommendations.slice(0, 3); // Return top 3 recommendations
}

function identifyEmissionHotspots(journeys: any[]) {
  return [
    {
      location: 'Main St & 5th Ave intersection',
      emissions: 45.6,
      cause: 'Traffic congestion during rush hours',
      solution: 'Implement smart traffic management system'
    },
    {
      location: 'Industrial corridor',
      emissions: 38.2,
      cause: 'Heavy truck traffic',
      solution: 'Designate truck-only hours and routes'
    },
    {
      location: 'Shopping district parking',
      emissions: 29.8,
      cause: 'Circling for parking spaces',
      solution: 'Install smart parking guidance system'
    }
  ];
}

function generateInfrastructureProjects(cityId: string, projectType: string, location: string, budget: number) {
  const projects: InfrastructurePlanning[] = [
    {
      projectId: 'proj_001',
      projectName: 'Downtown Bike Lane Network',
      type: 'bike_lane',
      location: 'Downtown Core',
      estimatedCost: 1500000,
      expectedUsers: 2500,
      emissionReduction: 125.5,
      roi: 3.2,
      timeline: '12 months',
      stakeholders: ['City Planning', 'Transportation Dept', 'Local Businesses']
    },
    {
      projectId: 'proj_002',
      projectName: 'Transit Hub Expansion',
      type: 'transit_station',
      location: 'University District',
      estimatedCost: 3200000,
      expectedUsers: 8000,
      emissionReduction: 450.2,
      roi: 4.1,
      timeline: '24 months',
      stakeholders: ['Transit Authority', 'University', 'City Council']
    }
  ];
  
  return projects.filter(p => p.estimatedCost <= budget);
}