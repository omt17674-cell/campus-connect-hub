import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  User,
  ArrowRight,
  HelpCircle,
  Clock,
  Calendar,
} from "lucide-react";
import { campusStore } from "@/lib/campus-store";
import { apiClient } from "@/lib/api-client";
import { AssistantMessage } from "@/lib/types";

interface CampusAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampusAssistantModal: React.FC<CampusAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const state = campusStore.getState();
  const user = state.currentUser;

  // Initialize initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "msg-welcome",
          sender: "assistant",
          text: `Hello **${user.name}**! 👋 I am your **GSFC Campus AI Assistant**.\n\nAsk me anything about upcoming hackathons, your attendance percentage, registered events, club schedules, or university contact numbers!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestedActions: [
            "What events are happening this week?",
            "Show technical workshops for CSE",
            "Show my registered events",
            "What is my attendance percentage?",
          ],
        },
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMessage: AssistantMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const aiResponse = await apiClient.queryAiAssistant(text, user.role, user.id);
      if (aiResponse && aiResponse.text) {
        setMessages((prev) => [
          ...prev,
          {
            id: aiResponse.id || `msg-ai-${Date.now()}`,
            sender: "assistant",
            text: aiResponse.text,
            timestamp: aiResponse.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            suggestedActions: [
              "What events are happening this week?",
              "Show technical workshops for CSE",
              "Show my registered events",
              "What is my attendance percentage?",
            ],
          },
        ]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Fall through to offline store response
    }

    const response = campusStore.queryCampusAssistant(text);
    setMessages((prev) => [...prev, response]);
    setIsTyping(false);
  };

  const handleClear = () => {
    setMessages([
      {
        id: "msg-welcome-reset",
        sender: "assistant",
        text: `Conversation cleared. How can I assist you across GSFC University today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedActions: [
          "What events are happening this week?",
          "Show my registered events",
          "What is my attendance percentage?",
          "What clubs can I join?",
        ],
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-slate-900 border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-800/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1A3C6E] to-[#F2A93B] text-white shadow-md">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  GSFC Campus AI Assistant
                </h2>
                <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Scoped & Private
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected to GSFC University Knowledge Graph
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClear}
              title="Reset conversation"
              className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "assistant" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#1A3C6E] text-[#F2A93B] shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2`}>
                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-[#1A3C6E] to-[#255294] text-white border border-blue-400/30"
                      : "bg-slate-800/80 text-slate-200 border border-white/10 shadow-sm"
                  }`}
                >
                  <div className="whitespace-pre-line font-sans">{msg.text}</div>
                </div>

                {/* Suggestions Chips from Assistant */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedActions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(sug)}
                        className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-blue-300 hover:bg-white/15 hover:text-white transition-all text-left flex items-center gap-1"
                      >
                        <ArrowRight className="h-2.5 w-2.5 text-[#F2A93B]" /> {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1A3C6E] text-[#F2A93B]">
                <Bot className="h-4 w-4 animate-bounce" />
              </div>
              <div className="rounded-2xl bg-slate-800/80 px-4 py-3 border border-white/10 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F2A93B] animate-ping" />
                <span className="text-xs text-slate-400">GSFC AI is querying verified records...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/10 bg-slate-800/80 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about events, attendance, registrations, clubs, TPC..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-xs text-white placeholder-slate-400 focus:border-[#F2A93B] focus:outline-none focus:ring-1 focus:ring-[#F2A93B]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-[#1A3C6E] to-[#255294] text-white disabled:opacity-40 hover:brightness-110 transition-all border border-blue-400/40 shadow-md"
            >
              <Send className="h-4 w-4 text-[#F2A93B]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
