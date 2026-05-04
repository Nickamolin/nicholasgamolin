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
  // showLoader explicitly controls the visibility of the overlay
  const [showLoader, setShowLoader] = useState(true); 
  
  const router = useRouter();
  const pathname = usePathname();
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
      navigationTarget.current = null;
      setIsTransitioning(false);
    }
  }, [pathname]);

  // Main lifecycle: Clear the loader only when items are resolved AND we aren't in a transition
  useEffect(() => {
    if (loadingItems.size === 0 && !isTransitioning) {
      setShowLoader(false);
    }
  }, [loadingItems.size, isTransitioning]);

  // Safety timeout: If stuff takes too long, just force the loading screen to clear
  useEffect(() => {
    if (showLoader) {
      const timer = setTimeout(() => {
        setShowLoader(false);
        setIsTransitioning(false);
        setLoadingItems(new Set());
        navigationTarget.current = null;
      }, 5000); // 5s safety limit
      return () => clearTimeout(timer);
    }
  }, [showLoader]);

  const navigateWithTransition = useCallback((href: string) => {
    if (href === pathname) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigationTarget.current = null;
      setIsTransitioning(false);
      return;
    }

    if (navigationTarget.current === href) return;

    // First manual navigation clears the initial load state
    setIsInitialLoad(false);
    
    // Explicitly start a transition "session"
    setIsTransitioning(true);
    setShowLoader(true);
    setLoadingItems(new Set()); 
    navigationTarget.current = href;

    setTimeout(() => {
      router.push(href);
    }, 600);
  }, [router, pathname]);

  return (
    <LoadingContext.Provider value={{
      isTransitioning: showLoader,
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
