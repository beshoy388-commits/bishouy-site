import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
    Globe,
    Share2,
    Search,
    Lock,
    Save,
    Loader2,
    RefreshCw,
    Info
} from "lucide-react";

export default function SiteSettings() {
    const settingsQuery = trpc.settings.getAll.useQuery();
    const updateMutation = trpc.settings.update.useMutation({
        onSuccess: () => {
            toast.success("State synchronized");
            settingsQuery.refetch();
        },
        onError: (err) => {
            toast.error("Protocol Error", { description: err.message });
        }
    });

    const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

    useEffect(() => {
        if (settingsQuery.data) {
            const settingsMap = settingsQuery.data.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {} as Record<string, string>);
            setLocalSettings(settingsMap);
        }
    }, [settingsQuery.data]);

    const handleSave = async (key: string, value?: string) => {
        const val = value !== undefined ? value : localSettings[key];
        if (val === undefined) return;
        updateMutation.mutate({ key, value: val });
    };

    const handleToggle = (key: string, enabled: boolean) => {
        const val = enabled ? "true" : "false";
        setLocalSettings(prev => ({ ...prev, [key]: val }));
        handleSave(key, val);
    };

    const sections = [
        {
            id: "general",
            title: "Identity & Core",
            icon: Globe,
            description: "Foundation parameters for the digital presence.",
            fields: [
                { key: "site_name", label: "Branding Title", type: "text", description: "Primary platform identifier." },
                { key: "site_description", label: "Tactical Tagline", type: "text", description: "Secondary brand description." },
                { key: "owner_email", label: "Ops Command Email", type: "text", description: "Primary contact endpoint." },
            ]
        },
        {
            id: "social",
            title: "Transmission Channels",
            icon: Share2,
            description: "Social media node integration points.",
            fields: [
                { key: "social_x", label: "X.com Protocol", type: "text", description: "URL for X (ex-Twitter) platform." },
                { key: "social_instagram", label: "Insta Node", type: "text", description: "Official Instagram relay." },
                { key: "social_whatsapp", label: "WhatsApp Direct", type: "text", description: "Direct communication channel." },
                { key: "social_telegram", label: "Telegram Ops", type: "text", description: "Secure transmission channel." },
            ]
        },
        {
            id: "seo",
            title: "Visibility Matrix",
            icon: Search,
            description: "Optimization for crawler discovery.",
            fields: [
                { key: "meta_keywords", label: "SEO Keywords", type: "text", description: "Global meta keywords." },
                { key: "google_analytics_id", label: "Analytics Bridge", type: "text", description: "Measurement ID for data tracking." },
            ]
        },
        {
            id: "maintenance",
            title: "Security & Access",
            icon: Lock,
            description: "Access control and safety protocols.",
            fields: [
                { key: "maintenance_mode", label: "Maintenance Shield", type: "switch", description: "Lock site for core updates." },
                { key: "allow_comments", label: "Comment Stream", type: "switch", description: "Toggle user interaction." },
                { key: "ai_generation_enabled", label: "AI Auto-Pilot", type: "switch", description: "Toggle automated news cycle." },
            ]
        },
    ];

    if (settingsQuery.isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#E8A020]" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#1C1C1A] pb-8">
                <div>
                    <h2 className="font-headline text-3xl text-[#F2F0EB] mb-2 uppercase tracking-tighter">
                        SYSTEM <span className="text-[#E8A020]">CONFIGURATION</span>
                    </h2>
                    <p className="font-ui text-xs text-[#8A8880] uppercase tracking-widest">
                        Manage global parameters, connection strings and operational states.
                    </p>
                </div>
                <button
                    onClick={() => settingsQuery.refetch()}
                    className="flex items-center gap-3 px-6 py-3 bg-[#11110F] border border-[#2A2A28] text-[#8A8880] hover:text-[#E8A020] hover:border-[#E8A020]/30 transition-all rounded-lg font-ui text-[10px] font-bold uppercase tracking-widest shadow-xl"
                >
                    <RefreshCw size={14} className={settingsQuery.isRefetching ? "animate-spin" : ""} />
                    Refresh Protocol
                </button>
            </header>

            <div className="grid grid-cols-1 gap-12">
                {sections.map((section) => (
                    <div key={section.id} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#E8A020]/10 rounded-lg flex items-center justify-center border border-[#E8A020]/20">
                                <section.icon size={20} className="text-[#E8A020]" />
                            </div>
                            <div>
                                <h3 className="text-[#F2F0EB] font-headline text-xl uppercase tracking-tight">{section.title}</h3>
                                <p className="text-[#8A8880] text-[10px] font-ui uppercase tracking-widest font-bold opacity-60">{section.description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {section.fields.map((field) => (
                                <Card key={field.key} className="bg-[#151513] border-[#2A2A28] p-6 hover:border-[#E8A020]/20 transition-all group">
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <label htmlFor={field.key} className="text-[11px] font-ui font-900 text-[#F2F0EB] uppercase tracking-widest">
                                                    {field.label}
                                                </label>
                                                <div className="group-hover:block hidden">
                                                    <Info size={12} className="text-[#555550]" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-[#555550] font-ui leading-relaxed max-w-[280px]">
                                                {field.description}
                                            </p>
                                        </div>

                                        {field.type === "switch" ? (
                                            <div className="flex items-center gap-3 pt-1">
                                                <Switch
                                                    id={field.key}
                                                    checked={localSettings[field.key] === "true"}
                                                    onCheckedChange={(checked) => handleToggle(field.key, checked)}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3 min-w-[200px]">
                                                <div className="relative">
                                                    <input
                                                        id={field.key}
                                                        type="text"
                                                        className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-md py-2 px-3 text-[#F2F0EB] text-xs font-ui focus:border-[#E8A020]/50 outline-none transition-all placeholder:text-[#333333]"
                                                        value={localSettings[field.key] || ""}
                                                        onChange={(e) => setLocalSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                        onBlur={() => handleSave(field.key)}
                                                        placeholder={`Configure ${field.label}...`}
                                                    />
                                                    {localSettings[field.key] !== (settingsQuery.data?.find(s => s.key === field.key)?.value || "") && (
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleSave(field.key)}
                                                                className="p-1 bg-[#E8A020] text-[#0F0F0E] rounded hover:scale-110 active:scale-95 transition-transform"
                                                            >
                                                                <Save size={10} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Card className="bg-gradient-to-br from-[#1C1C1A] to-[#0F0F0E] border-[#2A2A28] p-8 text-center mt-12">
                <div className="max-w-xl mx-auto space-y-4">
                    <h4 className="text-[#E8A020] font-headline text-xl">Dynamic Site Environment</h4>
                    <p className="text-[#8A8880] text-sm font-ui leading-relaxed">
                        Le modifiche apportate in questa sezione avranno effetto immediato su tutto l'ecosistema del sito.
                        Assicurati di inserire link validi per garantire una corretta user experience.
                    </p>
                </div>
            </Card>
        </div>
    );
}
