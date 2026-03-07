import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
    Globe,
    Share2,
    Search,
    Lock,
    Save,
    Loader2,
    RefreshCw,
    Mail,
    Smartphone,
    Info
} from "lucide-react";

export default function SiteSettings() {
    const settingsQuery = trpc.settings.getAll.useQuery();
    const updateMutation = trpc.settings.update.useMutation({
        onSuccess: () => {
            toast.success("Settings updated successfully");
            settingsQuery.refetch();
        },
        onError: (err) => {
            toast.error("Failed to update setting", { description: err.message });
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

    const handleSave = async (key: string) => {
        const value = localSettings[key];
        if (value === undefined) return;
        updateMutation.mutate({ key, value });
    };

    const sections = [
        {
            id: "general",
            title: "General Identification",
            icon: Globe,
            description: "Customize how your brand is identified globally.",
            fields: [
                { key: "site_name", label: "Site Name", description: "The main title displayed in the browser and headers." },
                { key: "site_description", label: "Site Tagline", description: "A brief description displayed under the logo." },
                { key: "owner_email", label: "Contact Email", description: "Official support or contact email." },
            ]
        },
        {
            id: "social",
            title: "Social Connections",
            icon: Share2,
            description: "Manage links to your official social media channels.",
            fields: [
                { key: "social_x", label: "X (Twitter) URL", description: "Link to your official X profile." },
                { key: "social_instagram", label: "Instagram URL", description: "Link to your official Instagram page." },
                { key: "social_whatsapp", label: "WhatsApp Number", description: "International format: +39..." },
                { key: "social_telegram", label: "Telegram Channel", description: "Link to your telegram channel or bot." },
            ]
        },
        {
            id: "seo",
            title: "SEO & Global Meta",
            icon: Search,
            description: "Global settings for search engine visibility.",
            fields: [
                { key: "meta_keywords", label: "Global Keywords", description: "Comma-separated keywords for the whole site." },
                { key: "google_analytics_id", label: "GA Measurement ID", description: "Format: G-XXXXXXXXXX" },
            ]
        },
        {
            id: "maintenance",
            title: "Maintenance & Security",
            icon: Lock,
            description: "Control access and visibility during updates.",
            fields: [
                { key: "maintenance_mode", label: "Maintenance Mode", description: "Set to 'true' to block public access." },
                { key: "allow_comments", label: "Allow New Comments", description: "Global switch for comment submissions." },
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
        <div className="space-y-10 animate-fade-in">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="font-headline text-2xl text-[#F2F0EB] mb-2 uppercase tracking-wide">
                        Global Site Configuration
                    </h2>
                    <p className="font-ui text-sm text-[#8A8880]">
                        Manage the core parameters and external connections of the Bishouy.com platform.
                    </p>
                </div>
                <button
                    onClick={() => settingsQuery.refetch()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1A] border border-[#2A2A28] text-[#8A8880] hover:text-[#E8A020] transition-colors rounded-sm font-ui text-xs uppercase tracking-widest"
                >
                    <RefreshCw size={14} className={settingsQuery.isRefetching ? "animate-spin" : ""} />
                    Sync State
                </button>
            </header>

            <div className="grid gap-8">
                {sections.map((section) => (
                    <div key={section.id} className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-[#2A2A28] pb-4">
                            <div className="p-2 bg-[#E8A020]/10 rounded-sm">
                                <section.icon size={20} className="text-[#E8A020]" />
                            </div>
                            <div>
                                <h3 className="text-[#F2F0EB] font-headline text-lg uppercase tracking-tight">{section.title}</h3>
                                <p className="text-[#8A8880] text-xs font-ui">{section.description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {section.fields.map((field) => (
                                <Card key={field.key} className="bg-[#1C1C1A] border-[#2A2A28] p-5 hover:border-[#E8A020]/20 transition-all group overflow-visible">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <label htmlFor={field.key} className="text-[10px] font-ui font-800 text-[#8A8880] uppercase tracking-[0.2em]">
                                                {field.label}
                                            </label>
                                            <button
                                                onClick={() => handleSave(field.key)}
                                                disabled={updateMutation.isPending && updateMutation.variables?.key === field.key}
                                                className={`text-[10px] font-ui font-bold uppercase tracking-widest px-2 py-1 rounded transition-all ${localSettings[field.key] !== (settingsQuery.data?.find(s => s.key === field.key)?.value || "")
                                                        ? "bg-[#E8A020] text-[#0F0F0E] hover:scale-105 active:scale-95"
                                                        : "text-[#555550] pointer-events-none opacity-50"
                                                    }`}
                                            >
                                                {updateMutation.isPending && updateMutation.variables?.key === field.key ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : (
                                                    <span className="flex items-center gap-1.5"><Save size={12} /> Save</span>
                                                )}
                                            </button>
                                        </div>

                                        <input
                                            id={field.key}
                                            type="text"
                                            className="bg-[#0F0F0E] border border-[#2A2A28] rounded-sm py-2.5 px-4 text-[#F2F0EB] text-sm font-ui focus:border-[#E8A020] outline-none transition-colors"
                                            value={localSettings[field.key] || ""}
                                            onChange={(e) => setLocalSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                                        />

                                        <div className="flex items-start gap-2">
                                            <Info size={12} className="text-[#555550] shrink-0 mt-0.5" />
                                            <span className="text-[10px] text-[#555550] italic leading-tight">
                                                {field.description}
                                            </span>
                                        </div>
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
