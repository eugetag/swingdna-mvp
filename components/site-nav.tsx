"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  { href: "/", label: "Home" },
  { href: "/profile", label: "Profile" },
  { href: "/bag", label: "Bag" },
  { href: "/sessions", label: "Sessions" },
  { href: "/report", label: "Report" },
] as const;

type SiteNavProps = {
  className?: string;
};

export function SiteNav({ className }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <nav className={className} aria-label="Main">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {routes.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? "text-sm font-medium text-emerald-300"
                    : "text-sm text-zinc-400 transition hover:text-white"
                }
                {...(active ? { "aria-current": "page" as const } : {})}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 border-l border-white/10 pl-4 sm:ml-auto"
          aria-label="Account"
        >
          <Link
            href="/login"
            className={
              pathname === "/login"
                ? "text-sm font-medium text-emerald-300"
                : "text-sm text-zinc-400 transition hover:text-white"
            }
            {...(pathname === "/login" ? { "aria-current": "page" as const } : {})}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={
              pathname === "/signup"
                ? "text-sm font-medium text-emerald-300"
                : "text-sm text-zinc-400 transition hover:text-white"
            }
            {...(pathname === "/signup" ? { "aria-current": "page" as const } : {})}
          >
            Sign up
          </Link>
          <Link
            href="/account"
            className={
              pathname === "/account"
                ? "text-sm font-medium text-emerald-300"
                : "text-sm text-zinc-400 transition hover:text-white"
            }
            {...(pathname === "/account" ? { "aria-current": "page" as const } : {})}
          >
            Account
          </Link>
        </div>
      </div>
    </nav>
  );
}
