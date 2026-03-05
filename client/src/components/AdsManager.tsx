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
} from "lucide-react";
import ImageUploader from "./ImageUploader";

export default function AdsManager() {
  const [editingAd, setEditingAd] = useState<any>(null);
  const [tempImageUrl, setTempImageUrl] = useState("");
  const adsQuery = trpc.advertisements.getAll.useQuery();

  const startEditing = (ad: any) => {
    setEditingAd(ad);
    setTempImageUrl(ad.imageUrl || "");
  };

  const stopEditing = () => {
    setEditingAd(null);
    setTempImageUrl("");
  };

  const createAdMutation = trpc.advertisements.create.useMutation({
    onSuccess: () => {
      toast.success("Advertisement created successfully");
      stopEditing();
      adsQuery.refetch();
    },
    onError: err =>
      toast.error("Error creating advertisement", { description: err.message }),
  });

  const updateAdMutation = trpc.advertisements.update.useMutation({
    onSuccess: () => {
      toast.success("Advertisement updated successfully");
      stopEditing();
      adsQuery.refetch();
    },
    onError: err =>
      toast.error("Error updating advertisement", { description: err.message }),
  });

  const deleteAdMutation = trpc.advertisements.delete.useMutation({
    onSuccess: () => {
      toast.success("Advertisement deleted");
      adsQuery.refetch();
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const startDateVal = formData.get("startDate") as string;
    const endDateVal = formData.get("endDate") as string;

    const data = {
      title: formData.get("title") as string,
      imageUrl: tempImageUrl,
      linkUrl: formData.get("linkUrl") as string,
      position: formData.get("position") as
        | "sidebar"
        | "banner_top"
        | "banner_bottom"
        | "inline",
      active: formData.get("active") === "on" ? 1 : 0,
      startDate: startDateVal ? new Date(startDateVal) : undefined,
      endDate: endDateVal ? new Date(endDateVal) : undefined,
    };

    if (!data.imageUrl) {
      toast.error("Please upload an image or enter a URL");
      return;
    }

    if (editingAd.id) {
      updateAdMutation.mutate({ id: editingAd.id, ...data });
    } else {
      createAdMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline text-xl md:text-2xl text-[#F2F0EB] mb-1 md:mb-2">
            Ads Manager
          </h2>
          <p className="font-ui text-xs text-[#8A8880]">
            Manage internal banners and affiliate links
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
            className="flex items-center justify-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[10px] md:text-xs font-600 uppercase tracking-wider px-4 md:px-6 py-2.5 md:py-3 rounded-sm transition-colors w-full sm:w-auto"
          >
            <Plus size={16} />
            New Advertisement
          </button>
        )}
      </div>

      {editingAd ? (
        <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-xl text-[#F2F0EB]">
                {editingAd.id ? "Edit Advertisement" : "New Advertisement"}
              </h3>
              <button
                type="button"
                onClick={stopEditing}
                className="text-[#8A8880] hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block">
                  Internal Title
                </label>
                <input
                  name="title"
                  defaultValue={editingAd.title}
                  required
                  className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-sm py-2 px-3 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020] transition-colors text-sm"
                  placeholder="e.g. Amazon Affiliate Sidebar"
                />
              </div>

              <div className="space-y-2">
                <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block">
                  Position
                </label>
                <select
                  name="position"
                  defaultValue={editingAd.position}
                  className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-sm py-2 px-3 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020] transition-colors text-sm"
                >
                  <option value="banner_top">Top Banner (below navbar)</option>
                  <option value="sidebar">Sidebar (articles/home)</option>
                  <option value="inline">Inline (inside articles)</option>
                  <option value="banner_bottom">Bottom Banner</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block">
                  Campaign Start (Optional)
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
                  className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-sm py-2 px-3 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020] transition-colors text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block">
                  Campaign End (Optional)
                </label>
                <input
                  name="endDate"
                  type="date"
                  defaultValue={
                    editingAd.endDate
                      ? new Date(editingAd.endDate).toISOString().split("T")[0]
                      : ""
                  }
                  className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-sm py-2 px-3 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020] transition-colors text-sm"
                />
              </div>

              <div className="space-y-4">
                <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block flex items-center gap-1">
                  <ImageIcon size={10} /> Ad Creative (Image)
                </label>
                <ImageUploader
                  currentImage={tempImageUrl}
                  onImageUpload={url => setTempImageUrl(url)}
                  label="Upload Banner / Image"
                />
                <div className="space-y-1">
                  <p className="font-ui text-[10px] text-[#555550]">
                    Or manually enter image URL:
                  </p>
                  <input
                    name="imageUrl"
                    value={tempImageUrl}
                    onChange={e => setTempImageUrl(e.target.value)}
                    className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-sm py-2 px-3 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020] transition-colors text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block flex items-center gap-1">
                  <LinkIcon size={10} /> Destination URL (Link)
                </label>
                <input
                  name="linkUrl"
                  defaultValue={editingAd.linkUrl}
                  required
                  type="url"
                  className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-sm py-2 px-3 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020] transition-colors text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3 py-4 border-t border-[#2A2A28]">
              <label className="flex items-center gap-2 cursor-pointer font-ui text-sm text-[#F2F0EB]">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={editingAd.active === 1}
                  className="w-4 h-4 accent-[#E8A020]"
                />
                Active (Show on site)
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
                className="flex items-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] px-6 py-2 rounded-sm font-ui text-xs font-600 uppercase tracking-widest transition-colors"
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
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-24 h-16 object-cover bg-[#0F0F0E] rounded-xs border border-[#2A2A28] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full ${ad.active ? "bg-green-500" : "bg-red-500"}`}
                          title={ad.active ? "Active" : "Inactive"}
                        />
                        <h4 className="font-ui font-600 text-[#F2F0EB] truncate">
                          {ad.title}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8A8880] font-ui">
                        <span className="uppercase tracking-widest flex items-center gap-1">
                          P: {ad.position.replace("_", " ")}
                        </span>
                        <a
                          href={ad.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[#E8A020] hover:underline truncate max-w-[200px]"
                        >
                          <LinkIcon size={10} /> {ad.linkUrl}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#2A2A28]">
                    {/* Stats */}
                    <div className="flex gap-4 mr-4">
                      <div className="flex flex-col items-center">
                        <span className="font-ui text-[10px] text-[#555550] uppercase tracking-widest flex items-center">
                          <Eye size={10} className="mr-1" /> Impr
                        </span>
                        <span className="text-[#F2F0EB] font-headline">
                          {ad.impressionCount || 0}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-ui text-[10px] text-[#555550] uppercase tracking-widest flex items-center">
                          <MousePointerClick size={10} className="mr-1" />{" "}
                          Clicks
                        </span>
                        <span className="text-[#E8A020] font-headline">
                          {ad.clickCount || 0}
                        </span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(ad)}
                        className="p-2 text-[#8A8880] hover:text-[#E8A020] hover:bg-[#2A2A28] rounded-sm transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this advertisement?"
                            )
                          )
                            deleteAdMutation.mutate({ id: ad.id });
                        }}
                        className="p-2 text-[#8A8880] hover:text-red-500 hover:bg-red-900/20 rounded-sm transition-colors"
                        title="Delete"
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
