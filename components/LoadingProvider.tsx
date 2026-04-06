"use client";

import React, { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface LoadingContextType {
  isTransitioning: boolean;
  navigateWithTransition: (href: string) => void;
  registerLoadingItem: (id: string) => void;
  resolveLoadingItem: (id: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const router = useRouter();

  const registerLoadingItem = (id: string) => {
    setLoadingItems((prev) => new Set(prev).add(id));
  };

  const resolveLoadingItem = (id: string) => {
    setLoadingItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Only consider the transition "complete" when the route has changed AND all items are resolved
  const isActuallyTransitioning = isTransitioning || loadingItems.size > 0;

  // Safety timeout: If stuff takes too long, just force the loading screen to clear
  React.useEffect(() => {
    if (isActuallyTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setLoadingItems(new Set());
      }, 5000); // 5s safety limit
      return () => clearTimeout(timer);
    }
  }, [isActuallyTransitioning]);

  const navigateWithTransition = (href: string) => {
    setIsTransitioning(true);
    setLoadingItems(new Set()); // Reset for the new page

    setTimeout(() => {
      router.push(href);
      // We don't set isTransitioning(false) here because we want to wait for the new page's assets!
      // But we will set a flag that the "routing" is done.
      setIsTransitioning(false); 
    }, 600);
  };

  return (
    <LoadingContext.Provider value={{ 
      isTransitioning: isActuallyTransitioning, 
      navigateWithTransition,
      registerLoadingItem,
      resolveLoadingItem
    }}>
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
