import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 1200) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={cn(
                "fixed bottom-32 md:bottom-16 right-6 z-[90] p-2.5 rounded-full bg-[#1C1C1A] border border-[#2A2A28] text-[#E8A020] shadow-2xl transition-all duration-500 hover:bg-[#E8A020] hover:text-[#0F0F0E] active:scale-90",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
            )}
            aria-label="Back to top"
        >
            <ArrowUp size={18} className="md:w-5 md:h-5" />
        </button>
    );
}
