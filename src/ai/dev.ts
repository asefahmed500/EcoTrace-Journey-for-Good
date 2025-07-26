import { config } from 'dotenv';
config();

import '@/ai/flows/predictive-routing.ts';
import '@/ai/flows/route-carbon-calculator.ts';
import '@/ai/flows/community-impact-flow.ts';
import '@/ai/flows/storyteller-flow.ts';
import '@/ai/tools/weather-tool.ts';
import '@/ai/tools/emission-factors-tool.ts';
