"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { setSession } from "@/lib/auth-storage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      setSession(res.token, res.admin);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[100dvh] flex items-stretch justify-center md:min-h-screen">
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-deep md:block"
        aria-hidden
      />
      <div
        className="absolute inset-0 hidden md:block md:w-1/2 md:bg-gradient-to-br from-brand/20 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-6xl flex-col md:flex-row md:items-center md:gap-12 md:px-8 lg:px-12">
        <div className="hidden shrink-0 px-6 pt-10 text-white md:block md:max-w-md md:px-0 md:pt-0 lg:max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">Welcome back</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight lg:text-4xl">Run your rental desk from anywhere.</h1>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Secure admin access with JWT. Your fleet data stays organized and ready on mobile or desktop.
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center px-4 py-10 pb-safe sm:px-6 md:py-12">
          <div className="mx-auto w-full max-w-md card-surface p-6 shadow-card-hover sm:p-8">
            <div className="mb-6 md:hidden">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">Rent-a-Car</p>
              <h1 className="mt-2 text-2xl font-bold text-ink">Sign in</h1>
              <p className="mt-1 text-sm text-ink-muted">Access your admin dashboard</p>
            </div>
            <div className="hidden md:block mb-6">
              <h1 className="text-2xl font-bold text-ink">Admin login</h1>
              <p className="mt-1 text-sm text-ink-muted">Sign in to manage your fleet</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {error ? (
                <p
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-sm text-red-700"
                >
                  {error}
                </p>
              ) : null}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-ink-muted">
              No account?{" "}
              <Link href="/register" className="font-semibold text-brand hover:text-brand-dark">
                Sign up
              </Link>
            </p>
            <p className="mt-4 text-center">
              <Link href="/" className="text-sm text-ink-muted hover:text-ink">
                ← Back home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
