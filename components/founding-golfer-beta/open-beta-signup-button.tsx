"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useBetaSignupModal } from "./beta-signup-modal-provider";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick"> & {
  children: ReactNode;
};

/** Opens the Founding Golfer Beta signup modal. Must render under {@link BetaSignupModalProvider}. */
export function OpenBetaSignupButton({ children, ...rest }: Props) {
  const { openBetaSignup } = useBetaSignupModal();
  return (
    <button type="button" onClick={openBetaSignup} {...rest}>
      {children}
    </button>
  );
}
