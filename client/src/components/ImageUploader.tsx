import { useState, useRef, useEffect } from "react";
import { Upload, Loader2, X, ZoomIn, ZoomOut, Check, Move, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { motion, useMotionValue } from "framer-motion";

interface ImageUploaderProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  label?: string;
  isCircle?: boolean;
}

export default function ImageUploader({
  onImageUpload,
  currentImage,
  label = "Upload Image",
  isCircle = true,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || "");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isLandscape, setIsLandscape] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Cropping State
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const resetAdjustment = () => {
    setZoom(1);
    x.set(0);
    y.set(0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLocalPreview(reader.result as string);
      resetAdjustment();
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImageSize({ width: naturalWidth, height: naturalHeight });
    setIsLandscape(naturalWidth > naturalHeight);
  };

  const handleProcessAndUpload = async () => {
    if (!localPreview || !imageRef.current || !containerRef.current) return;

    setIsUploading(true);
    
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;
      const container = containerRef.current;

      if (!ctx) throw new Error("Context failed");

      // Set target size
      const targetSize = 512;
      canvas.width = targetSize;
      canvas.height = targetSize;

      // Precision Extraction
      const rect = img.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();

      // Unified scale factor to prevent 'consumata' or skewed results
      const exportScale = img.naturalWidth / rect.width;

      const sx = (contRect.left - rect.left) * exportScale;
      const sy = (contRect.top - rect.top) * exportScale;
      const sw = contRect.width * exportScale;
      const sh = contRect.height * exportScale;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetSize, targetSize);

      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95));
      
      const formData = new FormData();
      formData.append("file", new File([blob], "profile.jpg", { type: "image/jpeg" }));

      const response = await fetch(`/api/upload?width=512&height=512&fit=cover`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Sync failed");

      const data = await response.json();
      setPreviewUrl(data.url);
      setLocalPreview(null);
      onImageUpload(data.url);
      toast.success("Profile photo updated!");
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Sync failure");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearImage = () => {
    setPreviewUrl("");
    setLocalPreview(null);
    onImageUpload("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Main Trigger View */}
      {!localPreview && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative group border border-[#222220] rounded-sm min-h-48 flex flex-col items-center justify-center cursor-pointer hover:border-[#E8A020] transition-all bg-[#0F0F0E]"
        >
          {previewUrl ? (
            <div className="absolute inset-2">
               <div className="w-full h-full relative overflow-hidden rounded-sm group-hover:opacity-40 transition-opacity">
                  <img src={previewUrl} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" alt="Current Asset" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={20} className="text-[#E8A020]" />
                  </div>
               </div>
            </div>
          ) : (
            <div className="text-center group-hover:scale-110 transition-transform duration-700">
              <Upload size={32} className="text-[#E8A020] mx-auto mb-3 opacity-30 group-hover:opacity-100" />
              <p className="font-ui text-[9px] font-900 uppercase tracking-widest text-[#555550] group-hover:text-[#F2F0EB]">Choose Photo</p>
            </div>
          )}
        </div>
      )}

      {/* Interactive Neural Cropper Interface */}
      {localPreview && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#11110F] border border-[#222220] rounded-sm p-4 md:p-8"
        >
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8A020] animate-pulse" />
                <span className="text-[10px] font-900 text-[#F2F0EB] uppercase tracking-[0.3em] font-ui">Adjust Photo</span>
             </div>
             <button onClick={() => setLocalPreview(null)} className="text-[#555550] hover:text-[#C0392B] transition-colors"><X size={16} /></button>
          </div>

          <div className="flex flex-col items-center gap-10">
            {/* The Precision Mask */}
            <div 
              ref={containerRef}
              className={`relative overflow-hidden bg-[#0F0F0E] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[#1C1C1A] ${isCircle ? "rounded-full w-56 h-56 md:w-72 md:h-72" : "w-full aspect-video"}`}
            >
              <motion.div
                drag
                style={{ x, y }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.img 
                  ref={imageRef}
                  src={localPreview} 
                  onLoad={onImageLoad}
                  alt="Source Asset" 
                  style={{ scale: zoom }}
                  draggable={false}
                  className={`max-w-none pointer-events-none select-none transition-[width,height] ${isLandscape ? "w-auto h-full" : "w-full h-auto"}`} 
                />
              </motion.div>
              
              {/* Reference Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none neural-grid opacity-[0.03]" />
              <div className="absolute inset-0 pointer-events-none border border-[#E8A020]/5 rounded-full ring-1 ring-[#F2F0EB]/5" />
            </div>

            {/* Precision Controls */}
            <div className="w-full max-w-sm space-y-6">
               <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-900 uppercase tracking-[0.2em] text-[#555550]">
                     <span>Zoom Level</span>
                     <span className="text-[#E8A020]">{Math.round(zoom * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <ZoomOut size={16} className="text-[#2A2A28]" />
                     <input 
                       type="range" 
                       min="1" 
                       max="4" 
                       step="0.01" 
                       value={zoom}
                       onChange={(e) => setZoom(parseFloat(e.target.value))}
                       className="flex-1 accent-[#E8A020] h-1 bg-[#1C1C1A] rounded-full appearance-none cursor-pointer"
                     />
                     <ZoomIn size={16} className="text-[#2A2A28]" />
                  </div>
               </div>

               <div className="flex gap-3">
                 <button 
                  onClick={resetAdjustment}
                  className="px-5 bg-[#1C1C1A] hover:bg-[#2A2A28] text-[#555550] hover:text-[#E8A020] border border-[#2A2A28] rounded-sm transition-all"
                  title="Reset Adjustment"
                 >
                   <RotateCcw size={18} />
                 </button>
                 <button 
                  onClick={handleProcessAndUpload}
                  disabled={isUploading}
                  className="flex-1 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[10px] font-900 uppercase tracking-[0.2em] py-4 rounded-sm flex items-center justify-center gap-3 transition-all relative group disabled:opacity-50"
                 >
                   {isUploading ? <Loader2 className="animate-spin" size={16} /> : <><Check size={18} /> Save Photo</>}
                 </button>
               </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Discard Mechanism */}
      {previewUrl && !localPreview && (
         <button onClick={handleClearImage} className="text-[10px] text-[#2A2A28] hover:text-[#C0392B] uppercase tracking-widest font-900 transition-colors flex items-center gap-2 mt-4">
            <X size={12} /> Remove photo
         </button>
      )}
    </div>
  );
}
