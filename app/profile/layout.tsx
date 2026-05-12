import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Player profile | SwingDNA",
  description: "Build your SwingDNA golfer profile — handicap, distances, tendencies, and goals.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
