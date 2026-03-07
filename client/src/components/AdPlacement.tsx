import { trpc } from "@/lib/trpc";
import { useEffect, useRef } from "react";

interface AdPlacementProps {
    position: "sidebar" | "banner_top" | "banner_bottom" | "inline";
    className?: string;
}

export default function AdPlacement({ position, className = "" }: AdPlacementProps) {
    const adsQuery = trpc.advertisements.getByPosition.useQuery({ position });
    const containerRef = useRef<HTMLDivElement>(null);

    const ad = adsQuery.data?.[0]; // Get the first active ad for this position

    useEffect(() => {
        if (ad?.adCode && containerRef.current) {
            // Clear container
            containerRef.current.innerHTML = "";

            // Create a range to parse the HTML string including scripts
            const range = document.createRange();
            const documentFragment = range.createContextualFragment(ad.adCode);

            // Append to container
            containerRef.current.appendChild(documentFragment);

            // Log impression (client-side simple tracking could be added here)
        }
    }, [ad]);

    if (adsQuery.isLoading || !ad) return null;

    return (
        <div className={`ad-placement ad-zone-${position} ${className}`}>
            <div className="flex flex-col items-center justify-center">
                <span className="text-[8px] text-[#333333] uppercase tracking-[0.3em] mb-1 font-ui font-bold">Advertisement</span>

                {ad.adCode ? (
                    <div
                        ref={containerRef}
                        className="w-full h-full min-h-[50px] flex items-center justify-center overflow-hidden"
                    />
                ) : (
                    <a
                        href={ad.linkUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full h-full group"
                    >
                        <img
                            src={ad.imageUrl || ''}
                            alt={ad.title}
                            className="w-full h-auto object-contain mx-auto transition-opacity group-hover:opacity-90"
                        />
                    </a>
                )}
            </div>
            <div className="h-px w-full bg-[#1C1C1A] mt-4" />
        </div>
    );
}
