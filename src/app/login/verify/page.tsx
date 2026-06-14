import Image from 'next/image'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyPendingToken, PENDING_COOKIE } from '@/lib/auth'

type SearchParams = Promise<{ error?: string }>

export default async function VerifyTotpPage({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams

  const cookieStore = await cookies()
  const pendingToken = cookieStore.get(PENDING_COOKIE)?.value
  if (!pendingToken) redirect('/login')
  const pending = await verifyPendingToken(pendingToken)
  if (!pending) redirect('/login')

  const hasError = error === '1'

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--background)' }}
    >
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
            Two-factor authentication
          </h1>
          <p className="mt-1 text-base" style={{ color: 'var(--subtle)' }}>
            Enter the code from your authenticator app
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
              Incorrect code. Please try again.
            </div>
          )}

          <form action="/api/auth/verify-totp" method="POST" className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="code"
                className="block text-xs font-medium uppercase tracking-widest"
                style={{ color: 'var(--subtle)' }}
              >
                Authenticator code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                required
                autoFocus
                className="w-full rounded-xl border px-4 py-2.5 text-center text-lg tracking-[0.5em] outline-none transition focus:ring-2"
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
              className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold transition hover:opacity-90 active:opacity-80"
              style={{
                background: 'var(--primary-button-bg)',
                color: 'var(--primary-button-text)',
              }}
            >
              Verify
            </button>
          </form>

          <div className="mt-5 text-center">
            <a
              href="/login"
              className="text-sm transition hover:opacity-80"
              style={{ color: 'var(--subtle)' }}
            >
              ← Back to sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
