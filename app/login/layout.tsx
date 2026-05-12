import { Suspense, type ReactNode } from "react";

export const metadata = {
  title: "Log in | SwingDNA",
  description: "Sign in to SwingDNA.",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen bg-zinc-950" aria-busy />}>{children}</Suspense>;
}
