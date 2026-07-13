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

// Global reference database of schemes
const fallbackSchemes = [
  {
    name: 'PM-Kisan Samman Nidhi',
    description: 'Central sector income support scheme providing direct bank transfers to landholding farmer families.',
    benefits: '₹6,000 per year paid in three equal installments of ₹2,000 every 4 months.',
    checkEligibility: (income: number, land: number, category: string) => {
      return land <= 5 && income <= 1000000 && (category === 'small' || category === 'marginal');
    },
    reason: 'Recommended because you are a small/marginal farmer holding less than 5 acres of cultivable land, making you eligible for annual direct income support.'
  },
  {
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'A comprehensive crop insurance scheme protecting farmers against crop failures due to natural calamities, pests, and diseases.',
    benefits: 'Yield loss coverage with lowest-ever premiums (1.5% for Rabi, 2% for Kharif crops).',
    checkEligibility: () => true, // open to all
    reason: 'Recommended for all active crop cycles to secure your investments against unpredictable weather events, droughts, or pest outbreaks.'
  },
  {
    name: 'Soil Health Card Scheme',
    description: 'Promotes soil nutrient analysis to customize chemical and organic fertilizer usage.',
    benefits: 'Free physical soil report cards issued every 2 years, outlining macro-nutrients and corrective fertilizers.',
    checkEligibility: () => true, // open to all
    reason: 'Recommended to help you understand your soil health status and save input costs on unnecessary fertilizers.'
  },
  {
    name: 'Kisan Credit Card (KCC)',
    description: 'Short-term institutional credit program designed to meet cultivation expenses, post-harvest needs, and domestic consumption.',
    benefits: 'Flexible credit limit up to ₹3 Lakhs with simplified loan terms and low interest rates (4% after prompt repayment interest subvention).',
    checkEligibility: () => true, // open to all
    reason: 'Recommended to provide you with hassle-free access to short-term farming loans at highly subsidized interest rates, freeing you from local money lenders.'
  },
  {
    name: 'GramVikas Organic Farming Subsidy',
    description: 'Village Panchayat green fund promoting bio-farming practices and organic crop growth.',
    benefits: '50% direct subsidy up to ₹15,000 for constructing vermicompost beds and bio-fertilizer stocks.',
    checkEligibility: (income: number, land: number, category: string) => {
      return land <= 3 && income <= 300000 && (category === 'small' || category === 'marginal');
    },
    reason: 'Recommended because your land size (<= 3 acres) and income bracket make you eligible for our Panchayat-specific financial subsidy to establish eco-friendly organic farming units.'
  },
  {
    name: 'PMKSY - Micro Irrigation Subsidy',
    description: 'Financial assistance scheme for implementing modern drip and sprinkler irrigation systems.',
    benefits: 'Up to 55% direct capital subsidy on installation costs for small/marginal farmers, and 45% for other farmers.',
    checkEligibility: (income: number, land: number, category: string) => {
      return land <= 10;
    },
    reason: 'Recommended to help you implement modern, water-saving drip or sprinkler irrigation technologies with up to 55% direct financial subsidy from the government.'
  },
  {
    name: 'PM-Kusum Solar Pump Scheme',
    description: 'Solar energy support scheme for installing subsidized solar water pumps and solarizing grid-connected agricultural pumps.',
    benefits: '60% overall capital subsidy (30% central + 30% state gov), with bank loans covering 30% and farmer contribution of only 10%.',
    checkEligibility: () => true,
    reason: 'Recommended to help you install a highly subsidized solar-powered water pump, freeing you from diesel costs and power cut issues for daytime irrigation.'
  },
  {
    name: 'SMAM Tractor & Farm Implement Subsidy',
    description: 'Central sector scheme for promoting agricultural mechanization and custom hiring centers.',
    benefits: '40% to 50% direct financial subsidy on the purchase of tractors, rotavators, power tillers, and sowing drills.',
    checkEligibility: (income: number, land: number, category: string) => {
      return land <= 5 && (category === 'small' || category === 'marginal');
    },
    reason: 'Recommended because as a small/marginal farmer holding under 5 acres, you qualify for 50% financial subsidy on agricultural machinery to increase farm productivity.'
  },
  {
    name: 'National Horticulture Mission (NHM)',
    description: 'Development program targeting holistic growth of the horticulture sector (fruits, vegetables, flowers, spices).',
    benefits: '50% capital subsidy (up to ₹3 Lakhs) for polyhouse/greenhouse construction, nursery setup, and cold storage units.',
    checkEligibility: (income: number, land: number, category: string) => {
      return income <= 600000;
    },
    reason: 'Recommended to support diversification into high-yield fruit orchards or protected polyhouse vegetable farming with substantial capital subsidies.'
  },
  {
    name: 'National Livestock Mission (NLM)',
    description: 'Financial support program encouraging entrepreneurs and farmers to establish dairy, poultry, and goat rearing units.',
    benefits: '25% capital subsidy (33.3% for SC/ST categories) on bank loans for purchasing crossbred cattle, building sheds, and feed management.',
    checkEligibility: (income: number, land: number, category: string) => {
      return income <= 400000;
    },
    reason: 'Recommended to provide auxiliary income security by setting up a dairy or goat farming unit with up to 33% capital subsidy on livestock procurement.'
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { income, landSize, cropType, category } = body;

    const parsedIncome = Number(income) || 0;
    const parsedLand = Number(landSize) || 0;
    const normalizedCategory = (category || 'marginal').toLowerCase();

    const ai = await getGenkitInstance();

    if (ai) {
      const prompt = `You are a Government Scheme Advisor for GramVikas Portal.
Analyze this farmer profile:
- Annual Income: ₹${parsedIncome}
- Land Size: ${parsedLand} acres
- Active Crop: ${cropType || 'Not specified'}
- Farmer Category: ${normalizedCategory}

We have the following list of scheme structures:
1. PM-Kisan Samman Nidhi: Eligible if land <= 5 acres, income <= 10 Lakhs, category is small/marginal.
2. PM Fasal Bima Yojana (PMFBY): Eligible for all active crop cycles.
3. Soil Health Card Scheme: Eligible for all farmers.
4. Kisan Credit Card (KCC): Eligible for all farmers.
5. GramVikas Organic Subsidy: Eligible if land <= 3 acres, income <= 3 Lakhs, category is small/marginal.

Evaluate which schemes this farmer is eligible for.
Return the eligible schemes in STRICT JSON format as a list of objects with the keys 'name', 'description', 'benefits', and 'whyRecommended'.
Do not wrap the output in markdown block format. Output only the raw parseable JSON array. Example:
[
  {
    "name": "Scheme Name",
    "description": "Scheme details...",
    "benefits": "Financial aid details...",
    "whyRecommended": "Reasoning why this fits their profile..."
  }
]`;

      try {
        const response = await ai.generate({
          model: 'googleai/gemini-2.5-flash',
          prompt: prompt,
          config: {
            temperature: 0.1,
          }
        });

        const textOutput = response.text.trim();
        const jsonMatch = textOutput.match(/\[[\s\S]*\]/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : textOutput);

        return NextResponse.json({ success: true, data: parsed, source: 'Gemini 1.5 Flash' });
      } catch (err) {
        console.error('Gemini scheme suggestion failed, using local model:', err);
      }
    }

    // Local filter matching
    const eligibleSchemes = fallbackSchemes
      .filter((scheme) => scheme.checkEligibility(parsedIncome, parsedLand, normalizedCategory))
      .map((scheme) => ({
        name: scheme.name,
        description: scheme.description,
        benefits: scheme.benefits,
        whyRecommended: scheme.reason,
      }));

    return NextResponse.json({
      success: true,
      data: eligibleSchemes,
      source: 'Local Rule Engine (Offline Fallback)'
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
