import { useState, FormEvent } from 'react';
import { ShugBotAPI } from '@/lib/shugbot/api';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const ShugBotModal = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const shugbotAPI = new ShugBotAPI();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Get bot response
    const response = await shugbotAPI.processMessage(inputValue, {
      currentPage: window.location.pathname
    });

    setMessages(prev => [...prev, response]);
  };

  return (
    <div className="fixed bottom-4 right-4">
      {/* Bot Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-white rounded-full p-3"
      >
        {isOpen ? 'Close ShugBot' : 'Open ShugBot'}
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl">
          {/* Chat Header */}
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">ShugBot Assistant</h3>
          </div>

          {/* Messages Area */}
          <div className="h-[480px] overflow-y-auto p-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`mb-4 ${
                  msg.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div className={`inline-block p-3 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit}>
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask ShugBot..."
                className="w-full p-2 border rounded"
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 