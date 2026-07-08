import { NextResponse } from 'next/server';

// Lazy load Genkit to prevent initialization issues if API keys are missing on startup
async function getGenkitInstance() {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { genkit } = await import('genkit');
    const { googleAI } = await import('@genkit-ai/google-genai');
    
    return genkit({
      plugins: [googleAI({ apiKey })],
    });
  } catch (e) {
    console.error('Failed to initialize Genkit:', e);
    return null;
  }
}

// Rule-based fallback database for offline / local-only execution
const fallbackCrops = [
  {
    name: 'Rice (Paddy)',
    soils: ['clay', 'alluvial'],
    seasons: ['kharif'],
    water: 'high',
    yield: '22-25 quintals/acre',
    fertilizers: 'Basal dose of NPK (12:32:16), followed by Urea top-dressing at 3 and 6 weeks. Add Zinc Sulphate (10kg/acre) in case of deficiency.',
    irrigation: 'Keep standing water of 2-5 cm during transplanting and tillering stages. Drain water 10 days before harvest.',
    pests: 'Watch out for Stem Borer and Brown Plant Hopper. Use Neem Seed Kernel Extract (NSKE 5%) or Cartap Hydrochloride as recommended.',
  },
  {
    name: 'Wheat',
    soils: ['loamy', 'black', 'alluvial'],
    seasons: ['rabi'],
    water: 'medium',
    yield: '18-22 quintals/acre',
    fertilizers: 'Apply 50kg DAP and 20kg MOP per acre as basal. Top dress with Urea (40kg/acre) during first and second irrigations.',
    irrigation: 'Requires 4-6 irrigations at critical stages: Crown Root Initiation (21 days), Tillering, Jointing, Flowering, and Milking.',
    pests: 'Monitor for Yellow Rust and Aphids. Spray Propiconazole (200ml/acre) if rust pustules appear on leaves.',
  },
  {
    name: 'Cotton',
    soils: ['black', 'alluvial'],
    seasons: ['kharif'],
    water: 'medium',
    yield: '8-12 quintals/acre',
    fertilizers: 'Basal application of NPK (20:20:10). Apply nitrogenous fertilizers in splits during squaring and flowering stages.',
    irrigation: 'Protect crop from waterlogging. Regular irrigation at flowering and boll formation stages is vital.',
    pests: 'Major threat from Pink Bollworm and Whiteflies. Use pheromone traps for monitoring. Avoid excessive nitrogen which attracts sucking pests.',
  },
  {
    name: 'Maize (Corn)',
    soils: ['loamy', 'sandy', 'alluvial'],
    seasons: ['kharif', 'rabi'],
    water: 'medium',
    yield: '24-28 quintals/acre',
    fertilizers: 'High nitrogen responder. Apply NPK (10:26:26) at sowing, followed by Urea splits at knee-height and tasseling stages.',
    irrigation: 'Critical moisture stages are flowering (tasseling/silking) and grain filling. Avoid water logging.',
    pests: 'Highly susceptible to Fall Armyworm. Apply Bacillus thuringiensis (Bt) or spray Spinetoram at early whorl stage if infestation is seen.',
  },
  {
    name: 'Groundnut',
    soils: ['sandy', 'loamy'],
    seasons: ['kharif', 'zaid'],
    water: 'low',
    yield: '10-14 quintals/acre',
    fertilizers: 'Apply Gypsum (200kg/acre) at pegging stage (40-45 days) to supply calcium for pod development. Use seed treatment with Rhizobium.',
    irrigation: 'Usually rainfed in Kharif. For irrigated crops, maintain light irrigations. Avoid watering during peak flowering.',
    pests: 'Inspect for White Grub and Leaf Miner. Apply Trichoderma bio-pesticide to soil. Hand-pick larvae from leaves.',
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { soilType, season, location, waterAvailability } = body;

    if (!soilType || !season || !waterAvailability) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const ai = await getGenkitInstance();

    if (ai) {
      // Live Gemini recommendation using Genkit
      const prompt = `You are an expert AI Crop Advisor for GramVikas Portal, helping farmers make data-driven decisions.
Analyze the following parameters:
- Soil Type: ${soilType}
- Season: ${season}
- Location/Region: ${location || 'General Village'}
- Water Availability: ${waterAvailability}

Based on these, suggest the single best crop.
Return your response in STRICT JSON format with exactly the following keys, and nothing else (no markdown wrappers, no backticks, no comments, just valid parseable JSON):
{
  "bestCrop": "Name of the crop",
  "expectedYield": "Estimated yield range per acre",
  "fertilizerSuggestion": "Recommended fertilizer timeline and dosage details",
  "irrigationAdvice": "Optimal water management and watering stages",
  "pestPrevention": "Common pests and prevention tips"
}`;

      try {
        const response = await ai.generate({
          model: 'googleai/gemini-1.5-flash',
          prompt: prompt,
          config: {
            temperature: 0.2,
          }
        });

        const textOutput = response.text.trim();
        // Extract JSON if wrapped in markdown
        const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : textOutput);
        
        return NextResponse.json({ success: true, data: parsed, source: 'Gemini 1.5 Flash' });
      } catch (err) {
        console.error('Gemini call failed, falling back to local model:', err);
      }
    }

    // Local / Fallback rule-based match
    const selectedSoil = soilType.toLowerCase();
    const selectedSeason = season.toLowerCase();
    const selectedWater = waterAvailability.toLowerCase();

    // Try to find the best matching crop
    let bestMatch = fallbackCrops.find(
      (c) =>
        c.soils.includes(selectedSoil) &&
        c.seasons.includes(selectedSeason) &&
        (c.water === selectedWater || selectedWater === 'high' || (c.water === 'medium' && selectedWater === 'low'))
    );

    // If no perfect match, find by soil, then by season
    if (!bestMatch) {
      bestMatch = fallbackCrops.find((c) => c.soils.includes(selectedSoil));
    }
    if (!bestMatch) {
      bestMatch = fallbackCrops.find((c) => c.seasons.includes(selectedSeason));
    }
    if (!bestMatch) {
      bestMatch = fallbackCrops[0]; // fallback to default (Rice)
    }

    const recommendation = {
      bestCrop: `${bestMatch.name} (Recommended for ${soilType} soil in ${season})`,
      expectedYield: bestMatch.yield,
      fertilizerSuggestion: bestMatch.fertilizers,
      irrigationAdvice: bestMatch.irrigation,
      pestPrevention: bestMatch.pests,
    };

    return NextResponse.json({
      success: true,
      data: recommendation,
      source: 'Local Rule Engine (Offline Fallback)'
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
