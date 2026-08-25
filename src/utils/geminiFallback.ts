import { GoogleGenAI } from '@google/genai';

export const FALLBACK_LADDER = [
  'gemini-3.6-flash',       // Primary
  'gemini-3.1-flash-lite',  // High-Availability Fallback
  'gemini-flash-latest',    // Dynamic Alias
  'gemini-3.7-flash'        // Deep Reasoning Fallback
];

export interface FallbackExecutionResult {
  text: string;
  successfulModel: string;
  attemptedModels: string[];
  recoveredErrors: string[];
  latencyMs: number;
}

export interface FallbackParams {
  contents: string | any;
  config?: any;
  forceSimulatedErrorOnPrimary?: boolean;
}

let cachedClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return cachedClient;
}

/**
 * Executes a Gemini generation request using a resilient multi-tier fallback ladder.
 * Automatically fails over from gemini-3.6-flash -> gemini-3.1-flash-lite -> gemini-flash-latest -> gemini-3.7-flash.
 */
export async function generateContentWithFallback(
  params: FallbackParams
): Promise<FallbackExecutionResult> {
  const ai = getGeminiClient();
  const startTime = Date.now();
  const attemptedModels: string[] = [];
  const recoveredErrors: string[] = [];

  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }

  for (let i = 0; i < FALLBACK_LADDER.length; i++) {
    const currentModel = FALLBACK_LADDER[i];
    attemptedModels.push(currentModel);

    // Optional simulated primary failure flag for testbench / audit walkthrough
    if (i === 0 && params.forceSimulatedErrorOnPrimary) {
      const simMsg = `[SIMULATED 503 UNAVAILABLE] Primary model ${currentModel} overloaded. Triggering fallback ladder.`;
      recoveredErrors.push(simMsg);
      console.warn(`[Fallback Matrix] ${simMsg}`);
      continue;
    }

    try {
      console.log(`[Gemini Engine] Attempting model: ${currentModel}...`);
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: params.contents,
        config: params.config
      });

      const responseText = response.text || '';
      const latencyMs = Date.now() - startTime;
      console.log(`[Gemini Engine] Success with ${currentModel} in ${latencyMs}ms.`);

      return {
        text: responseText,
        successfulModel: currentModel,
        attemptedModels,
        recoveredErrors,
        latencyMs
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const failLog = `[${currentModel}] Failed: ${errMsg}`;
      recoveredErrors.push(failLog);
      console.warn(`[Fallback Matrix] ${failLog}`);

      // If all tiers are exhausted, throw a detailed composite error
      if (i === FALLBACK_LADDER.length - 1) {
        throw new Error(
          `All models in the resilient fallback ladder were exhausted. Errors: ${recoveredErrors.join(' | ')}`
        );
      }
    }
  }

  throw new Error('Unexpected fallback ladder exhaustion without resolution.');
}
