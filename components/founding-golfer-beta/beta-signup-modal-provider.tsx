"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { FoundingGolferBetaModal } from "./founding-golfer-beta-modal";

type BetaSignupModalContextValue = {
  openBetaSignup: () => void;
  closeBetaSignup: () => void;
};

const BetaSignupModalContext = createContext<BetaSignupModalContextValue | null>(null);

export function useBetaSignupModal(): BetaSignupModalContextValue {
  const ctx = useContext(BetaSignupModalContext);
  if (!ctx) {
    throw new Error("useBetaSignupModal must be used within BetaSignupModalProvider");
  }
  return ctx;
}

export function BetaSignupModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const openBetaSignup = useCallback(() => {
    setModalKey((k) => k + 1);
    setOpen(true);
  }, []);
  const closeBetaSignup = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openBetaSignup, closeBetaSignup }),
    [openBetaSignup, closeBetaSignup],
  );

  return (
    <BetaSignupModalContext.Provider value={value}>
      {children}
      <FoundingGolferBetaModal key={modalKey} open={open} onClose={closeBetaSignup} />
    </BetaSignupModalContext.Provider>
  );
}
