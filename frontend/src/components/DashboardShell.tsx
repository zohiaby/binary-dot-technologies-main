"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getStoredAdmin, getToken } from "@/lib/auth-storage";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/vehicles", label: "Vehicles" },
  { href: "/dashboard/bookings", label: "Bookings" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setAdmin(getStoredAdmin());
    setReady(true);
  }, [router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  if (!ready) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-3 bg-slate-100 px-4">
        <div
          className="h-9 w-9 animate-pulse rounded-full bg-gradient-to-br from-brand to-brand-dark opacity-80"
          aria-hidden
        />
        <p className="text-sm text-ink-muted">Checking session…</p>
      </div>
    );
  }

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <nav
      className={
        mobile
          ? "flex flex-col gap-1 p-3"
          : "hidden md:flex flex-col gap-1 border-t border-slate-100/80 pt-4"
      }
    >
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setMenuOpen(false)}
            className={`rounded-xl px-3 py-3 text-sm font-medium transition sm:py-2.5 touch-manipulation ${
              active
                ? "bg-gradient-to-r from-brand/15 to-brand/5 text-brand-deep shadow-sm"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-slate-100 md:bg-transparent">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">Fleet</p>
          <p className="truncate text-sm font-semibold text-ink">Rent-a-Car</p>
        </div>
        <button
          type="button"
          className="btn-ghost rounded-xl border border-slate-200 bg-white px-3 text-ink"
          aria-expanded={menuOpen}
          aria-controls="mobile-drawer"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="sr-only">Menu</span>
          {menuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Drawer overlay + panel (mobile) */}
      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm md:hidden animate-fade-in"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="mobile-drawer"
            className="fixed inset-y-0 left-0 z-50 flex w-[min(100%,18rem)] flex-col border-r border-slate-200/80 bg-white shadow-nav md:hidden"
          >
            <div className="border-b border-slate-100 px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">Rent-a-Car</p>
              <p className="mt-1 text-base font-semibold text-ink">Admin</p>
              {admin && (
                <p className="mt-2 truncate text-xs text-ink-muted" title={admin.email}>
                  {admin.name}
                </p>
              )}
            </div>
            <NavLinks mobile />
            <div className="mt-auto border-t border-slate-100 p-4 pb-safe">
              <button
                type="button"
                onClick={logout}
                className="w-full rounded-xl border border-red-100 bg-red-50 py-3 text-sm font-semibold text-red-700 touch-manipulation hover:bg-red-100"
              >
                Log out
              </button>
            </div>
          </div>
        </>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-slate-200/80 md:bg-white/90 md:backdrop-blur md:shadow-nav lg:w-64">
        <div className="p-6 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">Rent-a-Car</p>
          <p className="mt-1 text-lg font-bold tracking-tight text-ink">Admin panel</p>
        </div>
        <div className="flex-1 px-3">
          <NavLinks />
        </div>
        <div className="border-t border-slate-100 p-4">
          {admin && (
            <p className="mb-3 truncate text-xs text-ink-muted" title={admin.email}>
              {admin.name}
            </p>
          )}
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-xl py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 px-2"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="min-h-0 flex-1 overflow-x-hidden px-4 py-5 pb-safe sm:px-5 md:px-8 md:py-8 lg:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
