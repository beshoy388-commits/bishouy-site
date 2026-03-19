import React, { createContext, useContext, useState } from "react";

interface UIContextType {
    isSearchOpen: boolean;
    setIsSearchOpen: (open: boolean) => void;
    isShadowMode: boolean;
    setIsShadowMode: (mode: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isShadowMode, setIsShadowMode] = useState(false);

    return (
        <UIContext.Provider value={{ 
            isSearchOpen, 
            setIsSearchOpen,
            isShadowMode,
            setIsShadowMode
        }}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error("useUI must be used within a UIProvider");
    }
    return context;
}
