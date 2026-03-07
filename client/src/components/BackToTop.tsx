import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 500) {
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
                "fixed bottom-8 right-8 z-[90] p-3 rounded-sm bg-[#E8A020] text-[#0F0F0E] shadow-2xl transition-all duration-300 hover:bg-[#D4911C] hover:-translate-y-1",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
            )}
            aria-label="Back to top"
        >
            <ArrowUp size={20} />
        </button>
    );
}
