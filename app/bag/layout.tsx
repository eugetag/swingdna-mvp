import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My bag | SwingDNA",
  description: "Model your clubs, distances, tendencies, and confidence — SwingDNA bag intelligence.",
};

export default function BagLayout({ children }: { children: React.ReactNode }) {
  return children;
}
