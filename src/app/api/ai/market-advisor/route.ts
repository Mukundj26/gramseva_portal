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

// Simulated APMC Mandi database for regional markets in Maharashtra
// All prices in INR per Quintal (100 kg)
export const mandiDatabase: Record<string, any> = {
  sugarcane: {
    mumbai: { min: 310, max: 350, modal: 330 }, // Sugarcane prices are usually per ton/quintal support
    pune: { min: 320, max: 360, modal: 345 },
    nashik: { min: 290, max: 340, modal: 315 },
    nagpur: { min: 300, max: 350, modal: 325 },
    history: [300, 310, 320, 335, 345, 330] // Jan to June modal prices
  },
  onion: {
    mumbai: { min: 1800, max: 2400, modal: 2100 },
    pune: { min: 1700, max: 2200, modal: 1950 },
    nashik: { min: 2000, max: 2700, modal: 2400 }, // Nashik is major onion hub
    nagpur: { min: 1600, max: 2100, modal: 1800 },
    history: [1500, 1700, 2200, 2600, 2500, 2100]
  },
  tomato: {
    mumbai: { min: 2500, max: 3500, modal: 3100 },
    pune: { min: 2200, max: 3000, modal: 2600 },
    nashik: { min: 2100, max: 2900, modal: 2500 },
    nagpur: { min: 2400, max: 3300, modal: 2850 },
    history: [1800, 2000, 2400, 2900, 3300, 3100]
  },
  potato: {
    mumbai: { min: 1400, max: 1900, modal: 1650 },
    pune: { min: 1300, max: 1800, modal: 1550 },
    nashik: { min: 1200, max: 1700, modal: 1450 },
    nagpur: { min: 1500, max: 2100, modal: 1800 },
    history: [1400, 1500, 1600, 1750, 1800, 1650]
  },
  wheat: {
    mumbai: { min: 2400, max: 2900, modal: 2650 },
    pune: { min: 2300, max: 2800, modal: 2550 },
    nashik: { min: 2200, max: 2700, modal: 2450 },
    nagpur: { min: 2500, max: 3100, modal: 2800 }, // Nagpur has high wheat flow
    history: [2200, 2350, 2500, 2700, 2800, 2650]
  },
  rice: {
    mumbai: { min: 3200, max: 4500, modal: 3850 },
    pune: { min: 3100, max: 4200, modal: 3600 },
    nashik: { min: 3000, max: 4000, modal: 3500 },
    nagpur: { min: 3400, max: 4800, modal: 4100 },
    history: [3400, 3600, 3700, 3950, 4100, 3850]
  },
  chilli: {
    mumbai: { min: 7000, max: 9500, modal: 8200 },
    pune: { min: 6800, max: 9000, modal: 7900 },
    nashik: { min: 6500, max: 8800, modal: 7600 },
    nagpur: { min: 7500, max: 10500, modal: 9000 },
    history: [6800, 7200, 7800, 8500, 9500, 8200]
  },
  mango: {
    mumbai: { min: 8000, max: 14000, modal: 11000 }, // Premium Alphonso
    pune: { min: 7500, max: 12000, modal: 9500 },
    nashik: { min: 6000, max: 10000, modal: 8000 },
    nagpur: { min: 7000, max: 11000, modal: 9000 },
    history: [5000, 7000, 9500, 12000, 11000, 11000]
  },
  banana: {
    mumbai: { min: 1400, max: 2100, modal: 1750 },
    pune: { min: 1300, max: 1900, modal: 1600 },
    nashik: { min: 1500, max: 2300, modal: 1900 }, // Jalgaon/Nashik zone
    nagpur: { min: 1200, max: 1800, modal: 1500 },
    history: [1300, 1450, 1600, 1850, 1900, 1750]
  },
  okra: {
    mumbai: { min: 2800, max: 3800, modal: 3300 },
    pune: { min: 2600, max: 3500, modal: 3000 },
    nashik: { min: 2400, max: 3200, modal: 2800 },
    nagpur: { min: 2700, max: 3600, modal: 3100 },
    history: [2200, 2400, 2800, 3100, 3300, 3300]
  }
};

export async function POST(req: Request) {
  try {
    const { crop } = await req.json();

    const cleanCrop = (crop ? crop.toLowerCase() : 'rice') as string;
    const cropPrices = mandiDatabase[cleanCrop] || mandiDatabase['rice'];

    const ai = await getGenkitInstance();

    if (ai) {
      try {
        const prompt = `You are a regional agriculture market pricing analyst helping Indian farmers maximize profits.
        We have Mandi Pricing data for the crop "${cleanCrop}" across Maharashtra APMCs (INR/Quintal):
        - Mumbai APMC: Min ₹${cropPrices.mumbai.min}, Max ₹${cropPrices.mumbai.max}, Modal ₹${cropPrices.mumbai.modal}
        - Pune APMC: Min ₹${cropPrices.pune.min}, Max ₹${cropPrices.pune.max}, Modal ₹${cropPrices.pune.modal}
        - Nashik APMC: Min ₹${cropPrices.nashik.min}, Max ₹${cropPrices.nashik.max}, Modal ₹${cropPrices.nashik.modal}
        - Nagpur APMC: Min ₹${cropPrices.nagpur.min}, Max ₹${cropPrices.nagpur.max}, Modal ₹${cropPrices.nagpur.modal}
        
        Historical Monthly Modal Prices (Jan-June 2026): ${JSON.stringify(cropPrices.history)}

        Tasks:
        1. Identify the highest-paying APMC and formulate the Best Market Recommendation (with logical reasons e.g., transport costs vs premium rates).
        2. Analyze the 6-month historical trend and formulate Selling Time Suggestions (e.g. should they sell now, wait, store, or sell in phases?).
        
        Return your response in STRICT JSON format with exactly the following keys:
        {
          "bestMarketName": "Name of best market",
          "bestMarketPrice": 3800,
          "recommendationReason": "Detailed reason why this market is recommended...",
          "sellingTimeAdvice": "Strategic advice on whether to sell now or store, mentioning price fluctuations..."
        }`;

        const response = await ai.generate({
          model: 'googleai/gemini-2.5-flash',
          prompt: prompt,
          config: {
            temperature: 0.3,
          }
        });

        const textOutput = response.text.trim();
        const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : textOutput);

        return NextResponse.json({
          success: true,
          prices: cropPrices,
          advice: parsed,
          source: 'Gemini 1.5 Flash'
        });
      } catch (err) {
        console.error('Gemini market advisor failed, falling back:', err);
      }
    }

    // Heuristic Local / Offline Recommendation Logic
    let bestMarketName = 'Mumbai APMC';
    let bestMarketPrice = cropPrices.mumbai.modal;
    let recommendationReason = 'Mumbai APMC consistently exhibits the highest modal rates due to high metropolitan demand and premium grading standards. Recommended for bulk shipments.';
    let sellingTimeAdvice = 'Current market prices are stable. We recommend selling 70% of the yield immediately. Retain the remaining 30% in dry storage for 3 weeks to capitalize on post-harvest supply reductions.';

    // Rule: Find APMC with maximum modal price
    const apmcs = [
      { name: 'Mumbai APMC', price: cropPrices.mumbai.modal, reason: 'High retail metropolitan demand and bulk consumer base. Worth the extra transport cost.' },
      { name: 'Pune APMC', price: cropPrices.pune.modal, reason: 'Strong regional distribution center. Low warehousing costs.' },
      { name: 'Nashik APMC', price: cropPrices.nashik.modal, reason: 'Major wholesale sorting hub. Best for onions, tomatoes, and vegetables.' },
      { name: 'Nagpur APMC', price: cropPrices.nagpur.modal, reason: 'Direct trade channel to central and north Indian grain corridors.' }
    ];

    apmcs.sort((a, b) => b.price - a.price);
    bestMarketName = apmcs[0].name;
    bestMarketPrice = apmcs[0].price;
    recommendationReason = `We recommend ${bestMarketName} because it offers the highest modal price of ₹${bestMarketPrice}/quintal. ${apmcs[0].reason}`;

    // Heuristics for Selling Time Suggestions based on crop type
    if (cleanCrop === 'onion') {
      sellingTimeAdvice = 'Onion prices have historically fluctuated drastically. Looking at the Nashik hub trends, prices tend to surge by 15-20% towards late August. Hold your stock in ventilated onions sheds (Kanda Chawl) if possible and sell in mid-September.';
    } else if (cleanCrop === 'sugarcane') {
      sellingTimeAdvice = 'Sugarcane should be harvested and transported to the cooperative sugar mills within 24 hours of cutting to prevent weight loss and sugar recovery drops. Do not hold stock.';
    } else if (cleanCrop === 'tomato') {
      sellingTimeAdvice = 'Tomatoes are highly perishable. Current prices are high, but delay will lead to spoilage. Sell 100% of the harvest immediately to local cold-chain vendors or the Mumbai APMC.';
    } else if (cleanCrop === 'wheat' || cleanCrop === 'rice') {
      sellingTimeAdvice = 'Grain prices are currently stable. Since storage is relatively straightforward, you can hold 40% of the bag stocks for up to 2 months. Grains generally gain value during dry winter spells.';
    }

    const mockAdvice = {
      bestMarketName,
      bestMarketPrice,
      recommendationReason,
      sellingTimeAdvice
    };

    return NextResponse.json({
      success: true,
      prices: cropPrices,
      advice: mockAdvice,
      source: 'Local Heuristic Market Engine (Offline)'
    });
  } catch (error: any) {
    console.error('Market Advisor API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
