import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token");

  const verifyMutation = trpc.auth.verifyImpersonation.useMutation({
    onSuccess: () => {
      toast.success("Security Access Granted: Impersonation session active.");
      window.location.href = "/";
    },
    onError: (err) => {
      toast.error("Cybersecurity Error: " + err.message);
      setTimeout(() => setLocation("/login"), 2000);
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate({ token });
    } else {
      setLocation("/login");
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0F0F0E] flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-[#E8A020] blur-xl opacity-20 animate-pulse" />
        <Loader2 className="animate-spin text-[#E8A020] relative z-10" size={48} />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-[#F2F0EB] font-display text-xl tracking-widest uppercase">Initializing Session</h2>
        <p className="text-[#8A8880] font-ui text-xs uppercase tracking-tighter">Establishing Secure Connection Pipeline...</p>
      </div>
    </div>
  );
}
