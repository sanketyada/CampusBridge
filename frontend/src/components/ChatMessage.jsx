import { Bot, User } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const isAI = message.role === 'assistant';

  return (
    <div className={`message-bubble ${isAI ? 'message-ai' : 'message-user'}`}>
      {isAI && (
        <div className="ai-badge">
          <Bot size={14} />
          Mentor AI
        </div>
      )}
      <div className="message-text">
        {/* Simple text with line breaks, could use react-markdown for full support */}
        {message.content.split('\n').map((line, i) => (
          <p key={i} className={line === '' ? 'h-2' : ''}>{line}</p>
        ))}
      </div>
    </div>
  );
};

export default ChatMessage;
