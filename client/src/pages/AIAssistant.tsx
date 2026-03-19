// src/pages/AIAssistant.tsx
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system" as const,
      content:
        "You are the BISHOUY AI Assistant for an elite English-language news organization. You help users find news and answer questions about world events. You MUST ALWAYS reply in perfect, professional English, regardless of the language the user speaks.",
    },
    {
      role: "assistant" as const,
      content:
        "Hello! I am your AI editorial assistant. How can I help you explore the latest news today?",
    },
  ]);

  // tRPC mutation that calls the Gemini‑based chat endpoint
  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: response => {
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    },
  });

  // Show a toast if the request fails
  useEffect(() => {
    if (chatMutation.isError) {
      toast.error(
        chatMutation.error?.message || "AI assistant failed to respond."
      );
    }
  }, [chatMutation.isError, chatMutation.error]);

  const handleSend = (content: string) => {
    const newMessages: Message[] = [
      ...messages,
      { role: "user" as const, content },
    ];
    setMessages(newMessages);
    chatMutation.mutate({ messages: newMessages });
  };

  return (
    <div className="min-h-screen bg-[#0F0F0E]">
      <Navbar />

      <main className="container pt-52 pb-16">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-[#E8A020]/10 text-[#E8A020] px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-4">
              <Sparkles size={12} />
              Editorial Intelligence
            </div>
            <h1 className="font-display text-4xl text-[#F2F0EB] mb-2">
              BISHOUY AI ASSISTANT
            </h1>
            <p className="font-ui text-sm text-[#8A8880]">
              Ask anything about our latest stories or get news summaries.
            </p>
            {!useAuth().user && (
              <div className="mt-6 p-4 bg-[#E8A020]/5 border border-[#E8A020]/20 rounded-sm inline-block max-w-md mx-auto">
                <p className="text-[10px] text-[#E8A020] font-black uppercase tracking-[0.2em] mb-1">Guest Mode Active</p>
                <p className="text-[9px] text-[#8A8880] leading-tight">
                  You have basic access. <Link href="/register" className="text-[#E8A020] underline font-bold">Register</Link> to unlock Premium Neural Processing and faster response times.
                </p>
              </div>
            )}
          </header>

          <div className="bg-[#1C1C1A] border border-[#2A2A28] rounded-sm overflow-hidden shadow-2xl">
            <AIChatBox
              messages={messages}
              onSendMessage={handleSend}
              isLoading={chatMutation.isPending}
              height="600px"
              className="border-none"
              placeholder="Ask me something about the news..."
              suggestedPrompts={[
                "Summarize today's top stories",
                "What's happening in global economy?",
                "Tell me more about the energy crisis",
              ]}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
