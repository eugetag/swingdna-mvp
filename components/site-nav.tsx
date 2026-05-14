"use client";

import { useBetaSignupModal } from "@/components/founding-golfer-beta/beta-signup-modal-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const routes = [
  { href: "/", label: "Home" },
  { href: "/profile", label: "Profile" },
  { href: "/bag", label: "Bag" },
  { href: "/sessions", label: "Sessions" },
  { href: "/report", label: "Report" },
] as const;

const marketingAnchors = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
] as const;

const accountRoutes = [
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
  { href: "/account", label: "Account" },
] as const;

type SiteNavProps = {
  className?: string;
};

function navLinkClass(active: boolean) {
  return active
    ? "text-sm font-medium text-emerald-300"
    : "text-sm text-zinc-400 transition hover:text-white";
}

function mobileRowClass(active: boolean) {
  return active
    ? "block w-full border-b border-white/[0.06] px-4 py-3.5 text-left text-base font-medium text-emerald-300"
    : "block w-full border-b border-white/[0.06] px-4 py-3.5 text-left text-base text-zinc-200 transition hover:bg-white/[0.04] hover:text-white";
}

function MenuGlyph({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-zinc-200" aria-hidden>
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-zinc-200" aria-hidden>
      <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SiteNav({ className }: SiteNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { openBetaSignup } = useBetaSignupModal();
  const isHome = pathname === "/";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className={`flex min-w-0 flex-1 justify-end ${className ?? ""}`}>
      {/* Desktop / tablet — horizontal */}
      <nav
        className="hidden min-w-0 max-w-full items-center gap-x-3 overflow-x-auto py-0.5 [scrollbar-width:none] md:flex md:gap-x-4 lg:gap-x-6 [&::-webkit-scrollbar]:hidden"
        aria-label="Main"
      >
        <div className="flex flex-nowrap items-center gap-x-3 md:gap-x-4 lg:gap-x-5">
          {routes.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={navLinkClass(active)}
                {...(active ? { "aria-current": "page" as const } : {})}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div
          className="flex flex-nowrap items-center gap-x-2 border-l border-white/10 pl-3 md:gap-x-3 md:pl-4 lg:pl-5"
          aria-label="Account"
        >
          {accountRoutes.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={navLinkClass(active)}
                {...(active ? { "aria-current": "page" as const } : {})}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {isHome ? (
          <>
            <nav
              className="hidden flex-nowrap items-center gap-x-4 border-l border-white/10 pl-3 text-sm text-zinc-400 md:flex lg:gap-x-5 lg:pl-4"
              aria-label="Page sections"
            >
              {marketingAnchors.map(({ href, label }) => (
                <a key={href} href={href} className="whitespace-nowrap transition hover:text-white">
                  {label}
                </a>
              ))}
            </nav>
            <button
              type="button"
              onClick={openBetaSignup}
              className="hidden shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950 shadow-sm transition hover:bg-zinc-100 md:inline-flex md:items-center"
            >
              Request access
            </button>
          </>
        ) : null}
      </nav>

      {/* Mobile — menu control */}
      <div className="relative shrink-0 md:hidden">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm font-medium text-zinc-100 shadow-sm transition hover:border-emerald-500/30 hover:bg-white/[0.08] hover:text-white"
          aria-expanded={open}
          aria-controls="site-mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <MenuGlyph open={open} />
          <span>Menu</span>
        </button>

        {open ? (
          <div
            id="site-mobile-menu"
            className="fixed inset-0 z-[100] flex flex-col bg-zinc-950/98 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <span className="text-sm font-semibold tracking-wide text-white">Menu</span>
              <button
                type="button"
                onClick={close}
                className="rounded-lg border border-white/10 p-2 text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                aria-label="Close menu"
              >
                <span className="block h-5 w-5 text-lg leading-none" aria-hidden>
                  ×
                </span>
              </button>
            </div>
            <nav
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-0 py-2"
              aria-label="Main mobile"
            >
              {routes.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={mobileRowClass(active)}
                    onClick={close}
                    {...(active ? { "aria-current": "page" as const } : {})}
                  >
                    {label}
                  </Link>
                );
              })}
              {accountRoutes.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={mobileRowClass(active)}
                    onClick={close}
                    {...(active ? { "aria-current": "page" as const } : {})}
                  >
                    {label}
                  </Link>
                );
              })}
              {isHome ? (
                <>
                  <p className="px-4 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    This page
                  </p>
                  {marketingAnchors.map(({ href, label }) => (
                    <a key={href} href={href} className={mobileRowClass(false)} onClick={close}>
                      {label}
                    </a>
                  ))}
                  <button
                    type="button"
                    className="mx-4 mt-4 flex w-[calc(100%-2rem)] items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_24px_rgba(16,185,129,0.25)]"
                    onClick={() => {
                      close();
                      openBetaSignup();
                    }}
                  >
                    Request access
                  </button>
                </>
              ) : null}
            </nav>
          </div>
        ) : null}
      </div>
    </div>
  );
}
