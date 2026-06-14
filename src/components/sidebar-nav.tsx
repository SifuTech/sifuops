'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type NavItem = {
  href: string
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/new-project', label: 'New Project', icon: '✦' },
  { href: '/', label: 'Delivery Control', icon: '⊞' },
  { href: '/sow', label: 'SOW Generator', icon: '≡' },
]

export function SidebarNav({ demoMode = false }: { demoMode?: boolean }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 7rem)' }}>
      <nav className="space-y-1 flex-1">
        <p className="app-subtle px-3 pb-2 text-xs font-semibold uppercase tracking-widest">
          Workspace
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'app-nav-link-active' : 'app-nav-link'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <form action="/api/demo/toggle" method="POST" className="px-3 pb-1">
        <button
          type="submit"
          title={demoMode ? 'Exit demo mode' : 'Enter demo mode'}
          style={{
            opacity: demoMode ? 0.6 : 0.2,
            fontSize: 10,
            letterSpacing: '0.05em',
            color: demoMode ? 'rgb(251,191,36)' : 'inherit',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = demoMode ? '0.6' : '0.2')}
        >
          <span style={{ fontSize: 8 }}>{demoMode ? '◉' : '○'}</span>
          demo
        </button>
      </form>
    </div>
  )
}
