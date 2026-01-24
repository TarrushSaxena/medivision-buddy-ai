import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import {
  Send,
  Loader2,
  Bot,
  User,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

const SYSTEM_PROMPT = `You are MediVision Buddy, a friendly and knowledgeable AI medical assistant. Your role is to:

1. Help explain medical results from X-ray analyses and symptom checks
2. Answer general questions about chest diseases (COVID-19, Pneumonia, Lung Opacity)
3. Provide educational information about symptoms and conditions
4. Offer general health precautions and wellness advice

IMPORTANT GUIDELINES:
- Always remind users that you are an AI assistant and cannot replace professional medical advice
- Be empathetic and supportive in your responses
- Use clear, simple language that patients and medical students can understand
- When discussing conditions, provide educational context but avoid making diagnoses
- Encourage users to consult healthcare professionals for specific medical concerns
- Be helpful with explaining medical terminology

Keep responses concise but informative. Use bullet points when listing multiple items.`;

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>(() => 
    crypto.randomUUID()
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load conversation history
  useEffect(() => {
    const loadMessages = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setMessages(
          data.map((m) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            createdAt: new Date(m.created_at),
          }))
        );
      } else {
        // Add welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `Hello! I'm MediVision Buddy, your AI medical assistant. 👋

I can help you with:
• Understanding X-ray analysis results
• Explaining symptom checker assessments  
• Answering questions about chest diseases
• Providing general health information

How can I assist you today?

*Remember: I'm an AI assistant and cannot replace professional medical advice.*`,
            createdAt: new Date(),
          },
        ]);
      }
    };

    loadMessages();
  }, [user, conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Save user message
      await supabase.from('chat_messages').insert({
        user_id: user.id,
        conversation_id: conversationId,
        role: 'user',
        content: userMessage.content,
      });

      // Call AI endpoint
      const response = await supabase.functions.invoke('chat', {
        body: {
          messages: messages
            .filter((m) => m.id !== 'welcome')
            .concat(userMessage)
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
          systemPrompt: SYSTEM_PROMPT,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const assistantContent = response.data?.content || 
        "I apologize, but I'm having trouble processing your request. Please try again.";

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantContent,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message
      await supabase.from('chat_messages').insert({
        user_id: user.id,
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantContent,
      });
    } catch (error) {
      console.error('Chat error:', error);
      
      // Provide a helpful fallback response
      const fallbackMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I understand you're asking about "${userMessage.content}". 

As your AI medical assistant, I'm here to help explain medical concepts and provide educational information. However, I'm currently experiencing some technical difficulties.

In the meantime, here are some general tips:
• Always consult with a healthcare professional for medical concerns
• Keep track of your symptoms and any changes
• Review your X-ray analysis results in the dashboard

Please try again in a moment, or feel free to ask another question!`,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const startNewConversation = () => {
    setConversationId(crypto.randomUUID());
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm MediVision Buddy, your AI medical assistant. 👋

I can help you with:
• Understanding X-ray analysis results
• Explaining symptom checker assessments  
• Answering questions about chest diseases
• Providing general health information

How can I assist you today?

*Remember: I'm an AI assistant and cannot replace professional medical advice.*`,
        createdAt: new Date(),
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <DashboardLayout title="AI Assistant">
      <div className="max-w-4xl mx-auto space-y-4">
        <MedicalDisclaimer variant="compact" />

        <Card className="card-medical h-[calc(100vh-280px)] min-h-[500px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">MediVision Buddy</h3>
                <div className="flex items-center gap-1.5">
                  <div className="status-dot status-online" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={startNewConversation}>
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
                      message.role === 'user' ? 'bg-accent' : 'bg-primary'
                    )}
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-accent-foreground" />
                    ) : (
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'max-w-[80%]',
                      message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="chat-bubble-assistant">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Ask me anything about your results..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="flex-1"
              />
              <Button
                variant="medical"
                size="icon"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
