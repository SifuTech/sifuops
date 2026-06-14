import Image from 'next/image'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth'
import { DEMO_COOKIE } from '@/lib/demo'
import PasswordInput from './PasswordInput'
import { ThemeToggle } from '@/components/theme-toggle'

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
  const demoMode = cookieStore.get(DEMO_COOKIE)?.value === '1'

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--background)' }}
    >
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      {/* Demo toggle — bottom right */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <span className="text-xs" style={{ color: demoMode ? 'rgb(251,191,36)' : 'var(--subtle)', opacity: demoMode ? 1 : 0.5 }}>
          Demo
        </span>
        <form action="/api/demo/toggle" method="POST">
          <button
            type="submit"
            aria-label="Toggle demo mode"
            style={{
              position: 'relative',
              display: 'inline-block',
              width: '2rem',
              height: '1.125rem',
              background: demoMode ? 'rgba(251,191,36,0.7)' : 'rgba(148,163,184,0.2)',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
              padding: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '2px',
                left: demoMode ? 'calc(100% - 18px)' : '2px',
                width: '14px',
                height: '14px',
                background: demoMode ? 'rgb(251,191,36)' : 'rgba(148,163,184,0.6)',
                borderRadius: '50%',
                transition: 'left 0.2s',
                display: 'block',
              }}
            />
          </button>
        </form>
      </div>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="https://ssntnzyhcaronhsx.public.blob.vercel-storage.com/9FC033DB-85A7-48ED-8CFC-ABF041E960DC%20%281%29.png"
            alt="SifuOps"
            width={792}
            height={229}
            className="w-auto"
            style={{ height: '211px' }}
            priority
          />
        </div>

        {/* Headings */}
        <div className="mb-6 -mt-16 text-center">
          <h1 className="font-medium" style={{ color: 'var(--foreground-strong)', fontSize: '20px' }}>
            Welcome back
          </h1>
          <p className="mt-1 text-base" style={{ color: 'var(--subtle)' }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Card */}
        <div className="app-card rounded-3xl p-8">
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

            <div className="flex justify-end">
              <a
                href="/forgot-password"
                className="text-xs transition hover:opacity-80"
                style={{ color: '#34d399' }}
              >
                Forgot password?
              </a>
            </div>

            <div className="-mt-3 space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-widest"
                style={{ color: 'var(--subtle)' }}
              >
                Password
              </label>
              <PasswordInput />
            </div>

            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                name="remember"
                value="1"
                className="h-4 w-4 rounded border accent-[#34d399]"
                style={{ borderColor: 'var(--border)' }}
              />
              <span className="text-sm" style={{ color: 'var(--subtle)' }}>
                Remember me for 30 days
              </span>
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold transition hover:opacity-90 active:opacity-80"
              style={{
                background: 'var(--primary-button-bg)',
                color: 'var(--primary-button-text)',
              }}
            >
              Sign in
            </button>
          </form>

          {demoMode && (
            <form action="/api/demo/login" method="POST" className="mt-3">
              <button
                type="submit"
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold transition hover:opacity-90 active:opacity-80"
                style={{
                  background: 'rgba(251,191,36,0.12)',
                  border: '1px solid rgba(251,191,36,0.35)',
                  color: 'rgb(251,191,36)',
                }}
              >
                Enter Demo →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
