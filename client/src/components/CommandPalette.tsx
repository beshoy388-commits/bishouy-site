import * as React from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  Search, 
  Globe, 
  Cpu, 
  PieChart, 
  ShieldCheck, 
  Users, 
  Settings,
  ArrowRight,
  Sparkles,
  Newspaper
} from "lucide-react";
import { CATEGORIES } from "@/lib/articles";

export default function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 md:right-8 z-50 p-3 bg-[#E8A020] text-[#0F0F0E] rounded-full shadow-2xl hover:scale-110 transition-transform hidden md:flex items-center gap-2 group border border-[#0F0F0E]/20"
      >
        <Search size={20} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-ui text-[10px] font-900 uppercase tracking-widest whitespace-nowrap">Intelligence Search (⌘K)</span>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="bg-[#0F0F0E] border-[#1C1C1A]">
          <CommandInput 
            placeholder="Type a command or search intelligence..." 
            className="font-ui border-none focus:ring-0 text-[#F2F0EB]"
          />
          <CommandList className="bg-[#0F0F0E] border-t border-[#1C1C1A] text-[#8A8880] scrollbar-thin">
            <CommandEmpty>No results found.</CommandEmpty>
            
            <CommandGroup heading="Intelligence Nodes (Categories)">
              {CATEGORIES.map((cat) => (
                <CommandItem
                  key={cat.slug}
                  onSelect={() => runCommand(() => setLocation(`/category/${cat.slug}`))}
                  className="hover:bg-[#1C1C1A] aria-selected:bg-[#1C1C1A] cursor-pointer py-3"
                >
                  <ArrowRight size={14} className="mr-3 text-[#E8A020]" />
                  <span className="font-ui text-sm text-[#F2F0EB] uppercase tracking-wider">{cat.name} Archive</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator className="bg-[#1C1C1A]" />

            <CommandGroup heading="Neural Access">
               <CommandItem
                onSelect={() => runCommand(() => setLocation("/"))}
                className="hover:bg-[#1C1C1A] aria-selected:bg-[#1C1C1A] cursor-pointer py-3"
              >
                <Newspaper size={14} className="mr-3 text-[#8A8880]" />
                <span className="font-ui text-sm">Main News Feed</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => setLocation("/ai-ethics"))}
                className="hover:bg-[#1C1C1A] aria-selected:bg-[#1C1C1A] cursor-pointer py-3"
              >
                <ShieldCheck size={14} className="mr-3 text-[#8A8880]" />
                <span className="font-ui text-sm">AI Ethics & Transparency</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => setLocation("/editorial-team"))}
                className="hover:bg-[#1C1C1A] aria-selected:bg-[#1C1C1A] cursor-pointer py-3"
              >
                <Users size={14} className="mr-3 text-[#8A8880]" />
                <span className="font-ui text-sm">Editorial Team</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator className="bg-[#1C1C1A]" />

            <CommandGroup heading="System">
              <CommandItem className="py-3">
                <Settings size={14} className="mr-3 text-[#8A8880]" />
                <span className="font-ui text-sm">Preference Logic (Coming Soon)</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
          
          <div className="flex items-center justify-between p-3 border-t border-[#1C1C1A] bg-[#0A0A09]">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <kbd className="px-1.5 py-0.5 rounded bg-[#1C1C1A] text-[#8A8880] text-[10px] font-mono border border-[#2A2A28]">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-[#1C1C1A] text-[#8A8880] text-[10px] font-mono border border-[#2A2A28]">K</kbd>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[#555550] font-ui">Neural Link Active</span>
             </div>
             <Sparkles size={12} className="text-[#E8A020] animate-pulse" />
          </div>
        </div>
      </CommandDialog>
    </>
  );
}
