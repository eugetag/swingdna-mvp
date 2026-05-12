import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LM sessions | SwingDNA",
  description: "Log launch monitor practice sessions — ball flight, strike, and club data in one place.",
};

export default function SessionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
