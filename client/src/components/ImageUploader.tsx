import { useState, useRef } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  label?: string;
}

export default function ImageUploader({
  onImageUpload,
  currentImage,
  label = "Upload Image",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [procOptions, setProcOptions] = useState({ width: 1200, height: 800, fit: 'inside' });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload to server with neural processing options
      const response = await fetch(`/api/upload?width=${procOptions.width}&height=${procOptions.height}&fit=${procOptions.fit}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const imageUrl = data.url;

      setPreviewUrl(imageUrl);
      onImageUpload(imageUrl);
      toast.success("Intelligence processing complete", { description: "Asset optimized and injected." });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearImage = () => {
    setPreviewUrl("");
    onImageUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Photo Intelligence Options */}
      {!previewUrl && (
        <div className="grid grid-cols-3 gap-2 p-3 bg-[#11110F] border border-[#1C1C1A] rounded-sm mb-2">
          <div className="space-y-1">
            <span className="text-[8px] font-900 text-[#555550] uppercase tracking-widest block">Width</span>
            <select
              value={procOptions.width}
              onChange={e => setProcOptions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
              className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[10px] text-[#F2F0EB] p-1 outline-none"
            >
              <option value="800">800px</option>
              <option value="1200">1200px</option>
              <option value="1920">1920px</option>
            </select>
          </div>
          <div className="space-y-1">
            <span className="text-[8px] font-900 text-[#555550] uppercase tracking-widest block">Height</span>
            <select
              value={procOptions.height}
              onChange={e => setProcOptions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
              className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[10px] text-[#F2F0EB] p-1 outline-none"
            >
              <option value="600">600px</option>
              <option value="800">800px</option>
              <option value="1080">1080px</option>
            </select>
          </div>
          <div className="space-y-1">
            <span className="text-[8px] font-900 text-[#555550] uppercase tracking-widest block">Fit Mode</span>
            <select
              value={procOptions.fit}
              onChange={e => setProcOptions(prev => ({ ...prev, fit: e.target.value }))}
              className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[10px] text-[#F2F0EB] p-1 outline-none"
            >
              <option value="cover">Crop</option>
              <option value="contain">Contain</option>
              <option value="inside">Inside</option>
            </select>
          </div>
        </div>
      )}

      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative border-2 border-dashed border-[#2A2A28] rounded-sm p-8 cursor-pointer hover:border-[#E8A020] transition-colors bg-[#0F0F0E] hover:bg-[#0F0F0E]/80"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3">
          {isUploading ? (
            <>
              <Loader2 className="animate-spin text-[#E8A020]" size={32} />
              <p className="font-ui text-[10px] font-bold text-[#E8A020] uppercase tracking-widest">Neural Processing...</p>
            </>
          ) : (
            <>
              <Upload size={32} className="text-[#E8A020]" />
              <div className="text-center">
                <p className="font-ui text-sm font-600 text-[#F2F0EB]">
                  {label}
                </p>
                <p className="font-ui text-[10px] text-[#555550] mt-1 uppercase tracking-widest font-bold">
                  Click to scan or drag asset
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {previewUrl && (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full max-h-64 object-cover rounded-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80";
            }}
          />
          {!isUploading && (
            <button
              type="button"
              onClick={handleClearImage}
              className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-sm transition-colors"
            >
              <X size={16} className="text-white" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
