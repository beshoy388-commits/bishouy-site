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
            description: "Fundamental parameters defining the platform's digital presence and communication base.",
            fields: [
                {
                    key: "site_name",
                    label: "Branding Title",
                    type: "text",
                    description: "The primary name of your platform. It appears in the browser tab title, search engine results, and key branding areas like the header and footer."
                },
                {
                    key: "site_description",
                    label: "Tactical Tagline",
                    type: "text",
                    description: "A short, compelling summary of what your site is about. Used for SEO meta tags to help search engines understand and rank your content."
                },
                {
                    key: "owner_email",
                    label: "Ops Command Email",
                    type: "text",
                    description: "The main administrative contact address. Used for system alerts, contact form notifications, and primary support communication."
                },
            ]
        },
        {
            id: "social",
            title: "Transmission Channels",
            icon: Share2,
            description: "Direct links to social media ecosystems to broaden your content distribution network.",
            fields: [
                {
                    key: "social_x",
                    label: "X.com Protocol",
                    type: "text",
                    description: "Complete URL to your official X (formerly Twitter) profile. Used for social icons in the footer and sharing widgets."
                },
                {
                    key: "social_instagram",
                    label: "Insta Node",
                    type: "text",
                    description: "Full link to your Instagram business or personal page. Vital for visual branding and community engagement."
                },
                {
                    key: "social_whatsapp",
                    label: "WhatsApp Direct",
                    type: "text",
                    description: "Direct link or phone number for WhatsApp communication. Enables users to reach out to you instantly via mobile messaging."
                },
                {
                    key: "social_telegram",
                    label: "Telegram Ops",
                    type: "text",
                    description: "Link to your Telegram channel or personal bot. Preferred for secure and mass-broadcasting updates to subscribers."
                },
            ]
        },
        {
            id: "seo",
            title: "Visibility Matrix",
            icon: Search,
            description: "Optimization parameters to ensure maximum discoverability by search engine crawlers.",
            fields: [
                {
                    key: "meta_keywords",
                    label: "SEO Keywords",
                    type: "text",
                    description: "A comma-separated list of keywords representing your site's main topics. Helps legacy search crawlers categorize your content."
                },
                {
                    key: "google_analytics_id",
                    label: "Analytics Bridge",
                    type: "text",
                    description: "Your unique Google Analytics measurement ID (e.g., G-XXXXXXXXXX). Connects your site to Google's tracking servers for traffic analysis."
                },
            ]
        },
        {
            id: "maintenance",
            title: "Security & Access",
            icon: Lock,
            description: "Control sensitive access protocols and user interaction compliance.",
            fields: [
                {
                    key: "maintenance_mode",
                    label: "Maintenance Shield",
                    type: "switch",
                    description: "When active, redirects all non-admin users to a dedicated maintenance page. Ideal for core system updates or emergency lockdown."
                },
                {
                    key: "allow_comments",
                    label: "Global Comment Stream",
                    type: "switch",
                    description: "Completely enables or disables the ability for users to post new comments across the entire platform."
                },
                {
                    key: "comment_moderation",
                    label: "Moderation Gate",
                    type: "switch",
                    description: "If active, every user comment must be reviewed and manually approved by an administrator before becoming visible to the public."
                },
                {
                    key: "ai_generation_enabled",
                    label: "AI Auto-Pilot",
                    type: "switch",
                    description: "Enables the autonomous news cycle. The system will periodically fetch RSS feeds and use AI to generate and publish new articles automatically."
                },
            ]
        },
        {
            id: "monetization",
            title: "Revenue & Integrations",
            icon: RefreshCw,
            description: "Financial nodes and third-party data tracking configurations.",
            fields: [
                {
                    key: "google_adsense_id",
                    label: "AdSense Client ID",
                    type: "text",
                    description: "Identifies your AdSense account to display ads. Format: ca-pub-XXXXXXXXXXXXXXXX. Leave empty to disable global AdSense integration."
                },
                {
                    key: "adsense_auto_ads",
                    label: "AdSense Auto-Ads",
                    type: "switch",
                    description: "Allows the Google AdSense engine to automatically inject ad placements into the most optimal positions on your pages."
                },
                {
                    key: "google_tag_manager_id",
                    label: "GTM Container",
                    type: "text",
                    description: "Injects the Google Tag Manager script into the <head>. Format: GTM-XXXXXXX. Used for advanced marketing tracking and pixel deployments."
                },
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
                                                <label htmlFor={field.key} className="text-[11px] font-ui font-black text-[#F2F0EB] uppercase tracking-widest">
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
