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

// Local rule-based NLP responses for offline/local execution
const localReplies: Record<string, Record<string, string>> = {
  en: {
    hello: "Hello! Welcome to the GramVikas AI Assistant. How can I help you today?",
    scheme: "We have multiple schemes available for farmers, including the PM-Kisan Samman Nidhi (₹6,000 yearly income support), Soil Health Card Scheme, Kisan Credit Card (low-interest loans), and GramVikas Organic Subsidy. To see which ones you qualify for, navigate to the 'Scheme Suggester' tab.",
    certificate: "You can apply for Birth, Death, Income, or Residence certificates directly under the 'Apply Certificate' tab in your dashboard. Once submitted, our Panchayat Admin will verify it.",
    weather: "I can check the weather! Under the 'Weather Station' tab, you can search for any city/village to get live telemetry (Temperature, Humidity, Wind, Rain) and agricultural advice.",
    crop: "For crop recommendations, navigate to the 'AI Crop Advisor' tab. Select your soil type and water availability, and we will recommend the best crop to sow.",
    default: "I am your GramVikas helper. You can ask me about government schemes, certificate applications, crop health, or live weather reports!"
  },
  hi: {
    hello: "नमस्ते! ग्रामविकास एआई सहायक में आपका स्वागत है। आज मैं आपकी क्या मदद कर सकता हूँ?",
    scheme: "हमारे पास किसानों के लिए कई योजनाएं उपलब्ध हैं, जिनमें पीएम-किसान सम्मान निधि (₹6,000 वार्षिक सहायता), मृदा स्वास्थ्य कार्ड योजना, किसान क्रेडिट कार्ड (कम ब्याज ऋण) और ग्रामविकास जैविक सब्सिडी शामिल हैं। पात्रता जांचने के लिए 'योजना सलाहकार' टैब पर जाएं।",
    certificate: "आप अपने डैशबोर्ड में 'प्रमाण पत्र आवेदन' टैब के तहत सीधे जन्म, मृत्यु, आय या निवास प्रमाण पत्र के लिए आवेदन कर सकते हैं। आपके जमा करने के बाद, पंचायत प्रशासक इसका सत्यापन करेंगे।",
    weather: "मैं मौसम की जांच कर सकता हूँ! 'मौसम स्टेशन' टैब के तहत, आप किसी भी शहर/गांव की खोज करके वहां का लाइव मौसम (तापमान, आर्द्रता, हवा, बारिश) और कृषि सलाह प्राप्त कर सकते हैं।",
    crop: "फसल की सिफारिशों के लिए, 'एआई फसल सलाहकार' टैब पर जाएं। अपनी मिट्टी के प्रकार और पानी की उपलब्धता का चयन करें, और हम बोने के लिए सबसे अच्छी फसल की सिफारिश करेंगे।",
    default: "मैं आपका ग्रामविकास सहायक हूँ। आप मुझसे सरकारी योजनाओं, प्रमाण पत्र आवेदनों, फसल स्वास्थ्य या मौसम रिपोर्ट के बारे में पूछ सकते हैं!"
  },
  mr: {
    hello: "नमस्कार! ग्रामविकास एआय सहायकामध्ये आपले स्वागत आहे. आज मी तुम्हाला कशी मदत करू शकतो?",
    scheme: "आमच्याकडे शेतकऱ्यांसाठी अनेक योजना उपलब्ध आहेत, ज्यात पीएम-किसान सन्मान निधी (₹६,००० वार्षिक उत्पन्न साहाय्य), मृदा आरोग्य कार्ड योजना, किसान क्रेडिट कार्ड (कमी व्याज कर्ज) आणि ग्रामविकास सेंद्रिय शेती अनुदान समाविष्ट आहे. पात्रता तपासण्यासाठी 'योजना सल्लागार' टॅबला भेट द्या.",
    certificate: "तुम्ही तुमच्या डॅशबोर्डवरील 'प्रमाणपत्र अर्ज' टॅब अंतर्गत थेट जन्म, मृत्यू, उत्पन्न किंवा रहिवासी प्रमाणपत्रासाठी अर्ज करू शकता. अर्ज सादर केल्यावर, पंचायत प्रशासक त्याचे पडताळणी करतील.",
    weather: "मी हवामान तपासू शकतो! 'हवामान केंद्र' टॅब अंतर्गत, तुम्ही कोणत्याही शहराचे/गावाचे नाव शोधून तेथील हवामान (तापमान, आर्द्रता, वारा, पाऊस) आणि शेती सल्ला मिळवू शकता.",
    crop: "पिकांच्या शिफारसींसाठी, 'एआय पीक सल्लागार' टॅबवर जा. आपल्या मातीचा प्रकार आणि पाण्याची उपलब्धता निवडा, आणि आम्ही सर्वोत्तम पिकाची शिफारस करू.",
    default: "मी तुमचा ग्रामविकास मदतनीस आहे. तुम्ही मला सरकारी योजना, प्रमाणपत्र अर्ज, पिकांचे आरोग्य किंवा हवामान अहवालांविषयी विचारू शकता!"
  }
};

export async function POST(req: Request) {
  try {
    const { message, history, language = 'en' } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const ai = await getGenkitInstance();
    const cleanLang = (['en', 'hi', 'mr'].includes(language) ? language : 'en') as 'en' | 'hi' | 'mr';

    if (ai) {
      try {
        const systemPrompt = `You are a helpful local village assistant for the GramVikas portal.
        You speak and understand English, Hindi, and Marathi.
        Respond to the user in their preferred language: ${cleanLang === 'mr' ? 'Marathi' : cleanLang === 'hi' ? 'Hindi' : 'English'}.
        Keep your response friendly, helpful, and concise (under 3-4 sentences).
        Help citizens apply for certificates (Birth, Death, Income, Residence), check government schemes (PM-Kisan, KCC, Kusum), check weather, diagnose crop diseases, and configure farming parameters.`;

        const response = await ai.generate({
          model: 'googleai/gemini-2.5-flash',
          prompt: `System Prompt: ${systemPrompt}\nUser Query: ${message}`,
          config: {
            temperature: 0.4,
          }
        });

        return NextResponse.json({
          success: true,
          reply: response.text.trim(),
          source: 'Gemini 1.5 Flash'
        });
      } catch (err) {
        console.error('Gemini chat failed, falling back:', err);
      }
    }

    // Local Fallback matching
    const query = message.toLowerCase();
    const replies = localReplies[cleanLang];
    let matchedKey = 'default';

    if (query.includes('hello') || query.includes('hi') || query.includes('नमस्ते') || query.includes('नमस्कार') || query.includes('hello')) {
      matchedKey = 'hello';
    } else if (query.includes('scheme') || query.includes('yojana') || query.includes('योजना') || query.includes('कर्ज') || query.includes('पैसे')) {
      matchedKey = 'scheme';
    } else if (query.includes('cert') || query.includes('apply') || query.includes('document') || query.includes('अर्ज') || query.includes('दाखला') || query.includes('प्रमाण')) {
      matchedKey = 'certificate';
    } else if (query.includes('weather') || query.includes('rain') || query.includes('temp') || query.includes('हवामान') || query.includes('पाऊस') || query.includes('मौसम')) {
      matchedKey = 'weather';
    } else if (query.includes('crop') || query.includes('sow') || query.includes('soil') || query.includes('पीक') || query.includes('माती') || query.includes('फसल')) {
      matchedKey = 'crop';
    }

    return NextResponse.json({
      success: true,
      reply: replies[matchedKey],
      source: 'Local Assistant Engine (Offline)'
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
