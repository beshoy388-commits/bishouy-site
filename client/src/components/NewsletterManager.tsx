import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, Mail, Users, Loader2, Type, Layout, Trash2, Bold, Link as LinkIcon, Image as ImageIcon, Plus } from "lucide-react";
import ImageUploader from "./ImageUploader";

export default function NewsletterManager() {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [showUploader, setShowUploader] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const listQuery = trpc.newsletter.list.useQuery();

    const historyQuery = trpc.newsletter.getHistory.useQuery();

    const utils = trpc.useUtils();

    const broadcastMutation = trpc.newsletter.broadcast.useMutation({
        onSuccess: (data: { count: number }) => {
            toast.success(`Newsletter sent to ${data.count} subscribers!`);
            setSubject("");
            setContent("");
            utils.newsletter.getHistory.invalidate();
        },
        onError: (error: any) => {
            toast.error("Error sending newsletter", { description: error.message });
        }
    });

    const deleteMutation = trpc.newsletter.delete.useMutation({
        onSuccess: () => {
            toast.success("Subscriber permanently removed");
            utils.newsletter.list.invalidate();
        },
        onError: (error: any) => toast.error(error.message)
    });

    const handleSend = () => {
        if (!subject.trim()) return toast.error("Please enter a subject.");
        if (!content.trim()) return toast.error("Please enter email body content.");

        if (confirm(`Are you sure you want to send this newsletter to ALL active subscribers?`)) {
            broadcastMutation.mutate({ subject, htmlContent: content });
        }
    };

    const handleDeleteSub = (id: number, email: string) => {
        if (confirm(`Are you sure you want to PERMANENTLY delete ${email}?`)) {
            deleteMutation.mutate({ id });
        }
    };

    const insertText = (before: string, after: string = "") => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);
        const replacement = before + selected + after;

        setContent(text.substring(0, start) + replacement + text.substring(end));

        // Focus and set selection back
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
        }, 0);
    };

    const activeSubscribersCount = listQuery.data?.filter((s: any) => s.active).length || 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-headline text-xl md:text-2xl text-[#F2F0EB] mb-1 md:mb-2">Newsletter Studio</h2>
                    <p className="font-ui text-xs text-[#8A8880]">Send updates to your mailing list</p>
                </div>
                <div className="flex items-center gap-3 bg-[#1C1C1A] border border-[#2A2A28] px-4 py-2 rounded-sm w-full sm:w-auto justify-center">
                    <Users size={16} className="text-[#E8A020]" />
                    <span className="font-ui text-[10px] sm:text-xs font-600 uppercase tracking-widest text-[#F2F0EB]">
                        {activeSubscribersCount} Active Subscribers
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block flex items-center gap-1">
                                    <Type size={12} /> Email Subject
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm p-3 text-[#F2F0EB] font-ui text-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                                    placeholder="e.g. Weekly Breaking News..."
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block flex items-center gap-1">
                                        <Layout size={12} /> Email Body (HTML Supported)
                                    </label>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => insertText("<b>", "</b>")}
                                            className="p-1.5 hover:bg-[#2A2A28] text-[#8A8880] hover:text-[#F2F0EB] rounded-sm transition-colors"
                                            title="Bold"
                                        >
                                            <Bold size={14} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const url = prompt("Enter URL:");
                                                if (url) insertText(`<a href="${url}" style="color: #E8A020; text-decoration: underline;">`, "</a>");
                                            }}
                                            className="p-1.5 hover:bg-[#2A2A28] text-[#8A8880] hover:text-[#F2F0EB] rounded-sm transition-colors"
                                            title="Insert Link"
                                        >
                                            <LinkIcon size={14} />
                                        </button>
                                        <button
                                            onClick={() => setShowUploader(!showUploader)}
                                            className={`p-1.5 hover:bg-[#2A2A28] rounded-sm transition-colors ${showUploader ? 'text-[#E8A020] bg-[#2A2A28]' : 'text-[#8A8880] hover:text-[#F2F0EB]'}`}
                                            title="Upload/Insert Image"
                                        >
                                            <ImageIcon size={14} />
                                        </button>
                                    </div>
                                </div>

                                {showUploader && (
                                    <div className="mb-4 p-4 bg-[#0F0F0E] border border-[#2A2A28] rounded-sm">
                                        <p className="text-[10px] font-ui text-[#8A8880] uppercase tracking-widest mb-3">Upload image to get URL</p>
                                        <ImageUploader
                                            onImageUpload={(url: string) => {
                                                insertText(`<img src="${url}" alt="Newsletter Image" style="max-width: 100%; height: auto; border-radius: 4px; display: block; margin: 20px 0;" />\n`);
                                                toast.success("Image link inserted!");
                                                setShowUploader(false);
                                            }}
                                        />
                                    </div>
                                )}

                                <textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm p-4 text-[#F2F0EB] font-mono text-sm focus:outline-none focus:border-[#E8A020] transition-colors min-h-[400px] resize-y"
                                    placeholder="Write your newsletter content here... Use HTML for rich formatting."
                                />
                                <p className="text-xs text-[#8A8880] mt-1">Email will be automatically wrapped in the Bishouy.com template.</p>
                            </div>

                            <div className="pt-4 flex justify-end border-t border-[#2A2A28]">
                                <button
                                    onClick={handleSend}
                                    disabled={broadcastMutation.isPending || activeSubscribersCount === 0}
                                    className="flex items-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] disabled:opacity-50 text-[#0F0F0E] font-ui text-sm font-600 uppercase tracking-wider px-6 py-3 rounded-sm transition-colors"
                                >
                                    {broadcastMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    Send to All Subscribers
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Mail size={16} className="text-[#E8A020]" />
                            <h3 className="font-ui text-xs font-600 text-[#F2F0EB] uppercase tracking-widest">Sent History</h3>
                        </div>

                        {historyQuery.isLoading ? (
                            <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-[#E8A020]" /></div>
                        ) : (
                            <div className="space-y-4">
                                {historyQuery.data?.map((item: any) => (
                                    <div key={item.id} className="p-4 bg-[#0F0F0E] border border-[#222220] rounded-sm group hover:border-[#E8A020]/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm font-600 text-[#F2F0EB]">{item.subject}</h4>
                                            <span className="text-[10px] font-ui text-[#8A8880] uppercase bg-[#1C1C1A] px-2 py-0.5 rounded-full">
                                                {item.recipientCount} Recipients
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-[#555550] flex items-center gap-2">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                                {historyQuery.data?.length === 0 && (
                                    <p className="text-xs text-[#555550] text-center py-8 border border-dashed border-[#2A2A28] rounded-sm">
                                        No sent newsletters yet.
                                    </p>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                        <h3 className="font-ui text-xs font-600 text-[#E8A020] uppercase tracking-widest mb-4">Subscriber Management</h3>
                        {listQuery.isLoading ? (
                            <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-[#E8A020]" /></div>
                        ) : (
                            <div className="space-y-2">
                                {listQuery.data?.map((sub: any) => (
                                    <div key={sub.id} className="group flex items-center gap-3 py-3 border-b border-[#2A2A28] last:border-0">
                                        <Mail size={14} className={sub.active ? "text-green-500" : "text-gray-600"} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-[#F2F0EB] truncate">{sub.email}</p>
                                            <p className="text-[10px] text-[#555550]">
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                                {!sub.active && <span className="text-red-500 ml-2">● Inactive</span>}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSub(sub.id, sub.email)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-[#8A8880] hover:text-red-500 transition-all"
                                            title="Delete Subscriber"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {listQuery.data?.length === 0 && (
                                    <p className="text-xs text-[#555550] text-center py-4">No subscribers found.</p>
                                )}
                            </div>
                        )}
                    </Card>
                    <div className="bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-sm p-4">
                        <p className="text-xs text-[#8A8880] leading-relaxed">
                            <strong className="text-[#E8A020]">Tip:</strong> Use the editor toolbar to insert images and formatting. Always test the newsletter on yourself before sending to the full list.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

