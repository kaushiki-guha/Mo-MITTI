import { config } from 'dotenv';
config();

import '@/ai/flows/ai-chat-for-crop-guidance.ts';
import '@/ai/flows/image-based-disease-detection.ts';
import '@/ai/flows/analyze-crop-growth.ts';
import '@/ai/flows/vegetation-analysis.ts';
import '@/ai/flows/suggest-crops-for-land.ts';

