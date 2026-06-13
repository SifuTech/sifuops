'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type NavItem = {
  href: string
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Delivery Control', icon: '◈' },
  { href: '/sow', label: 'SOW Generator', icon: '◻' },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
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
  )
}
