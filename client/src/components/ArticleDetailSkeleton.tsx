export default function ArticleDetailSkeleton() {
    return (
        <div className="min-h-screen bg-[#0F0F0E] animate-pulse pt-24">
            {/* Hero Skeleton */}
            <div className="h-[400px] md:h-[550px] bg-[#1C1C1A]" />

            <div className="container py-12 md:py-16">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Back button skeleton */}
                    <div className="h-4 w-32 bg-[#1C1C1A] rounded-sm" />

                    {/* Header skeleton */}
                    <div className="space-y-4">
                        <div className="h-4 w-24 bg-[#E8A020]/20 rounded-sm" />
                        <div className="h-12 w-full bg-[#1C1C1A] rounded-sm" />
                        <div className="h-12 w-3/4 bg-[#1C1C1A] rounded-sm" />
                    </div>

                    {/* Meta skeleton */}
                    <div className="flex gap-6 py-4 border-y border-[#1C1C1A]">
                        <div className="h-4 w-24 bg-[#1C1C1A] rounded-sm" />
                        <div className="h-4 w-24 bg-[#1C1C1A] rounded-sm" />
                        <div className="h-4 w-24 bg-[#1C1C1A] rounded-sm" />
                    </div>

                    {/* Body skeleton */}
                    <div className="space-y-4 pt-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className={`h-4 bg-[#1C1C1A] rounded-sm ${i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-11/12' : 'w-4/5'}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
