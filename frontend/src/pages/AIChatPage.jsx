import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, RotateCcw } from 'lucide-react';
import api from '../services/api';
import ChatMessage from '../components/ChatMessage';
import '../assets/AI.css';

const AIChatPage = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your CampusBridge AI Mentor. How can I help with your studies or career today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send conversation history along with new message
      const res = await api.post('/ai/chat', { 
        message: input,
        history: messages.slice(-6) // Send last 6 messages for context
      });
      
      const aiResponse = { role: 'assistant', content: res.data.response };
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([{ role: 'assistant', content: "Hello! I'm your CampusBridge AI Mentor. How can I help with your studies or career today?" }]);
  };

  return (
    <div className="chat-container">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            AI Assistant <Sparkles className="text-indigo-500" />
          </h1>
          <p className="text-slate-500 italic">24/7 academic & career guidance</p>
        </div>
        <button 
          onClick={resetChat}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-semibold transition-all"
        >
          <RotateCcw size={18} /> Reset
        </button>
      </div>

      <div className="chat-box">
        <div className="messages-area">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {loading && (
            <div className="message-bubble message-ai">
              <div className="ai-badge"><Bot size={14} /> Mentor AI</div>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            className="chat-input"
            placeholder="Ask anything about your courses, career, or platform resources..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button className="send-btn" disabled={loading || !input.trim()}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatPage;
