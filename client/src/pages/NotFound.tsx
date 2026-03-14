import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F0E]">
      <SEO title="404 - Page Not Found" noindex={true} />
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center pt-24 pb-12">
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
              <h2 className="font-display text-3xl md:text-4xl text-[#F2F0EB] font-700 uppercase tracking-tight">
                Page Not Found
              </h2>
              <div className="h-1 w-12 bg-[#E8A020] mx-auto" />
              <p className="font-ui text-[#8A8880] text-sm md:text-base leading-relaxed max-w-md mx-auto uppercase tracking-wide">
                The archive you are attempting to access does not exist or has been relocated within our database.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/">
                <Button className="w-full sm:w-auto bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-800 uppercase tracking-[0.2em] px-8 py-6 rounded-sm transition-all shadow-xl">
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
