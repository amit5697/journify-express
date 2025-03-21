
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, X, Minimize, Maximize, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface JournalEntry {
  id?: string;
  date: string;
  content: string | null;
  energy: number | null;
  productivity: number | null;
}

interface ChatbotProps {
  context?: string;
}

const GEMINI_API_KEY = "YOUR_DEFAULT_API_KEY"; // Replace with a default key if you have one

const GeminiChatbot: React.FC<ChatbotProps> = ({ context = "general assistance" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('gemini_api_key') || GEMINI_API_KEY);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      fetchJournalEntries();
    }
  }, [isOpen]);
  
  const fetchJournalEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select('date, content, energy, productivity')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Error fetching journal entries:', error);
      } else if (data) {
        const typedEntries: JournalEntry[] = data.map(entry => ({
          date: entry.date,
          content: entry.content,
          energy: entry.energy,
          productivity: entry.productivity
        }));
        setJournalEntries(typedEntries);
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
  };
  
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          content: `Hello! I'm your personal assistant for ${context}. How can I help you today?`,
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages, context]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const saveApiKey = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem('gemini_api_key', tempApiKey);
      setApiKey(tempApiKey);
      setIsApiKeyDialogOpen(false);
      toast.success('API key saved successfully!');
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  const formatJournalEntriesForPrompt = () => {
    if (!journalEntries || journalEntries.length === 0) {
      return "No journal entries available.";
    }
    
    return journalEntries.map(entry => {
      return `Date: ${entry.date}
Content: ${entry.content || 'No content'}
Energy Level: ${entry.energy || 'N/A'}/10
Productivity Level: ${entry.productivity || 'N/A'}/10
---`;
    }).join("\n");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    if (!apiKey || apiKey === "YOUR_DEFAULT_API_KEY") {
      setIsApiKeyDialogOpen(true);
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      const journalContext = formatJournalEntriesForPrompt();
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey as string,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful assistant focused on ${context}. 
                  
Here are the user's recent journal entries:
${journalContext}

Today's date is ${today}.

Please respond to the following message, referencing relevant journal entries if applicable: ${input}

IMPORTANT: Format your response using Markdown syntax (including ** for bold, * for italic, # for headers, etc). You can use bullet points with * and numbered lists too.`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get response from Gemini API');
      }
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.candidates[0].content.parts[0].text || 'I couldn\'t process your request. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: error.message || 'Something went wrong. Please try again later.',
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      if (error.message?.includes('API key')) {
        localStorage.removeItem('gemini_api_key');
        setApiKey(null);
        setIsApiKeyDialogOpen(true);
      }
    } finally {
      setIsTyping(false);
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        {!isOpen && (
          <Button
            onClick={toggleChat}
            size="lg"
            className="rounded-full shadow-lg h-14 w-14 p-0 flex items-center justify-center"
          >
            <Bot className="h-6 w-6" />
          </Button>
        )}
        
        {isOpen && (
          <Card className={cn(
            "transition-all duration-300 shadow-xl border",
            isMinimized ? "w-64 h-16" : "w-80 sm:w-96 h-[500px]"
          )}>
            <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0 bg-primary/5">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span>{isMinimized ? 'Chatbot' : `${context} Assistant`}</span>
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsApiKeyDialogOpen(true)}
                  title="Set API Key"
                >
                  <Key className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={toggleMinimize}
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={toggleChat}
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            {!isMinimized && (
              <>
                <ScrollArea className="flex-1 p-4 h-[380px]">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex flex-col max-w-[80%] rounded-lg p-3",
                          message.role === "user"
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.role === "assistant" ? (
                            <Bot className="h-3.5 w-3.5" />
                          ) : (
                            <User className="h-3.5 w-3.5" />
                          )}
                          <span className="text-xs opacity-70">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                          {message.role === "assistant" ? (
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            message.content
                          )}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex max-w-[80%] rounded-lg p-3 bg-muted">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <CardFooter className="p-3 pt-0">
                  <form onSubmit={handleSubmit} className="flex w-full gap-2">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={isTyping}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!input.trim() || isTyping}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardFooter>
              </>
            )}
          </Card>
        )}
      </div>

      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Gemini API Key</DialogTitle>
            <DialogDescription>
              Your API key is required to use the Gemini AI chatbot. It will be stored securely in your browser.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-y-2 py-4">
            <Input
              type="password"
              placeholder="Enter your Gemini API key"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="flex-1"
            />
          </div>
          <DialogFooter className="flex sm:justify-between">
            <Button variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={saveApiKey}>
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GeminiChatbot;
