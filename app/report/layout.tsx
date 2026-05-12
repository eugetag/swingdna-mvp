import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Performance report | SwingDNA",
  description:
    "AI golf performance brief — profile, bag, launch monitor session, and prioritized practice plan.",
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
