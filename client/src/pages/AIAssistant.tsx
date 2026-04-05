// src/pages/AIAssistant.tsx
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { Sparkles, Zap, Lock } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { getLoginUrl } from "@/const";
import PricingModal from "@/components/PricingModal";

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

  const { user } = useAuth();
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const isSubscriber = user?.subscriptionTier === "premium" || user?.subscriptionTier === "founder";
  const isAdmin = user?.role === "admin";
  const isPremiumLocked = !isSubscriber && !isAdmin;

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
      <SEO title="Editorial AI Assistant | BISHOUY" description="Explore the latest news via AI analysis." />
      <Navbar />

      <main className="container pt-40 pb-16">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-[#E8A020]/10 text-[#E8A020] px-3 py-1 rounded-full text-[10px] font-600 uppercase tracking-widest mb-4">
              <Sparkles size={12} />
              Editorial Intelligence
            </div>
            <h1 className="font-display text-4xl text-[#F2F0EB] mb-2">
              BISHOUY AI ASSISTANT
            </h1>
            <p className="font-ui text-sm text-[#8A8880]">
              Ask anything about our latest stories or get news summaries.
            </p>
            {!user && (
              <div className="mt-6 p-4 bg-[#E8A020]/5 border border-[#E8A020]/20 rounded-sm inline-block max-w-md mx-auto">
                <p className="text-[10px] text-[#E8A020] font-900 uppercase tracking-[0.2em] mb-1">Access Restricted</p>
                <p className="text-[9px] text-[#8A8880] leading-tight">
                  <Link href={getLoginUrl()} className="text-[#E8A020] underline font-bold">Sign In</Link> or upgrade to Premium to unlock the Neural Processing engine.
                </p>
              </div>
            )}
          </header>

          <div className="bg-[#1C1C1A] border border-[#2A2A28] rounded-sm overflow-hidden shadow-2xl relative">
            {isPremiumLocked ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-[#11110F]/90 backdrop-blur-md text-center">
                <div className="w-16 h-16 rounded-full bg-[#E8A020]/10 border border-[#E8A020]/20 flex items-center justify-center mb-6 text-[#E8A020]">
                  <Lock size={24} fill="currentColor" />
                </div>
                <h2 className="font-display text-3xl font-900 text-[#F2F0EB] uppercase tracking-tighter mb-2">
                  Assistant <span className="text-[#E8A020]">Locked</span>
                </h2>
                <p className="font-ui text-xs text-[#8A8880] mb-8 leading-relaxed uppercase tracking-[0.2em] max-w-md mx-auto">
                  The Editorial AI Assistant allows you to query the intelligence database in real-time. This feature is exclusive to Premium members.
                </p>
                
                <div className="w-full max-w-sm space-y-4">
                  <button 
                    onClick={() => setIsPricingOpen(true)}
                    className="block w-full bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] py-4 rounded-sm font-ui text-[11px] font-900 uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95"
                  >
                     UPGRADE TO PREMIUM
                  </button>
                  
                  {!user && (
                    <Link 
                      href={getLoginUrl()} 
                      className="block w-full border border-[#2A2A28] text-[#8A8880] hover:text-[#F2F0EB] py-4 rounded-sm font-ui text-[11px] font-900 uppercase tracking-[0.3em] transition-all active:scale-95"
                    >
                       SIGN IN TO VERIFY ACCESS
                    </Link>
                  )}
                </div>
              </div>
            ) : null}

            <AIChatBox
              messages={messages}
              onSendMessage={handleSend}
              isLoading={chatMutation.isPending}
              height="min(600px, calc(100vh - 350px))"
              className={`border-none mb-20 md:mb-0 ${isPremiumLocked ? 'opacity-20 pointer-events-none filter blur-sm' : ''}`}
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

      {/* Pricing Modal Overlay */}
      <PricingModal 
         isOpen={isPricingOpen} 
         onClose={() => setIsPricingOpen(false)} 
      />

      <Footer />
    </div>
  );
}
