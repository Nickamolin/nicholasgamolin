"use client";

import React, { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface LoadingContextType {
  isTransitioning: boolean;
  navigateWithTransition: (href: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const navigateWithTransition = (href: string) => {
    // 1. Trigger the fade-in (the loading screen will see this and show up)
    setIsTransitioning(true);

    // 2. Wait for the fade-in animation to complete (500ms match with CSS transition)
    setTimeout(() => {
      // 3. Navigation
      router.push(href);
      
      // 4. We will rely on the LoadingScreen's own logic to fade out 
      // once it detects the pathname has changed, or we can manually set it.
      // For now, let's just keep it on until the next page is ready.
      // The LoadingScreen component will reset its internal state on pathname change.
      setIsTransitioning(false);
    }, 600); // Slightly longer than the transition to be safe
  };

  return (
    <LoadingContext.Provider value={{ isTransitioning, navigateWithTransition }}>
      {children}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
