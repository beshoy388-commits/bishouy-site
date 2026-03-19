import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MousePointerClick,
  Save,
  X,
  Loader2,
  Link as LinkIcon,
  Image as ImageIcon,
  Zap,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import ImageUploader from "./ImageUploader";

export default function AdsManager() {
  const [editingAd, setEditingAd] = useState<any>(null);
  const [tempImageUrl, setTempImageUrl] = useState("");
  const [isActive, setIsActive] = useState(1);
  const adsQuery = trpc.advertisements.getAll.useQuery();
  const [adType, setAdType] = useState<"visual" | "code">("visual");

  const startEditing = (ad: any) => {
    setEditingAd(ad);
    setTempImageUrl(ad.imageUrl || "");
    setAdType(ad.adCode ? "code" : "visual");
    setIsActive(ad.active ?? 1);
  };

  const stopEditing = () => {
    setEditingAd(null);
    setTempImageUrl("");
    setAdType("visual");
  };

  const createAdMutation = trpc.advertisements.create.useMutation({
    onSuccess: () => {
      toast.success("Advertisement protocol initialized");
      stopEditing();
      adsQuery.refetch();
    },
    onError: err =>
      toast.error("Deployment Error", { description: err.message }),
  });

  const updateAdMutation = trpc.advertisements.update.useMutation({
    onSuccess: () => {
      toast.success("Operational state updated");
      stopEditing();
      adsQuery.refetch();
    },
    onError: err =>
      toast.error("Transmission Error", { description: err.message }),
  });

  const deleteAdMutation = trpc.advertisements.delete.useMutation({
    onSuccess: () => {
      toast.success("Unit decommissioned");
      adsQuery.refetch();
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const startDateVal = formData.get("startDate") as string;
    const endDateVal = formData.get("endDate") as string;

    const data: any = {
      title: formData.get("title") as string,
      position: formData.get("position") as any,
      active: isActive ? 1 : 0,
      startDate: startDateVal ? new Date(startDateVal) : undefined,
      endDate: endDateVal ? new Date(endDateVal) : undefined,
    };

    if (adType === "visual") {
      data.imageUrl = tempImageUrl;
      data.linkUrl = formData.get("linkUrl") as string;
      data.adCode = null;
      if (!data.imageUrl) {
        toast.error("Visual asset required for banner mode");
        return;
      }
    } else {
      data.adCode = formData.get("adCode") as string;
      data.imageUrl = null;
      data.linkUrl = null;
      if (!data.adCode) {
        toast.error("Source code required for bypass mode");
        return;
      }
    }

    if (editingAd.id) {
      updateAdMutation.mutate({ id: editingAd.id, ...data });
    } else {
      createAdMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#1C1C1A] pb-8">
        <div>
          <h2 className="font-headline text-3xl text-[#F2F0EB] mb-2 uppercase tracking-tighter">
            REVENUE <span className="text-[#E8A020]">CHANNELS</span>
          </h2>
          <p className="font-ui text-xs text-[#8A8880] uppercase tracking-widest">
            Manage banner placements, sponsorships and AdSense integration nodes.
          </p>
        </div>
        {!editingAd && (
          <button
            onClick={() =>
              startEditing({
                position: "sidebar",
                active: 1,
                title: "",
                imageUrl: "",
                linkUrl: "",
              })
            }
            className="flex items-center justify-center gap-3 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[10px] font-bold uppercase tracking-widest px-8 py-3.5 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#E8A020]/10"
          >
            <Plus size={18} />
            Initialize Placement
          </button>
        )}
      </div>

      {editingAd ? (
        <Card className="bg-[#151513] border-[#2A2A28] p-8 max-w-4xl mx-auto shadow-2xl">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="flex justify-between items-center border-b border-[#2A2A28] pb-6">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-[#E8A020] rounded-full" />
                <h3 className="font-headline text-2xl text-[#F2F0EB] uppercase tracking-tight">
                  {editingAd.id ? "RECONFIGURE PLACEMENT" : "INIT NEW UNIT"}
                </h3>
              </div>
              <button
                type="button"
                onClick={stopEditing}
                className="w-10 h-10 rounded-full border border-[#2A2A28] flex items-center justify-center text-[#8A8880] hover:text-[#E2E0D9] hover:border-[#E8A020]/30 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="font-ui text-[11px] font-bold text-[#8A8880] uppercase tracking-widest block">
                  Internal Identifier
                </label>
                <input
                  name="title"
                  defaultValue={editingAd.title}
                  required
                  className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-md py-3 px-4 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]/50 transition-all text-sm font-ui"
                  placeholder="e.g. SIDEBAR_PRIMARY_CAMPAIGN"
                />
              </div>

              <div className="space-y-3">
                <label className="font-ui text-[11px] font-bold text-[#8A8880] uppercase tracking-widest block">
                  Placement Zone
                </label>
                <select
                  name="position"
                  defaultValue={editingAd.position}
                  className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-md py-3 px-4 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]/50 transition-all text-sm font-ui"
                >
                  <option value="banner_top">NAVBAR_BELOW_BANNER</option>
                  <option value="sidebar">ARTICLE_SIDEBAR_UNIT</option>
                  <option value="inline">ARTICLE_INLINE_FEED</option>
                  <option value="banner_bottom">FOOTER_ABOVE_BANNER</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-4">
                <label className="font-ui text-[11px] font-bold text-[#8A8880] uppercase tracking-widest block">
                  AD SOURCE TYPE
                </label>
                <div className="grid grid-cols-2 gap-4 p-1 bg-[#0A0A09] rounded-xl border border-[#2A2A28]">
                  <button
                    type="button"
                    onClick={() => setAdType("visual")}
                    className={`py-3 px-4 rounded-lg font-ui text-[10px] font-bold uppercase tracking-widest transition-all ${adType === 'visual' ? 'bg-[#E8A020] text-[#0F0F0E]' : 'text-[#555550] hover:text-[#8A8880]'}`}
                  >
                    Visual Banner
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdType("code")}
                    className={`py-3 px-4 rounded-lg font-ui text-[10px] font-bold uppercase tracking-widest transition-all ${adType === 'code' ? 'bg-[#2980B9] text-white' : 'text-[#555550] hover:text-[#8A8880]'}`}
                  >
                    Custom Script / AdSense
                  </button>
                </div>
              </div>

              {adType === "visual" ? (
                <>
                  <div className="md:col-span-2 space-y-6">
                    <div className="space-y-3">
                      <label className="font-ui text-[11px] font-bold text-[#8A8880] uppercase tracking-widest block flex items-center gap-2">
                        Visual Asset
                      </label>
                      <ImageUploader
                        currentImage={tempImageUrl}
                        onImageUpload={url => setTempImageUrl(url)}
                        label="Deploy Visual Bundle"
                      />
                      <input
                        name="imageUrl"
                        value={tempImageUrl}
                        onChange={e => setTempImageUrl(e.target.value)}
                        className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-md py-2 px-4 text-[#555550] focus:outline-none text-[10px] font-ui"
                        placeholder="Direct image URL link..."
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="font-ui text-[11px] font-bold text-[#8A8880] uppercase tracking-widest block">
                      Target Protocol (URL)
                    </label>
                    <input
                      name="linkUrl"
                      defaultValue={editingAd.linkUrl}
                      required={adType === 'visual'}
                      type="url"
                      className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-md py-3 px-4 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]/50 transition-all text-sm font-ui"
                      placeholder="https://..."
                    />
                  </div>
                </>
              ) : (
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-ui text-[11px] font-bold text-[#8A8880] uppercase tracking-widest block">
                      EXTERNAL SCRIPT / HTML CODE
                    </label>
                    <span className="text-[9px] font-bold text-[#2980B9] uppercase tracking-widest">Bypass Mode Active</span>
                  </div>
                  <textarea
                    name="adCode"
                    defaultValue={editingAd.adCode}
                    required={adType === 'code'}
                    rows={6}
                    className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-md py-3 px-4 text-[#2980B9] font-mono text-xs focus:outline-none focus:border-[#2980B9]/50 transition-all"
                    placeholder='<ins class="adsbygoogle" ...></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'
                  />
                  <p className="text-[10px] text-[#555550] italic">Past the AdSense snippet or any other HTML/JS banner code here.</p>
                </div>
              )}

              <div className="space-y-3">
                <label className="font-ui text-[11px] font-bold text-[#8A8880] uppercase tracking-widest block">
                  Activation Window (Start)
                </label>
                <input
                  name="startDate"
                  type="date"
                  defaultValue={
                    editingAd.startDate
                      ? new Date(editingAd.startDate)
                        .toISOString()
                        .split("T")[0]
                      : ""
                  }
                  className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-md py-3 px-4 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]/50 transition-all text-sm font-ui"
                />
              </div>

              <div className="space-y-3">
                <label className="font-ui text-[11px] font-bold text-[#8A8880] uppercase tracking-widest block">
                  Activation Window (End)
                </label>
                <input
                  name="endDate"
                  type="date"
                  defaultValue={
                    editingAd.endDate
                      ? new Date(editingAd.endDate).toISOString().split("T")[0]
                      : ""
                  }
                  className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-md py-3 px-4 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]/50 transition-all text-sm font-ui"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 py-6 border-t border-[#2A2A28]">
              <Switch
                id="active"
                checked={isActive === 1}
                onCheckedChange={checked => setIsActive(checked ? 1 : 0)}
              />
              <label htmlFor="active" className="cursor-pointer font-ui text-[11px] font-bold text-[#F2F0EB] uppercase tracking-widest">
                Unit Operational Status
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={stopEditing}
                className="px-4 py-2 text-[#8A8880] hover:text-[#F2F0EB] transition-colors text-sm font-ui"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  createAdMutation.isPending || updateAdMutation.isPending
                }
                className="flex items-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] px-6 py-2 rounded-sm font-ui text-xs font-semibold uppercase tracking-widest transition-colors"
              >
                {createAdMutation.isPending || updateAdMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Save Advertisement
              </button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-sm p-4 text-xs text-[#8A8880]">
            Use this manager to display your custom banners and track clicks.
            For Google AdSense, the tracking script is already natively
            integrated throughout the site.
          </div>
          {adsQuery.isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 size={24} className="animate-spin text-[#E8A020]" />
            </div>
          ) : adsQuery.data?.length === 0 ? (
            <div className="text-center p-8 text-[#555550]">
              No advertisements active yet. Click "New Advertisement".
            </div>
          ) : (
            <div className="grid grid-cols-1 divide-y divide-[#2A2A28] bg-[#1C1C1A] border border-[#2A2A28] rounded-sm">
              {adsQuery.data?.map(ad => (
                <div
                  key={ad.id}
                  className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between hover:bg-[#0F0F0E]/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 w-full">
                    {ad.adCode ? (
                      <div className="w-24 h-16 bg-[#0A0A09] rounded-lg border border-[#2A2A28] flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-[#2980B9] uppercase tracking-tighter">SOURCE CODE</span>
                      </div>
                    ) : (
                      <img
                        src={ad.imageUrl || ''}
                        alt={ad.title}
                        className="w-24 h-16 object-cover bg-[#0F0F0E] rounded-lg border border-[#2A2A28] flex-shrink-0 shadow-lg shadow-black/40"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full ${ad.active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"}`}
                          title={ad.active ? "Active" : "Inactive"}
                        />
                        <h4 className="font-ui font-extrabold text-[#F2F0EB] truncate text-sm uppercase tracking-tight">
                          {ad.title}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[#8A8880] font-ui font-bold">
                        <span className="uppercase tracking-widest flex items-center gap-1.5 px-2 py-0.5 bg-[#0F0F0E] rounded border border-[#2A2A28]">
                          ZONE: {ad.position.replace("_", " ")}
                        </span>
                        {ad.linkUrl && (
                          <a
                            href={ad.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[#E8A020] hover:text-[#D4911C] transition-colors truncate max-w-[200px]"
                          >
                            <LinkIcon size={10} /> TARGET_LINK
                          </a>
                        )}
                        {ad.adCode && (
                          <span className="text-[#2980B9] flex items-center gap-1.5">
                            <Zap size={10} /> SCRIPT_ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 flex-shrink-0 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#2A2A28]">
                    {/* Stats */}
                    <div className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <span className="font-ui text-[9px] text-[#555550] font-black uppercase tracking-widest flex items-center mb-0.5">
                          Visuals
                        </span>
                        <span className="text-[#F2F0EB] font-headline text-lg">
                          {ad.impressionCount || 0}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-ui text-[9px] text-[#555550] font-black uppercase tracking-widest flex items-center mb-0.5">
                          Hits
                        </span>
                        <span className="text-[#E8A020] font-headline text-lg">
                          {ad.clickCount || 0}
                        </span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => startEditing(ad)}
                        className="w-9 h-9 flex items-center justify-center text-[#8A8880] hover:text-[#E8A020] hover:bg-[#E8A020]/5 border border-[#2A2A28] hover:border-[#E8A020]/20 rounded-lg transition-all"
                        title="Edit Configuration"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this placement protocol?"
                            )
                          )
                            deleteAdMutation.mutate({ id: ad.id });
                        }}
                        className="w-9 h-9 flex items-center justify-center text-[#8A8880] hover:text-red-500 hover:bg-red-500/5 border border-[#2A2A28] hover:border-red-500/20 rounded-lg transition-all"
                        title="Decommission"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
