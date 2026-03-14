import { trpc } from "@/lib/trpc";
import {
  Terminal as TerminalIcon,
  RefreshCw,
  Clock,
  Mail,
  Shield,
  Zap,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function SystemConsole() {
  const {
    data: codes,
    refetch,
    isLoading,
  } = trpc.system.getDebugLogs.useQuery(undefined, {
    refetchInterval: 5000, // Auto-refresh every 5s
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const syncRssMutation = trpc.system.syncRss.useMutation({
    onSuccess: data => {
      setIsSyncing(false);
      if (data.success) {
        toast.success(
          `RSS Sync complete! Generated ${data.count} new articles.`
        );
      } else {
        toast.error("RSS Sync failed", { description: data.message });
      }
    },
    onError: error => {
      setIsSyncing(false);
      toast.error("Failed to trigger RSS Sync", { description: error.message });
    },
  });

  const handleSync = () => {
    setIsSyncing(true);
    syncRssMutation.mutate();
  };

  const testEmailMutation = trpc.system.testEmail.useMutation();

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-xl md:text-2xl text-[#F2F0EB] mb-1">
            System Debug Console
          </h2>
          <p className="font-ui text-xs text-[#8A8880]">
            Monitor system events and verification codes in real-time.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1C1C1A] border border-[#2A2A28] text-[#F2F0EB] font-ui text-[10px] md:text-sm uppercase tracking-widest rounded-sm hover:border-[#E8A020] transition-colors w-full sm:w-auto"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <div className="bg-[#0A0A09] border border-[#222220] rounded-sm overflow-hidden font-mono shadow-xl">
        <div className="bg-[#1C1C1A] px-4 py-2 border-b border-[#222220] flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          </div>
          <span className="text-[10px] text-[#555550] uppercase tracking-widest ml-4 font-ui">
            Live Verification Stream
          </span>
        </div>

        <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
          {codes && codes.length > 0 ? (
            codes.map((item: any) => (
              <div
                key={item.id}
                className="group border-l-2 border-[#E8A020] pl-4 py-2 hover:bg-[#1C1C1A]/30 transition-colors"
              >
                <div className="flex items-center gap-3 text-[10px] text-[#555550] mb-1">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-[#8A8880]">
                    <Mail size={10} />
                    {item.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#8A8880] text-xs">
                    Auth code generated:
                  </span>
                  <span className="text-[#E8A020] text-lg font-bold tracking-widest">
                    {item.code}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <TerminalIcon className="mx-auto mb-4 text-[#222220]" size={48} />
              <p className="text-[#555550] text-sm italic">
                No logs found in the current stream.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1C1C1A] p-6 border border-[#2A2A28] rounded-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-sm">
              <Zap size={20} className="text-blue-500" />
            </div>
            <div>
              <h4 className="text-[#F2F0EB] text-sm font-600 mb-1">
                AI News Aggregator
              </h4>
              <p className="text-[#8A8880] text-xs leading-relaxed">
                Pull the latest world and politics news from RSS feeds and
                rewrite them using Gemini AI.
              </p>
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-ui text-[10px] md:text-xs uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Syncing Feeds...
              </>
            ) : (
              <>Sync RSS AI News</>
            )}
          </button>
        </div>

        <div className="bg-[#1C1C1A] p-6 border border-[#2A2A28] rounded-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 bg-[#E8A020]/10 rounded-sm">
              <Mail size={20} className="text-[#E8A020]" />
            </div>
            <div>
              <h4 className="text-[#F2F0EB] text-sm font-600 mb-1">
                Email Delivery Test
              </h4>
              <p className="text-[#8A8880] text-xs leading-relaxed">
                Verify your Brevo SMTP configuration by sending a simple diagnostic email.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="email"
              placeholder="Test recipient email"
              id="test-email-input"
              className="flex-1 bg-[#0F0F0E] border border-[#222220] rounded-sm px-3 py-2 text-xs text-[#F2F0EB] focus:border-[#E8A020] outline-none"
            />
            <button
              onClick={() => {
                const email = (document.getElementById('test-email-input') as HTMLInputElement)?.value;
                if (!email) return toast.error("Enter an email");
                
                toast.promise(testEmailMutation.mutateAsync({ email }), {
                  loading: 'Sending test email...',
                  success: (data) => data.message,
                  error: (err) => `Mail Error: ${err.message}`
                });
              }}
              disabled={testEmailMutation.isPending}
              className="px-4 py-2 bg-[#1C1C1A] border border-[#2A2A28] text-[#8A8880] hover:text-[#E8A020] hover:border-[#E8A020] font-ui text-[10px] uppercase tracking-widest rounded-sm transition-all flex items-center gap-2"
            >
              {testEmailMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
              Send Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
