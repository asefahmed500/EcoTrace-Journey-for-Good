import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Journey from '@/models/Journey';

interface CorporateStats {
  companyId: string;
  companyName: string;
  totalEmployees: number;
  activeUsers: number;
  totalEmissions: number;
  averageEmissionsPerEmployee: number;
  emissionsByMode: Record<string, number>;
  emissionsByDepartment: Record<string, number>;
  monthlyTrends: Array<{
    month: string;
    emissions: number;
    journeys: number;
  }>;
  topRoutes: Array<{
    route: string;
    frequency: number;
    emissions: number;
  }>;
  sustainabilityScore: number;
  recommendations: string[];
  benchmarks: {
    industryAverage: number;
    topPerformer: number;
    improvement: number;
  };
}

interface EmployeeCommute {
  employeeId: string;
  department: string;
  homeLocation?: string;
  workLocation: string;
  preferredModes: string[];
  totalEmissions: number;
  monthlyEmissions: number;
  sustainabilityRank: number;
}

// Corporate dashboard endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }
    
    // Validate API key (in production, check against database)
    if (!isValidCorporateApiKey(apiKey)) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    await dbConnect();
    
    // Get corporate statistics
    const stats = await generateCorporateStats(companyId);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in corporate API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch corporate data' },
      { status: 500 }
    );
  }
}

// Employee commute tracking endpoint
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey || !isValidCorporateApiKey(apiKey)) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'track_commute':
        return await trackEmployeeCommute(data);
      case 'get_employee_stats':
        return await getEmployeeStats(data.employeeId, data.companyId);
      case 'get_department_stats':
        return await getDepartmentStats(data.department, data.companyId);
      case 'update_employee_profile':
        return await updateEmployeeProfile(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in corporate POST API:', error);
    return NextResponse.json(
      { error: 'Failed to process corporate request' },
      { status: 500 }
    );
  }
}

async function generateCorporateStats(companyId: string): Promise<CorporateStats> {
  // Get all employees for this company (mock data for demo)
  const employees = await getCompanyEmployees(companyId);
  const journeys = await getCompanyJourneys(companyId);
  
  const totalEmissions = journeys.reduce((sum, j) => sum + j.emissions, 0);
  const averageEmissionsPerEmployee = employees.length > 0 ? totalEmissions / employees.length : 0;
  
  // Calculate emissions by transport mode
  const emissionsByMode = journeys.reduce((acc, j) => {
    acc[j.mode] = (acc[j.mode] || 0) + j.emissions;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate emissions by department (mock)
  const emissionsByDepartment = {
    'Engineering': totalEmissions * 0.35,
    'Sales': totalEmissions * 0.25,
    'Marketing': totalEmissions * 0.15,
    'Operations': totalEmissions * 0.15,
    'HR': totalEmissions * 0.1
  };
  
  // Generate monthly trends
  const monthlyTrends = generateMonthlyTrends(journeys);
  
  // Get top routes
  const topRoutes = getTopRoutes(journeys);
  
  // Calculate sustainability score (0-100)
  const sustainabilityScore = calculateSustainabilityScore(journeys, employees.length);
  
  // Generate recommendations
  const recommendations = generateCorporateRecommendations(journeys, sustainabilityScore);
  
  // Industry benchmarks
  const benchmarks = {
    industryAverage: 2.5, // kg CO2 per employee per day
    topPerformer: 1.2,
    improvement: Math.max(0, averageEmissionsPerEmployee - 1.2)
  };

  return {
    companyId,
    companyName: getCompanyName(companyId),
    totalEmployees: employees.length,
    activeUsers: employees.filter(e => e.lastActive).length,
    totalEmissions: Math.round(totalEmissions * 100) / 100,
    averageEmissionsPerEmployee: Math.round(averageEmissionsPerEmployee * 100) / 100,
    emissionsByMode,
    emissionsByDepartment,
    monthlyTrends,
    topRoutes,
    sustainabilityScore,
    recommendations,
    benchmarks
  };
}

async function trackEmployeeCommute(data: any) {
  const { employeeId, companyId, origin, destination, mode, emissions, distance, timestamp } = data;
  
  // In production, this would save to a corporate journey tracking system
  const commuteRecord = {
    employeeId,
    companyId,
    origin,
    destination,
    mode,
    emissions,
    distance,
    timestamp: new Date(timestamp),
    type: 'commute'
  };
  
  // Mock saving to database
  console.log('Tracking employee commute:', commuteRecord);
  
  return NextResponse.json({
    success: true,
    message: 'Commute tracked successfully',
    record: commuteRecord
  });
}

async function getEmployeeStats(employeeId: string, companyId: string) {
  // Mock employee statistics
  const stats = {
    employeeId,
    companyId,
    totalCommutes: 45,
    totalEmissions: 125.6,
    averageEmissionsPerTrip: 2.79,
    preferredMode: 'driving',
    sustainabilityRank: 23,
    monthlyEmissions: 28.4,
    emissionTrend: -5.2, // 5.2% decrease
    achievements: ['Eco Commuter', 'Public Transit Champion'],
    recommendations: [
      'Consider carpooling 2 days per week to reduce emissions by 40%',
      'Electric vehicle could reduce your footprint by 75%',
      'Bike-friendly route available for 60% of your commute'
    ]
  };
  
  return NextResponse.json(stats);
}

async function getDepartmentStats(department: string, companyId: string) {
  // Mock department statistics
  const stats = {
    department,
    companyId,
    employeeCount: 25,
    totalEmissions: 890.5,
    averageEmissionsPerEmployee: 35.6,
    topPerformers: [
      { name: 'Alice Johnson', emissions: 12.3, rank: 1 },
      { name: 'Bob Smith', emissions: 18.7, rank: 2 },
      { name: 'Carol Davis', emissions: 22.1, rank: 3 }
    ],
    modeDistribution: {
      'driving': 60,
      'public transit': 25,
      'cycling': 10,
      'walking': 5
    },
    monthlyTrend: -8.3, // 8.3% improvement
    departmentRank: 2, // out of 5 departments
    targetEmissions: 25.0, // kg CO2 per employee per month
    onTrackToTarget: true
  };
  
  return NextResponse.json(stats);
}

async function updateEmployeeProfile(data: any) {
  const { employeeId, companyId, profile } = data;
  
  // Mock profile update
  const updatedProfile = {
    employeeId,
    companyId,
    department: profile.department,
    homeLocation: profile.homeLocation,
    workLocation: profile.workLocation,
    preferredModes: profile.preferredModes,
    sustainabilityGoals: profile.sustainabilityGoals,
    updatedAt: new Date()
  };
  
  return NextResponse.json({
    success: true,
    message: 'Employee profile updated successfully',
    profile: updatedProfile
  });
}

// Helper functions
function isValidCorporateApiKey(apiKey: string): boolean {
  // In production, validate against database of corporate API keys
  const validKeys = [
    'corp_demo_key_123',
    'corp_test_key_456',
    'corp_prod_key_789'
  ];
  return validKeys.includes(apiKey);
}

async function getCompanyEmployees(companyId: string): Promise<any[]> {
  // Mock employee data
  return Array.from({ length: 150 }, (_, i) => ({
    id: `emp_${i + 1}`,
    companyId,
    department: ['Engineering', 'Sales', 'Marketing', 'Operations', 'HR'][i % 5],
    lastActive: i < 120 ? new Date() : null // 80% active users
  }));
}

async function getCompanyJourneys(companyId: string): Promise<any[]> {
  // Mock journey data for company employees
  const modes = ['driving', 'public transit', 'cycling', 'walking'];
  const journeys = [];
  
  for (let i = 0; i < 500; i++) {
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const distance = 5 + Math.random() * 25;
    const emissions = calculateMockEmissions(mode, distance);
    
    journeys.push({
      id: `journey_${i + 1}`,
      companyId,
      employeeId: `emp_${Math.floor(Math.random() * 150) + 1}`,
      mode,
      distance,
      emissions,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
    });
  }
  
  return journeys;
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

function generateMonthlyTrends(journeys: any[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    emissions: Math.round((Math.random() * 200 + 100) * 100) / 100,
    journeys: Math.floor(Math.random() * 100 + 50)
  }));
}

function getTopRoutes(journeys: any[]) {
  // Mock top routes
  return [
    { route: 'Downtown → Tech Campus', frequency: 45, emissions: 234.5 },
    { route: 'Suburbs → City Center', frequency: 38, emissions: 198.2 },
    { route: 'Airport → Office Park', frequency: 32, emissions: 167.8 },
    { route: 'University → Business District', frequency: 28, emissions: 145.3 },
    { route: 'Residential Area → Industrial Zone', frequency: 24, emissions: 123.7 }
  ];
}

function calculateSustainabilityScore(journeys: any[], employeeCount: number): number {
  const totalEmissions = journeys.reduce((sum, j) => sum + j.emissions, 0);
  const avgEmissionsPerEmployee = totalEmissions / employeeCount;
  
  // Score based on emissions per employee (lower is better)
  let score = Math.max(0, 100 - (avgEmissionsPerEmployee * 10));
  
  // Bonus for eco-friendly transport usage
  const ecoJourneys = journeys.filter(j => j.mode === 'cycling' || j.mode === 'walking' || j.mode === 'public transit');
  const ecoPercentage = ecoJourneys.length / journeys.length;
  score += ecoPercentage * 20;
  
  return Math.min(100, Math.round(score));
}

function generateCorporateRecommendations(journeys: any[], score: number): string[] {
  const recommendations = [];
  
  if (score < 60) {
    recommendations.push('Implement a corporate bike-sharing program');
    recommendations.push('Offer public transit subsidies to employees');
    recommendations.push('Introduce flexible work-from-home policies');
  }
  
  if (score < 80) {
    recommendations.push('Install EV charging stations in company parking');
    recommendations.push('Create carpooling incentive programs');
    recommendations.push('Partner with local transit authorities for corporate passes');
  }
  
  recommendations.push('Set department-level sustainability targets');
  recommendations.push('Gamify commute tracking with leaderboards and rewards');
  
  return recommendations;
}

function getCompanyName(companyId: string): string {
  const companies = {
    'comp_001': 'TechCorp Solutions',
    'comp_002': 'Green Industries Inc.',
    'comp_003': 'Sustainable Systems Ltd.',
    'comp_004': 'EcoTech Innovations'
  };
  return companies[companyId as keyof typeof companies] || 'Unknown Company';
}