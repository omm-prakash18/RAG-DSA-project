// Gemini API Integration
const GEMINI_CONFIG = {
  apiKey: localStorage.getItem('') || '',
  apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  model: 'gemini-pro',
};

function configureAPI(apiKey) {
  GEMINI_CONFIG.apiKey = apiKey;
  localStorage.setItem('gemini_api_key', apiKey);
}

function getAPIKey() {
  return GEMINI_CONFIG.apiKey || localStorage.getItem('gemini_api_key') || '';
}

async function askGemini(prompt) {
  const apiKey = getAPIKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  try {
    const response = await fetch(`${GEMINI_CONFIG.apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ]
      })
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let error = {};
      
      try {
        error = contentType && contentType.includes('application/json') ? await response.json() : {};
      } catch (e) {
        // Response is not JSON
      }
      
      if (response.status === 400) throw new Error('INVALID_API_KEY');
      if (response.status === 429) throw new Error('RATE_LIMIT');
      if (response.status === 401 || response.status === 403) throw new Error('INVALID_API_KEY');
      throw new Error(error.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      if (data.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error('CONTENT_BLOCKED');
      }
      throw new Error('NO_RESPONSE');
    }
    
    return content;
  } catch (err) {
    if (err.message.startsWith('API Error') || err.message === 'INVALID_API_KEY' || err.message === 'RATE_LIMIT' || err.message === 'NO_API_KEY' || err.message === 'CONTENT_BLOCKED' || err.message === 'NO_RESPONSE') {
      throw err;
    }
    throw new Error('NETWORK_ERROR');
  }
}

async function getDSAHelp(problem, userCode, doubt) {
  const prompt = `You are an expert DSA tutor helping a student learn algorithms and data structures.

Problem: "${problem.title}" (${problem.difficulty} - ${problem.category})

Problem Description: ${problem.description.replace(/<[^>]*>/g, '')}

Student's current code:
\`\`\`
${userCode || 'No code written yet'}
\`\`\`

Student's question/doubt: "${doubt}"

Instructions:
- Use the Socratic method - guide with questions rather than giving answers directly
- Be encouraging and supportive
- If they have code, spot bugs gently
- Suggest the right direction without spoiling the solution
- Keep responses concise (under 200 words)
- Format code blocks properly
- Mention time/space complexity when relevant

Respond as a helpful tutor:`;

  return await askGemini(prompt);
}

async function explainSolution(problem) {
  const prompt = `You are an expert DSA tutor. Give a clear, pedagogical explanation for this problem.

Problem: "${problem.title}" (${problem.difficulty} - ${problem.category})
Description: ${problem.description.replace(/<[^>]*>/g, '')}

Provide:
1. **Intuition** - The key insight in simple words (use an analogy if helpful)
2. **Approach** - Step by step strategy (no code yet)
3. **Algorithm** - Concrete steps with a brief pseudocode
4. **Complexity** - Time and Space complexity with explanation
5. **Common Mistakes** - 1-2 pitfalls to avoid

Keep it educational and engaging. Use markdown formatting.`;

  return await askGemini(prompt);
}

async function generateHints(problem, level = 1) {
  const prompt = `You are a DSA tutor. Generate hint level ${level} of 3 for this problem.

Problem: "${problem.title}" (${problem.difficulty} - ${problem.category})
Description: ${problem.description.replace(/<[^>]*>/g, '')}

Hint levels:
- Level 1: Very subtle - just nudges thinking in the right direction (1-2 sentences)
- Level 2: More specific - mentions the right data structure or technique (2-3 sentences)  
- Level 3: Almost gives it away - describes the key algorithm step (3-4 sentences)

Provide ONLY hint level ${level}. Don't reveal the full solution. Be concise.`;

  return await askGemini(prompt);
}

async function debugCode(problem, code, error, language) {
  const prompt = `You are an expert ${language} programmer and DSA tutor.

Problem: "${problem.title}"
Language: ${language}

Student's Code:
\`\`\`${language}
${code}
\`\`\`

Error/Issue: "${error || 'Code gives wrong output'}"

Please:
1. Identify the specific bug(s)
2. Explain WHY it's a bug
3. Show the corrected version
4. Explain what changed

Be educational - help them understand, don't just give the fix.`;

  return await askGemini(prompt);
}

async function analyzeComplexity(problem, code, language) {
  const prompt = `Analyze the time and space complexity of this ${language} solution.

Problem: "${problem.title}"

Code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. **Time Complexity**: O(?) with detailed explanation of why
2. **Space Complexity**: O(?) with detailed explanation
3. **Is this optimal?** - Is there a better complexity possible?
4. **Optimization suggestions** if the solution isn't optimal

Use clear mathematical reasoning.`;

  return await askGemini(prompt);
}

async function visualizeAlgorithm(problem, code) {
  const prompt = `Create a step-by-step text visualization of how this algorithm works.

Problem: "${problem.title}"
Description: ${problem.description.replace(/<[^>]*>/g, '')}

Use the first example input to trace through the algorithm step by step.
Use ASCII art / text diagrams to show the data structure state at each step.
Make it visual and easy to follow.

Example format:
Step 1: [describe action]
  State: [show data structure]
  
Keep it clear and educational.`;

  return await askGemini(prompt);
}

async function getGeneralDSAHelp(question) {
  const prompt = `You are an expert DSA tutor. Answer this data structures and algorithms question:

"${question}"

Be helpful, accurate, and educational. Use examples. Format with markdown.
If it involves code, provide clear examples. Mention complexity when relevant.
Keep response under 300 words unless more detail is truly needed.`;

  return await askGemini(prompt);
}

// Rate limiting
const rateLimiter = {
  calls: [],
  maxCalls: 10,
  windowMs: 60000,
  
  canCall() {
    const now = Date.now();
    // Remove old calls outside the window
    this.calls = this.calls.filter(t => !isNaN(t) && (now - t) < this.windowMs);
    return this.calls.length < this.maxCalls;
  },
  
  record() {
    this.calls.push(Date.now());
  },

  reset() {
    this.calls = [];
  }
};

async function safeAskGemini(fn) {
  if (!rateLimiter.canCall()) {
    throw new Error('RATE_LIMIT_LOCAL');
  }
  try {
    rateLimiter.record();
    return await fn();
  } catch (err) {
    throw err;
  }
}
