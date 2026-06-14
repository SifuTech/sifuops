import Image from 'next/image'
import Link from 'next/link'

export default function ForgotPasswordPage() {
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
            Forgot your password?
          </h1>
          <p className="mt-1 text-base" style={{ color: 'var(--subtle)' }}>
            Contact your administrator to reset it
          </p>
        </div>

        {/* Card */}
        <div className="app-card rounded-3xl p-8 text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>

          <p className="mb-1 text-sm font-medium" style={{ color: 'var(--foreground-strong)' }}>
            Reach out to your admin
          </p>
          <p className="text-sm" style={{ color: 'var(--subtle)' }}>
            Your account credentials are managed by your SifuOps administrator. Ask them to update your password.
          </p>

          <Link
            href="/login"
            className="mt-6 block w-full rounded-xl px-4 py-3 text-sm font-semibold transition hover:opacity-90 active:opacity-80"
            style={{
              background: 'var(--primary-button-bg)',
              color: 'var(--primary-button-text)',
            }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
