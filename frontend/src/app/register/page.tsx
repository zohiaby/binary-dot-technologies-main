"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { setSession } from "@/lib/auth-storage";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.signup({ name, email, password });
      setSession(res.token, res.admin);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[100dvh] flex items-stretch justify-center">
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-deep"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 pb-safe sm:px-6">
        <div className="card-surface p-6 shadow-card-hover sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">Rent-a-Car</p>
            <h1 className="mt-2 text-2xl font-bold text-ink">Create admin account</h1>
            <p className="mt-1 text-sm text-ink-muted">First-time setup for your business</p>
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
              <label className="mb-1.5 block text-sm font-medium text-ink">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>
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
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
              <p className="mt-1.5 text-xs text-ink-muted">At least 6 characters</p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
