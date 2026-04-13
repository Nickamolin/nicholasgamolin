"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface LoadingContextType {
  isTransitioning: boolean;
  isInitialLoad: boolean;
  navigateWithTransition: (href: string) => void;
  registerLoadingItem: (id: string) => void;
  resolveLoadingItem: (id: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Track the navigation target so we can detect when the route actually changes
  const navigationTarget = useRef<string | null>(null);

  const registerLoadingItem = useCallback((id: string) => {
    setLoadingItems((prev) => new Set(prev).add(id));
  }, []);

  const resolveLoadingItem = useCallback((id: string) => {
    setLoadingItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Detect when the route has actually changed to the target
  useEffect(() => {
    if (navigationTarget.current && pathname === navigationTarget.current) {
      // Route has changed — clear the transitioning flag.
      // If the new page has registered loadingItems, those will keep
      // isActuallyTransitioning true until all assets resolve.
      navigationTarget.current = null;
      setIsTransitioning(false);
    }
  }, [pathname]);

  // Only consider the transition "complete" when the route has changed AND all items are resolved
  const isActuallyTransitioning = isTransitioning || loadingItems.size > 0;

  // Safety timeout: If stuff takes too long, just force the loading screen to clear
  useEffect(() => {
    if (isActuallyTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setLoadingItems(new Set());
        navigationTarget.current = null;
      }, 5000); // 5s safety limit
      return () => clearTimeout(timer);
    }
  }, [isActuallyTransitioning]);

  const navigateWithTransition = useCallback((href: string) => {
    // If we're already navigating to this target, ignore
    if (navigationTarget.current === href) return;

    // First navigation clears the initial load state
    setIsInitialLoad(false);
    setIsTransitioning(true);
    setLoadingItems(new Set()); // Reset for the new page
    navigationTarget.current = href;

    // Wait for the overlay to become fully opaque before pushing the route.
    // The 600ms matches the loading screen's fade-in duration.
    setTimeout(() => {
      router.push(href);
      // We do NOT set isTransitioning(false) here.
      // The pathname useEffect above will clear it once the route actually changes.
    }, 600);
  }, [router]);

  return (
    <LoadingContext.Provider value={{
      isTransitioning: isActuallyTransitioning,
      isInitialLoad,
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
