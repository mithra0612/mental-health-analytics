"use client";

import { useState, useRef, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Heart,
  Moon,
  Brain,
  TrendingUp,
  MessageCircle,
  Lightbulb,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SAMPLE_QUESTIONS = [
  { icon: Heart, label: "How is my mood this week?", category: "Mood" },
  { icon: Moon, label: "Can you analyze my sleep patterns?", category: "Sleep" },
  { icon: Brain, label: "What's causing my stress lately?", category: "Stress" },
  { icon: TrendingUp, label: "How am I progressing overall?", category: "Progress" },
  { icon: Lightbulb, label: "Give me a mindfulness tip for today", category: "Tips" },
  { icon: MessageCircle, label: "How can I improve my mental wellness?", category: "Wellness" },
  { icon: Sparkles, label: "What patterns do you see in my data?", category: "Insights" },
  { icon: Heart, label: "I'm feeling anxious — what can help?", category: "Support" },
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ${
          isUser
            ? "bg-primary ring-primary/30"
            : "bg-primary/10 ring-primary/20"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-muted text-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p
          className={`mt-1.5 text-[10px] ${
            isUser ? "text-primary-foreground/60" : "text-muted-foreground/70"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your personal wellness assistant powered by AI. I have access to your recent mood, sleep, and stress data, so I can give you personalized insights.\n\nFeel free to ask me anything, or tap one of the suggested questions below to get started! 💙",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowSuggestions(false);

    const history = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });
      const data = await res.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || data.error || "Something went wrong.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I couldn't connect to the server. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi! I'm your personal wellness assistant powered by AI. I have access to your recent mood, sleep, and stress data, so I can give you personalized insights.\n\nFeel free to ask me anything, or tap one of the suggested questions below to get started! 💙",
        timestamp: new Date(),
      },
    ]);
    setShowSuggestions(true);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0px)]">
      <DashboardHeader
        title="AI Assistant"
        description="Powered by Groq · Context-aware wellness guidance"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            New Chat
          </Button>
        }
      />

      {/* Chat area */}
      <div className="flex flex-1 flex-col overflow-hidden p-4 gap-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-background/50 p-4 space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions */}
        {showSuggestions && (
          <div className="shrink-0">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Suggested questions
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => sendMessage(q.label)}
                  disabled={isLoading}
                  className="group flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-left text-xs transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm disabled:opacity-50"
                >
                  <q.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60 group-hover:text-primary" />
                  <span className="leading-snug text-muted-foreground group-hover:text-foreground">
                    {q.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="shrink-0 flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your mood, sleep, stress, or anything wellness-related…"
              rows={1}
              className="resize-none pr-12 min-h-[44px] max-h-[120px] text-sm leading-relaxed rounded-xl"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-muted-foreground/60 shrink-0">
          Not a medical professional. For serious concerns, consult a healthcare provider.
        </p>

        {/* Model badge */}
        <div className="flex justify-center shrink-0 -mt-2">
          <Badge variant="outline" className="text-[10px] gap-1 opacity-60">
            <Sparkles className="h-2.5 w-2.5" />
            Llama 3 · Groq
          </Badge>
        </div>
      </div>
    </div>
  );
}
