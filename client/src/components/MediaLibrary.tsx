import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import {
    ImageIcon,
    Trash2,
    Copy,
    ExternalLink,
    Loader2,
    Search,
    Upload,
    Maximize2,
    Scissors,
    Layers,
    Cpu,
    Sparkles
} from "lucide-react";
import { toast } from "sonner";

export default function MediaLibrary() {
    const articlesQuery = trpc.articles.list.useQuery({ limit: 100 });
    const adsQuery = trpc.advertisements.getAll.useQuery();
    const [search, setSearch] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [procOptions, setProcOptions] = useState({ width: 1200, height: 800, fit: 'cover' as any });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const articles = articlesQuery.data || [];
    const ads = adsQuery.data || [];

    // Extract all unique images
    const mediaItems = Array.from(new Set([
        ...articles.map((a: any) => a.image).filter(Boolean),
        ...ads.map((ad: any) => ad.imageUrl).filter(Boolean)
    ])).filter((url): url is string => !!url)
        .map((url, index) => ({
            id: index,
            url,
            source: (articles.some((a: any) => a.image === url) ? 'Article' : 'Ad') as 'Article' | 'Ad',
            title: articles.find((a: any) => a.image === url)?.title || ads.find((ad: any) => ad.imageUrl === url)?.title || 'Untitled Asset'
        })).filter(item => item.title.toLowerCase().includes(search.toLowerCase()) || item.url.toLowerCase().includes(search.toLowerCase()));

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("Asset URL copied to local buffer");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const url = `/api/upload?width=${procOptions.width}&height=${procOptions.height}&fit=${procOptions.fit}`;
            const res = await fetch(url, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                toast.success("Intelligence processing complete", { description: "Asset optimized and injected." });
                // In a real app, we'd save this to a 'media' table. 
                // For now, it stays in session/logs or user can copy it.
                copyToClipboard(data.url);
            }
        } catch (e) {
            toast.error("Processing node failure");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1C1C1A] pb-8">
                <div>
                    <h2 className="font-headline text-3xl text-[#F2F0EB] mb-2 uppercase tracking-tighter">
                        MEDIA <span className="text-[#E8A020]">INTELLIGENCE</span>
                    </h2>
                    <p className="font-ui text-xs text-[#8A8880] uppercase tracking-widest font-bold">
                        Global Asset Repository & Neural Image Hub
                    </p>
                </div>
                <div className="relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555550] group-focus-within:text-[#E8A020] transition-colors" />
                    <input
                        type="text"
                        placeholder="FILTER ASSETS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-[#0F0F0E] border border-[#2A2A28] rounded-xl py-3 pl-12 pr-6 text-xs text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]/50 transition-all font-ui w-full md:w-80"
                    />
                </div>
            </header>

            {/* Asset Processing Unit */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-[#11110F] border-[#1C1C1A] p-8 border-l-4 border-l-[#E8A020]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-[#E8A020]/10 rounded-xl">
                            <Cpu size={24} className="text-[#E8A020]" />
                        </div>
                        <div>
                            <h3 className="text-[#F2F0EB] font-headline text-xl uppercase">Process Node</h3>
                            <p className="text-[10px] text-[#555550] uppercase tracking-widest font-bold">Configure neural optimization parameters</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[#8A8880] uppercase tracking-widest">Output Resonance (Width)</label>
                            <input
                                type="range" min="400" max="2500" step="100"
                                value={procOptions.width}
                                onChange={(e) => setProcOptions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                                className="w-full accent-[#E8A020]"
                            />
                            <p className="text-right text-[#E8A020] font-display text-sm font-bold tracking-tighter">{procOptions.width}px</p>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[#8A8880] uppercase tracking-widest">Vertical Index (Height)</label>
                            <input
                                type="range" min="400" max="2500" step="100"
                                value={procOptions.height}
                                onChange={(e) => setProcOptions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                                className="w-full accent-[#E8A020]"
                            />
                            <p className="text-right text-[#E8A020] font-display text-sm font-bold tracking-tighter">{procOptions.height}px</p>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[#8A8880] uppercase tracking-widest">Processing Fit</label>
                            <select
                                value={procOptions.fit}
                                onChange={(e) => setProcOptions(prev => ({ ...prev, fit: e.target.value as any }))}
                                className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded py-2 px-3 text-xs text-[#F2F0EB] outline-none focus:border-[#E8A020]/50"
                            >
                                <option value="cover">COVER (CROP)</option>
                                <option value="contain">CONTAIN (FIT)</option>
                                <option value="fill">FILL (STRETCH)</option>
                                <option value="inside">SUBTLE (LIMIT)</option>
                            </select>
                        </div>
                    </div>
                </Card>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-2 border-dashed border-[#1C1C1A] hover:border-[#E8A020]/30 rounded-2xl flex flex-col items-center justify-center p-8 bg-[#0C0C0B] hover:bg-[#E8A020]/[0.02] transition-all cursor-pointer relative overflow-hidden"
                >
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    {isUploading ? (
                        <div className="text-center space-y-4">
                            <Loader2 size={32} className="animate-spin text-[#E8A020] mx-auto" />
                            <p className="text-[10px] font-bold text-[#E8A020] uppercase tracking-[0.3em]">Neural Processing...</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 rounded-full bg-[#11110F] border border-[#2A2A28] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload size={24} className="text-[#8A8880] group-hover:text-[#E8A020]" />
                            </div>
                            <p className="text-[11px] font-ui font-black text-[#F2F0EB] uppercase tracking-widest mb-1">Upload & Process</p>
                            <p className="text-[9px] text-[#555550] uppercase font-bold">Max 5MB Node</p>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                <Sparkles size={20} className="text-[#E8A020]" />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {(articlesQuery.isLoading || adsQuery.isLoading) ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-[#E8A020]" />
                </div>
            ) : mediaItems.length === 0 ? (
                <div className="text-center py-40 border-2 border-dashed border-[#1C1C1A] rounded-2xl">
                    <ImageIcon size={48} className="mx-auto text-[#1C1C1A] mb-4" />
                    <p className="text-[#555550] font-ui text-xs uppercase tracking-widest">Zero visual signatures detected</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {mediaItems.map((item) => (
                        <Card key={item.id} className="bg-[#151513] border-[#2A2A28] overflow-hidden group hover:border-[#E8A020]/30 transition-all shadow-xl">
                            <div className="aspect-video relative overflow-hidden bg-[#0A0A09]">
                                <img
                                    src={item.url}
                                    alt={item.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0E] to-transparent opacity-60" />

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all gap-3">
                                    <button
                                        onClick={() => copyToClipboard(item.url)}
                                        className="w-10 h-10 rounded-full bg-[#E8A020] text-[#0F0F0E] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
                                        title="Copy Link"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            toast.info("Neural Analysis Initiated", { description: "Simulating asset structure scan..." });
                                        }}
                                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                                        title="AI Analysis"
                                    >
                                        <Maximize2 size={16} />
                                    </button>
                                </div>

                                <div className="absolute bottom-2 left-2">
                                    <span className="text-[8px] font-bold px-2 py-0.5 bg-[#1C1C1A] text-[#8A8880] border border-[#2A2A28] rounded uppercase tracking-widest">
                                        {item.source}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 border-t border-[#1C1C1A]">
                                <p className="text-[10px] font-ui font-black text-[#F2F0EB] truncate uppercase tracking-widest mb-1.5">
                                    {item.title}
                                </p>
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-[8px] font-bold text-[#555550] truncate uppercase tracking-tighter opacity-60">
                                        SIG: {item.url.slice(-20)}
                                    </p>
                                    <div className="flex gap-1.5">
                                        <Scissors size={10} className="text-[#333330] hover:text-[#E8A020] cursor-pointer" />
                                        <Layers size={10} className="text-[#333330] hover:text-[#E8A020] cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
