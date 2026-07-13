import { NextResponse } from 'next/server';

// Lazy load Genkit
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { temp, wind, rain, humidity, condition, activeCrop, soilType } = body;

    const ai = await getGenkitInstance();

    if (ai) {
      try {
        const prompt = `You are a professional Agronomist helping farmers optimize their sowing and harvesting based on local weather sensors.
        Analyze this farm profile and current weather telemetry:
        - Soil Type: ${soilType || 'Loamy'}
        - Active Crop: ${activeCrop || 'General Crop'}
        - Temperature: ${temp}°C
        - Wind Speed: ${wind} km/h
        - Rain Probability: ${rain}%
        - Relative Humidity: ${humidity}%
        - General Condition: ${condition || 'Partly Cloudy'}

        Generate 3 specific agricultural advisories:
        1. Sowing & Irrigation strategy: How to irrigate or sow given these conditions.
        2. Fertilizer & Chemical Sprays check: Is it safe to apply fertilizer or weed sprays (taking rain/wind into account)?
        3. Harvest & Storage warnings: How to protect the harvested or mature crop.
        
        Return your response in STRICT JSON format with exactly the following keys:
        {
          "irrigationStrategy": "Advice on watering...",
          "sprayAdvisory": "Advice on spraying fertilizers/chemicals...",
          "harvestStorage": "Advice on crop harvesting and warehousing..."
        }`;

        const response = await ai.generate({
          model: 'googleai/gemini-2.5-flash',
          prompt: prompt,
          config: {
            temperature: 0.2,
          }
        });

        const textOutput = response.text.trim();
        const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : textOutput);

        return NextResponse.json({
          success: true,
          data: parsed,
          source: 'Gemini 1.5 Flash'
        });
      } catch (err) {
        console.error('Gemini weather advisor failed, falling back:', err);
      }
    }

    // Heuristic Local Rule Engine (Offline Fallback)
    const cropStr = activeCrop ? activeCrop.toLowerCase() : 'rice';
    const parsedRain = Number(rain) || 0;
    const parsedWind = Number(wind) || 0;
    const parsedTemp = Number(temp) || 0;

    let irrigationStrategy = 'Standard irrigation cycles. Keep soil moisture at regular levels.';
    let sprayAdvisory = 'Safe for chemical or fertilizer sprays. Wind and rain levels are optimum.';
    let harvestStorage = 'Standard harvest check. Store mature crops in ventilated shelters.';

    // 1. Irrigation rules
    if (parsedRain > 50) {
      irrigationStrategy = 'Suspend irrigation cycles immediately. Rainfall probability is high. Allow natural rain to water the crop and clear field drain lines to prevent logging.';
    } else if (parsedTemp > 35) {
      irrigationStrategy = 'High evaporative loss. Increase watering cycles, irrigating early in the morning or late evening. Maintain moist soil layers to prevent heat shock.';
    } else {
      irrigationStrategy = `Maintain standard irrigation for ${activeCrop || 'your sowed crop'}. Ensure regular water flows in ${soilType || 'loamy'} soil.`;
    }

    // 2. Spraying rules
    if (parsedRain > 40) {
      sprayAdvisory = 'DO NOT apply urea top-dressings or foliar sprays. Rain will wash chemical deposits off leaf surfaces, resulting in nitrogen runoff and financial loss.';
    } else if (parsedWind > 20) {
      sprayAdvisory = `High surface winds of ${parsedWind} km/h will cause severe spray drift. Postpone crop dusting and herbicide sprays to prevent chemical loss and accidental drift to adjacent fields.`;
    } else {
      sprayAdvisory = 'Weather is stable. Ideal window for applying insecticides or fertilizer top-dosing. Spray during morning hours when winds are calm.';
    }

    // 3. Harvest rules
    if (parsedRain > 50) {
      harvestStorage = 'Postpone harvesting of mature crops. If already harvested, wrap bags in waterproof tarpaulins and transport them to elevated concrete storage sheds. Protect grains from damp storage.';
    } else if (parsedRain > 20 && parsedRain <= 50) {
      harvestStorage = 'Humidity is elevated. Keep harvested stalks raised on wooden pallets. Ensure grain moisture is below 12% before packaging to avoid mold.';
    } else {
      harvestStorage = 'Excellent dry window for harvesting and threshing. Grains can be left for sun drying before bagging. Secure sacks in clean, dry warehouses.';
    }

    const advice = {
      irrigationStrategy,
      sprayAdvisory,
      harvestStorage
    };

    return NextResponse.json({
      success: true,
      data: advice,
      source: 'Local Weather Rule Engine (Offline)'
    });
  } catch (error: any) {
    console.error('Weather Advisor API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
