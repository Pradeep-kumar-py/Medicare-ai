import React, { useState } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { useLanguage } from '../context/LanguageContext';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your MediCare AI assistant. How can I help you today?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const { t } = useLanguage();

  const quickResponses = [
    { text: 'Find symptoms checker', action: () => window.location.href = '/symptoms' },
    { text: 'Book appointment', action: () => window.location.href = '/appointments' },
    { text: 'Medicine hub', action: () => window.location.href = '/medicine-hub' },
    { text: 'Emergency services', action: () => window.location.href = 'tel:108' },
    { text: 'Health dashboard', action: () => window.location.href = '/dashboard' },
    { text: 'Nearby hospitals', action: () => window.location.href = '/hospital-locator' }
  ];

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('symptom') || lowerMessage.includes('sick') || lowerMessage.includes('pain')) {
      return "I can help you with symptom checking! Visit our Symptoms Checker to get AI-powered analysis and doctor recommendations.";
    }
    if (lowerMessage.includes('appointment') || lowerMessage.includes('doctor') || lowerMessage.includes('book')) {
      return "You can easily book appointments with healthcare professionals. Check our Appointments section for available slots.";
    }
    if (lowerMessage.includes('medicine') || lowerMessage.includes('drug') || lowerMessage.includes('pharmacy')) {
      return "Looking for medicines? Our Medicine Hub can help you find and purchase medicines from trusted online stores.";
    }
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('ambulance')) {
      return "For emergencies, dial 108 immediately. You can also request ambulance pickup through our emergency services.";
    }
    if (lowerMessage.includes('insurance') || lowerMessage.includes('claim') || lowerMessage.includes('policy')) {
      return "Need help with medical insurance? I can guide you through policy information and claim assistance.";
    }
    if (lowerMessage.includes('hospital') || lowerMessage.includes('clinic') || lowerMessage.includes('nearby')) {
      return "Use our Hospital Locator to find nearby healthcare facilities. I can help you locate the closest medical centers.";
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
      return "Hello! I'm here to help you navigate MediCare AI. You can ask me about symptoms, appointments, medicines, or any health-related queries.";
    }
    
    return "I understand you're looking for help. You can ask me about symptoms, booking appointments, finding medicines, emergency services, or navigating our platform. What specific assistance do you need?";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
      timestamp: new Date()
    };

    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: generateBotResponse(input),
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInput('');
  };

  const handleQuickResponse = (response: { text: string; action: () => void }) => {
    response.action();
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
        size="lg"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 sm:w-96 h-[450px] sm:h-[500px] shadow-xl z-50 flex flex-col max-w-[calc(100vw-2rem)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold">MediCare AI Assistant</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isBot
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.isBot ? (
                    <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Response Buttons */}
        <div className="p-3 sm:p-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {quickResponses.slice(0, 4).map((response, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-8 truncate"
                onClick={() => handleQuickResponse(response)}
              >
                {response.text}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button size="sm" onClick={handleSend} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chatbot;