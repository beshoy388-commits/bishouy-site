import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F0E]">
      <SEO title="Page Not Found | BISHOUY" noindex={true} />
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center pb-12">
        <div className="container max-w-2xl px-6">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="p-4 bg-[#E8A020]/10 rounded-full">
                <AlertCircle className="h-16 w-16 text-[#E8A020]" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="font-display text-7xl md:text-9xl text-[#F2F0EB] font-900 tracking-tighter uppercase opacity-20">
                404
              </h1>
              <h2 className="font-display text-3xl md:text-4xl text-[#F2F0EB] font-bold uppercase tracking-tight">
                Page Not Found
              </h2>
              <div className="h-1 w-12 bg-[#E8A020] mx-auto" />
              <p className="font-ui text-[#8A8880] text-sm md:text-base leading-relaxed max-w-md mx-auto uppercase tracking-wide">
                This page doesn't exist or has been moved.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <p className="font-ui text-[10px] text-[#555550] uppercase tracking-[0.2em]">Try searching for what you were looking for:</p>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = (e.target as any).search.value;
                  if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
                }}
                className="relative"
              >
                <input 
                  name="search"
                  type="text" 
                  placeholder="Search bishouy.com..." 
                  className="w-full bg-[#1C1C1A] border border-[#222220] rounded-sm py-3 px-4 text-[#F2F0EB] text-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555550] hover:text-[#E8A020]">
                   <ArrowLeft className="rotate-180" size={16} />
                </button>
              </form>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/">
                <Button className="w-full sm:w-auto bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-800 uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-all shadow-xl">
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
