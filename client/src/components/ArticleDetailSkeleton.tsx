export default function ArticleDetailSkeleton() {
    return (
        <div className="min-h-screen bg-[#0F0F0E] animate-pulse">
            {/* Hero Skeleton - Match ArticleDetail: h-[300px] md:h-[450px] */}
            <div className="h-[300px] md:h-[450px] bg-[#1C1C1A]" />

            <div className="container py-8 md:py-12">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Back button skeleton */}
                    <div className="h-3 w-24 bg-[#1C1C1A] rounded-sm" />

                    {/* Header skeleton */}
                    <div className="space-y-4">
                        <div className="h-3 w-16 bg-[#E8A020]/10 rounded-sm" />
                        <div className="h-10 w-full bg-[#1C1C1A] rounded-sm" />
                        <div className="h-10 w-2/3 bg-[#1C1C1A] rounded-sm" />
                    </div>

                    {/* Meta skeleton */}
                    <div className="flex gap-4 py-4 border-y border-[#1C1C1A]">
                        <div className="h-3 w-20 bg-[#1C1C1A] rounded-sm" />
                        <div className="h-3 w-20 bg-[#1C1C1A] rounded-sm" />
                        <div className="h-3 w-20 bg-[#1C1C1A] rounded-sm" />
                    </div>

                    {/* Body skeleton */}
                    <div className="space-y-5 pt-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                            <div key={i} className={`h-3.5 bg-[#1C1C1A] rounded-sm ${i % 4 === 0 ? 'w-full' : i % 4 === 1 ? 'w-[96%]' : i % 4 === 2 ? 'w-[92%]' : 'w-[85%]'}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
