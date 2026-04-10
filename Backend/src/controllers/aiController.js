const Groq = require('groq-sdk');
const Resource = require('../models/Resource');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// @desc    Get AI chat response with platform context
// @route   POST /api/ai/chat
// @access  Private
const getAIResponse = async (req, res) => {
  const { message, history } = req.body;

  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is missing from environment variables');
    return res.status(500).json({ message: 'AI Configuration error' });
  }

  if (!message) {
    return res.status(400).json({ message: 'Please provide a message' });
  }

  try {
    // 1. Fetch academic resource context
    const resources = await Resource.find().sort({ upvotes: -1 }).limit(10).select('title category subject');
    const resourceContext = resources.map(r => `- [${r.category}] ${r.title} (${r.subject})`).join('\n');

    // 2. Build the system prompt
    const systemPrompt = `You are the CampusBridge AI Mentor, a helpful assistant for college students.
    Your goal is to provide academic guidance, career advice, and technical help.
    
    CRITICAL CONTEXT:
    The platform currently has the following academic resources uploaded by students/alumni:
    ${resourceContext || "No resources uploaded yet."}
    
    Whenever a student asks for notes or study materials, check this list and refer them to the relevant resource by its exact title.
    
    Tone: Encouraging, professional, and clear. Use Markdown for formatting and code blocks if needed.`;

    // 3. Prepare messages for Groq
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message }
    ];

    // 4. Call Groq
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const aiMessage = chatCompletion.choices[0].message.content;

    res.json({ response: aiMessage });
  } catch (error) {
    console.error('AI Service Error details:', error.message || error);
    res.status(500).json({ 
      message: 'AI Assistant is currently busy. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

module.exports = { getAIResponse };
