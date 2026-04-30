const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = 'AIzaSyDkXm_gh3BzcCspwKnW27bHUA5vzk2A1-M';
const MODEL = 'gemini-1.5-flash-latest';

async function testGemini() {
  try {
    const client = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = client.getGenerativeModel({ 
      model: 'gemini-1.5-flash-latest',
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 600,
        responseMimeType: 'application/json',
      },
    });
    
    const prompt = `A new user just finished Phantom onboarding. Refine their seed into a starting point for Phase 01.

What they're building: """A short course that helps neurodivergent freelancers price their work without negotiating against themselves."""
They identify as: creator
Have they built in public before? no

Return JSON: { "refined_problem": string, "suggested_name": string }
- refined_problem: A first-pass problem statement in Phantom format ("I help [X] who is experiencing [Y] to achieve [Z] without [W]"). It does not need to be perfect — it needs to be specific enough that the user can react to it and tighten it. Use their words where possible.
- suggested_name: A short functional working name for the test (not a final brand). 1-3 words.`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Raw response:', text);
    const parsed = JSON.parse(text);
    console.log('Parsed JSON:', parsed);
    console.log('\n✅ Gemini integration working!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  }
}

testGemini();
