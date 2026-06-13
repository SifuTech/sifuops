import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth'

type SearchParams = Promise<{ error?: string; from?: string }>

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { error, from } = await searchParams

  // Already logged in — redirect away
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (token) {
    const session = await verifySessionToken(token)
    if (session) redirect(from ?? '/')
  }

  const hasError = error === '1'

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--background)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo / wordmark */}
        <div className="mb-8 text-center">
          <p className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--foreground-strong)' }}>
            SifuOps
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--subtle)' }}>
            AI Delivery Crew
          </p>
        </div>

        {/* Card */}
        <div className="app-card rounded-3xl p-8">
          <h1 className="mb-6 text-base font-semibold" style={{ color: 'var(--foreground-strong)' }}>
            Sign in
          </h1>

          {hasError && (
            <div
              className="mb-5 rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor: 'rgba(248,113,113,0.3)',
                background: 'rgba(248,113,113,0.08)',
                color: '#fca5a5',
              }}
            >
              Incorrect username or password.
            </div>
          )}

          <form action="/api/auth/login" method="POST" className="space-y-4">
            <input type="hidden" name="from" value={from ?? '/'} />

            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-medium uppercase tracking-widest"
                style={{ color: 'var(--subtle)' }}
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground-strong)',
                  // @ts-expect-error CSS variable
                  '--tw-ring-color': 'rgba(52,211,153,0.4)',
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-widest"
                style={{ color: 'var(--subtle)' }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground-strong)',
                  // @ts-expect-error CSS variable
                  '--tw-ring-color': 'rgba(52,211,153,0.4)',
                }}
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 active:opacity-80"
              style={{
                background: 'var(--primary-button-bg)',
                color: 'var(--primary-button-text)',
              }}
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
