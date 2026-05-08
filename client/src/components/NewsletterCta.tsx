import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function NewsletterCta() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user } = useAuth();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // In a real app, this would call a tRPC endpoint
    toast.success("Successfully subscribed to the newsletter!");
    setIsSubscribed(true);
    setEmail("");
  };

  if (isSubscribed || (user && user.subscribeToNewsletter)) {
    return (
      <div className="bg-[#1C1C1A] rounded-sm p-8 text-center my-12 border border-[#2A2A28]">
        <CheckCircle2 className="w-12 h-12 text-[#E8A020] mx-auto mb-4" />
        <h3 className="font-display text-2xl text-[#F2F0EB] mb-2">You're Subscribed ✓</h3>
        <p className="font-ui text-[#8A8880]">Thank you for being a part of our community.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1C1A] rounded-sm p-8 text-center my-12 border border-[#2A2A28]">
      <h3 className="font-display text-2xl text-[#F2F0EB] mb-2">Enjoyed this article?</h3>
      <p className="font-ui text-[#8A8880] mb-6">Get the best stories delivered to your inbox every week.</p>
      
      <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555550]" size={18} />
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#0F0F0E] border border-[#222220] pl-10 h-11 focus:ring-[#E8A020] focus:border-[#E8A020] text-[#F2F0EB] rounded-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-bold uppercase tracking-wider px-6 h-11 rounded-sm transition-colors whitespace-nowrap"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}
