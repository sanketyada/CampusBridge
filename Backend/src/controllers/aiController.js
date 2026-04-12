const Groq = require('groq-sdk');
const Resource = require('../models/Resource');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Helper for calling Groq
const callGroq = async (systemPrompt, userMessage, temperature = 0.7, maxTokens = 1024) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing');
  }

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature,
    max_tokens: maxTokens,
    top_p: 1,
    stream: false,
  });

  return chatCompletion.choices[0].message.content;
};

// @desc    Get AI chat response with platform context
// @route   POST /api/ai/chat
// @access  Private
const getAIResponse = async (req, res) => {
  const { message, history } = req.body;
  const user = req.user;

  if (!message) {
    return res.status(400).json({ message: 'Please provide a message' });
  }

  try {
    const resources = await Resource.find().sort({ upvotes: -1 }).limit(10).select('title category subject');
    const resourceContext = resources.map(r => `- [${r.category}] ${r.title} (${r.subject})`).join('\n');

    const systemPrompt = `You are the CampusBridge AI Companion. You are more than just a bot; you are a supportive, emotionally intelligent, and friendly mentor for college students.
    
    USER INFO:
    - Name: ${user.name}
    - Role: ${user.role}
    - Department: ${user.department || 'General'}
    - Year: ${user.yearOfStudy || 'N/A'}

    CURRENT RESOURCES ON PLATFORM:
    ${resourceContext || "No resources uploaded yet."}
    
    TONE & STYLE:
    - Empowering and encouraging.
    - Use student's name occasionally.
    - Provide accurate academic guidance, career advice, and technical help.
    - If they use abusive language, gently remind them of campus decorum.
    - Use Markdown for formatting.`;

    const aiMessage = await callGroq(systemPrompt, message);
    res.json({ response: aiMessage });
  } catch (error) {
    console.error('AI Error:', error.message);
    res.status(500).json({ message: 'AI Assistant is currently busy.' });
  }
};

// @desc    Generate Summary of a resource
// @route   POST /api/ai/generate-summary
// @access  Private
const generateSummary = async (req, res) => {
  const { resourceId, content } = req.body;
  try {
    const systemPrompt = `You are an academic expert. Generate a concise, high-impact summary of the following academic resource content. Use bullet points for key takeaways.`;
    const response = await callGroq(systemPrompt, `Content: ${content}`);
    res.json({ result: response });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate summary' });
  }
};

// @desc    Generate Notes from a resource
// @route   POST /api/ai/generate-notes
// @access  Private
const generateNotes = async (req, res) => {
  const { content } = req.body;
  try {
    const systemPrompt = `You are an expert tutor. Transform the following text into structured, easy-to-read study notes with headings and sub-headings. Focus on clarity and retention.`;
    const response = await callGroq(systemPrompt, `Content: ${content}`);
    res.json({ result: response });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate notes' });
  }
};

// @desc    Generate Question Paper from a resource
// @route   POST /api/ai/generate-questions
// @access  Private
const generateQuestionPaper = async (req, res) => {
  const { content } = req.body;
  try {
    const systemPrompt = `You are a college professor. Based on the provided content, generate a mock question paper. Include multiple choice questions, short answer questions, and one long explanation question. Provide an answer key at the end.`;
    const response = await callGroq(systemPrompt, `Content: ${content}`);
    res.json({ result: response });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate question paper' });
  }
};

// @desc    Generate Mind Map description from a resource
// @route   POST /api/ai/generate-mindmap
// @access  Private
const generateMindMap = async (req, res) => {
  const { content } = req.body;
  try {
    const systemPrompt = `You are a visual learning expert. Based on the text provided, create a structured hierarchical list that can be used to build a Mind Map. Group related concepts logically.`;
    const response = await callGroq(systemPrompt, `Content: ${content}`);
    res.json({ result: response });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate mind map' });
  }
};

module.exports = { 
  getAIResponse,
  generateSummary,
  generateNotes,
  generateQuestionPaper,
  generateMindMap
};
