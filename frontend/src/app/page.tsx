import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-deep"
        aria-hidden
      />
      <div
        className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand/25 blur-3xl sm:h-96 sm:w-96"
        aria-hidden
      />
      <div
        className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-90"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 py-16 pb-safe">
        <div className="mx-auto max-w-lg text-center animate-slide-up">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">
            Fleet control
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl text-balance">
            Rent-a-Car Admin
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            Customers, vehicles, and bookings in one calm dashboard—built for desk and phone.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/login" className="btn-primary min-h-[48px] w-full sm:w-auto px-8 text-base shadow-lg shadow-black/20">
              Admin login
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-8 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 sm:w-auto"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
