export default function ArticleCardSkeleton({ variant = "medium" }: { variant?: "featured" | "medium" | "small" | "horizontal" }) {
    if (variant === "featured") {
        return (
            <div className="h-full min-h-[480px] bg-[#1C1C1A] animate-pulse rounded-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0E] via-[#0F0F0E]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                    <div className="h-4 w-24 bg-[#2A2A28] rounded-sm" />
                    <div className="h-10 w-3/4 bg-[#2A2A28] rounded-sm" />
                    <div className="h-4 w-1/2 bg-[#2A2A28] rounded-sm" />
                </div>
            </div>
        );
    }

    if (variant === "horizontal") {
        return (
            <div className="flex gap-4 p-2 animate-pulse bg-[#1C1C1A]/50 rounded-sm">
                <div className="w-24 h-24 bg-[#2A2A28] rounded-sm shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-16 bg-[#2A2A28] rounded-sm" />
                    <div className="h-4 w-full bg-[#2A2A28] rounded-sm" />
                    <div className="h-3 w-1/2 bg-[#2A2A28] rounded-sm" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-pulse">
            <div className="aspect-video bg-[#2A2A28] rounded-sm" />
            <div className="space-y-2">
                <div className="h-3 w-20 bg-[#2A2A28] rounded-sm" />
                <div className="h-5 w-full bg-[#2A2A28] rounded-sm" />
                <div className="h-5 w-4/5 bg-[#2A2A28] rounded-sm" />
            </div>
        </div>
    );
}
