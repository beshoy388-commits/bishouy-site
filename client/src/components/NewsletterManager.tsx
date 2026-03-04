import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, Mail, Users, Loader2, Type, Layout } from "lucide-react";

export default function NewsletterManager() {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const listQuery = trpc.newsletter.list.useQuery();

    const broadcastMutation = trpc.newsletter.broadcast.useMutation({
        onSuccess: (data: { count: number }) => {
            toast.success(`Newsletter inviata a ${data.count} iscritti!`);
            setSubject("");
            setContent("");
        },
        onError: (error: any) => {
            toast.error("Errore nell'invio della newsletter", { description: error.message });
        }
    });

    const handleSend = () => {
        if (!subject.trim()) return toast.error("Per favore, inserisci un oggetto.");
        if (!content.trim()) return toast.error("Per favore, inserisci il corpo dell'email.");

        if (confirm(`Sei sicuro di voler inviare questa newsletter a tutti gli iscritti attivi?`)) {
            broadcastMutation.mutate({ subject, htmlContent: content });
        }
    };

    const activeSubscribersCount = listQuery.data?.filter((s: any) => s.active).length || 0;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="font-headline text-2xl text-[#F2F0EB] mb-2">Newsletter Studio</h2>
                    <p className="font-ui text-sm text-[#8A8880]">Invia aggiornamenti a tutta la tua mailing list</p>
                </div>
                <div className="flex items-center gap-3 bg-[#1C1C1A] border border-[#2A2A28] px-4 py-2 rounded-sm">
                    <Users size={16} className="text-[#E8A020]" />
                    <span className="font-ui text-xs font-600 uppercase tracking-widest text-[#F2F0EB]">
                        {activeSubscribersCount} Iscritti Attivi
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block flex items-center gap-1">
                                    <Type size={12} /> Oggetto dell'email
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm p-3 text-[#F2F0EB] font-ui text-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                                    placeholder="Es: Breaking News della settimana..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block flex items-center gap-1">
                                    <Layout size={12} /> Corpo dell'email (Testo o HTML)
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm p-4 text-[#F2F0EB] font-mono text-sm focus:outline-none focus:border-[#E8A020] transition-colors min-h-[400px] resize-y"
                                    placeholder="Scrivi qui il contenuto della tua newsletter... puoi usare tag HTML per la formattazione."
                                />
                                <p className="text-xs text-[#8A8880] mt-1">L'email verrà wrappata automaticamente nel template di Bishouy.com.</p>
                            </div>

                            <div className="pt-4 flex justify-end border-t border-[#2A2A28]">
                                <button
                                    onClick={handleSend}
                                    disabled={broadcastMutation.isPending || activeSubscribersCount === 0}
                                    className="flex items-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] disabled:opacity-50 text-[#0F0F0E] font-ui text-sm font-600 uppercase tracking-wider px-6 py-3 rounded-sm transition-colors"
                                >
                                    {broadcastMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    Invia a Tutti gli Iscritti
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                        <h3 className="font-ui text-xs font-600 text-[#E8A020] uppercase tracking-widest mb-4">Ultimi Iscritti</h3>
                        {listQuery.isLoading ? (
                            <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-[#E8A020]" /></div>
                        ) : listQuery.data?.slice(0, 10).map((sub: any) => (
                            <div key={sub.id} className="flex items-center gap-3 py-3 border-b border-[#2A2A28] last:border-0">
                                <Mail size={14} className={sub.active ? "text-green-500" : "text-gray-600"} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-[#F2F0EB] truncate">{sub.email}</p>
                                    <p className="text-xs text-[#555550]">
                                        {new Date(sub.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                {!sub.active && <span className="text-[10px] bg-red-900/40 text-red-500 px-2 py-0.5 rounded-sm">Unsub</span>}
                            </div>
                        ))}
                    </Card>
                    <div className="bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-sm p-4">
                        <p className="text-xs text-[#8A8880] leading-relaxed">
                            <strong className="text-[#E8A020]">Nota:</strong> Per evitare limitazioni o finire nello spam, non inviare più di un'email a settimana.
                            Le email verranno spedite individualmente ad ogni iscritto tramite Resend.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
