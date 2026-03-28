"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Booking, type Customer, type Vehicle } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";

function isPopulatedCustomer(c: Booking["customer"]): c is Customer {
  return typeof c === "object" && c !== null && "name" in c;
}

function isPopulatedVehicle(v: Booking["vehicle"]): v is Vehicle {
  return typeof v === "object" && v !== null && "make" in v;
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-800 ring-amber-200/60",
    confirmed: "bg-sky-50 text-sky-800 ring-sky-200/60",
    active: "bg-emerald-50 text-emerald-800 ring-emerald-200/60",
    completed: "bg-slate-100 text-slate-700 ring-slate-200/80",
    cancelled: "bg-red-50 text-red-700 ring-red-200/60",
  };
  return map[status] || "bg-slate-100 text-slate-700 ring-slate-200/80";
}

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    totalCustomers: number;
    totalVehicles: number;
    availableVehicles: number;
    totalBookings: number;
    totalRevenue: number;
  } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, b] = await Promise.all([api.dashboard.stats(), api.bookings.list()]);
        if (!cancelled) {
          setStats(s);
          setBookings(b.slice(0, 8));
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
        {err}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <div className="h-10 w-10 animate-pulse rounded-full bg-brand/30" />
        <p className="text-sm text-ink-muted">Loading dashboard…</p>
      </div>
    );
  }

  const statItems = [
    {
      label: "Total revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      hint: "From active bookings",
      blob: "from-emerald-400/30 to-teal-500/20",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      accent: "from-emerald-500/15 to-teal-500/10 text-emerald-700",
    },
    {
      label: "Bookings",
      value: String(stats.totalBookings),
      hint: "All time",
      blob: "from-sky-400/30 to-brand/25",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      accent: "from-sky-500/15 to-brand/10 text-brand-deep",
    },
    {
      label: "Customers",
      value: String(stats.totalCustomers),
      hint: "On file",
      blob: "from-violet-400/25 to-purple-500/20",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      accent: "from-violet-500/15 to-purple-500/10 text-violet-800",
    },
    {
      label: "Fleet",
      value: `${stats.availableVehicles}/${stats.totalVehicles}`,
      hint: "Available / total",
      blob: "from-amber-400/30 to-orange-500/20",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      accent: "from-amber-500/15 to-orange-500/10 text-amber-800",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your rental business"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((s) => (
          <div
            key={s.label}
            className="card-surface group relative overflow-hidden p-5 transition hover:shadow-card-hover"
          >
            <div
              className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br opacity-90 blur-2xl ${s.blob}`}
              aria-hidden
            />
            <div
              className={`inline-flex rounded-xl bg-gradient-to-br p-2.5 ${s.accent} ring-1 ring-inset ring-black/5`}
            >
              {s.icon}
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-ink">{s.value}</p>
            <p className="mt-1 text-xs text-ink-muted">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="card-surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="text-lg font-semibold text-ink">Recent bookings</h2>
          <Link
            href="/dashboard/bookings"
            className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-200 sm:inline-flex"
          >
            View all
          </Link>
        </div>

        {/* Mobile cards */}
        <ul className="divide-y divide-slate-100 md:hidden">
          {bookings.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-ink-muted">
              No bookings yet.{" "}
              <Link href="/dashboard/bookings" className="font-semibold text-brand">
                Create one
              </Link>
            </li>
          ) : (
            bookings.map((b) => (
              <li key={b._id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink truncate">
                      {isPopulatedCustomer(b.customer) ? b.customer.name : "—"}
                    </p>
                    <p className="text-sm text-ink-muted truncate">
                      {isPopulatedVehicle(b.vehicle)
                        ? `${b.vehicle.make} ${b.vehicle.model}`
                        : "—"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${statusClass(b.status)}`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                  <span>
                    {new Date(b.startDate).toLocaleDateString()} –{" "}
                    {new Date(b.endDate).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-ink">${b.totalAmount.toFixed(2)}</span>
                </div>
              </li>
            ))
          )}
        </ul>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-ink-muted">
              <tr>
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 font-semibold">Vehicle</th>
                <th className="px-6 py-3 font-semibold">Dates</th>
                <th className="px-6 py-3 font-semibold">Amount</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-ink-muted">
                    No bookings yet.{" "}
                    <Link href="/dashboard/bookings" className="font-semibold text-brand hover:underline">
                      Create one
                    </Link>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-3 font-medium text-ink">
                      {isPopulatedCustomer(b.customer) ? b.customer.name : "—"}
                    </td>
                    <td className="px-6 py-3 text-ink-muted">
                      {isPopulatedVehicle(b.vehicle)
                        ? `${b.vehicle.make} ${b.vehicle.model}`
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-ink-muted">
                      {new Date(b.startDate).toLocaleDateString()} –{" "}
                      {new Date(b.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 font-medium text-ink">${b.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${statusClass(b.status)}`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/dashboard/customers" className="btn-secondary flex-1 sm:flex-none">
          Manage customers
        </Link>
        <Link href="/dashboard/vehicles" className="btn-secondary flex-1 sm:flex-none">
          Manage vehicles
        </Link>
      </div>
    </div>
  );
}
