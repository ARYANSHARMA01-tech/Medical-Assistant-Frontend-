import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FloatingDoctorButton } from "@/components/FloatingDoctorButton";

interface Disease {
  disease_en: string;
  disease_translated: string;
  confidence: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  diseases?: Disease[];
}

const SymptomAnalysis = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI Medical Assistant. Describe your symptoms in English, Arabic, or French, and I'll help identify possible conditions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("https://aryansh0007-medical.hf.space/chat", {
        message: input,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.chat?.response || "I've analyzed your symptoms.",
        diseases: response.data.top10 || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to connect to the API. Make sure your backend is running at http://127.0.0.1:8000");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't process your request. Please make sure the backend server is running.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                AI Symptom Chatbot 🤖
              </h1>
              <p className="text-muted-foreground">
                Describe your symptoms and get instant AI-powered health insights
              </p>
            </div>

            <Card className="shadow-large border-border">
              {/* Chat Messages */}
              <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="bg-primary rounded-lg p-2 h-fit">
                          <Bot className="w-5 h-5 text-primary-foreground" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === "user"
                            ? "gradient-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>

                        {message.diseases && message.diseases.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border/20">
                            <p className="font-semibold mb-2 text-sm">Top 10 Probable Diseases:</p>
                            <div className="space-y-1">
                              {message.diseases.map((disease, idx) => (
                                <div key={idx} className="text-sm flex justify-between gap-2">
                                  <span>{disease.disease_translated || disease.disease_en}</span>
                                  <span className="font-medium">{(disease.confidence * 100).toFixed(1)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {message.role === "user" && (
                        <div className="bg-accent rounded-lg p-2 h-fit">
                          <User className="w-5 h-5 text-accent-foreground" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="bg-primary rounded-lg p-2 h-fit">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="bg-secondary rounded-lg p-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your symptoms..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </Card>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                💡 Tip: Be as detailed as possible when describing your symptoms for better accuracy.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      <FloatingDoctorButton />
    </div>
  );
};

export default SymptomAnalysis;
