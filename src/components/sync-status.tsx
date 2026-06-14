'use client'

import { useState, useEffect, useCallback } from 'react'

function formatSyncTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SyncStatus() {
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialised, setInitialised] = useState(false)

  const fetchLastSync = useCallback(async () => {
    try {
      const res = await fetch('/api/sync')
      if (res.ok) {
        const data = await res.json()
        setLastSync(data.lastSync ?? null)
      }
    } catch {
      // silently ignore
    } finally {
      setInitialised(true)
    }
  }, [])

  useEffect(() => { fetchLastSync() }, [fetchLastSync])

  const triggerSync = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sync', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setLastSync(data.lastSync ?? null)
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex items-center gap-2 rounded-xl border px-3 py-1.5"
      style={{
        borderColor: 'rgba(255,255,255,0.3)',
        background: 'rgba(255,255,255,0.04)',
      }}
    >
      <div className="text-right hidden sm:block">
        <div className="text-xs font-bold" style={{ color: '#ffffff', WebkitFontSmoothing: 'antialiased' }}>
          Monday.com
        </div>
        <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)', WebkitFontSmoothing: 'antialiased' }}>
          {!initialised
            ? '—'
            : lastSync
              ? formatSyncTime(lastSync)
              : 'Never synced'}
        </div>
      </div>
      <button
        onClick={triggerSync}
        disabled={loading}
        title="Sync Monday.com"
        className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition hover:opacity-80 disabled:opacity-50"
        style={{
          borderColor: 'rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.08)',
          color: '#ffffff',
          WebkitFontSmoothing: 'antialiased',
          fontWeight: 600,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={loading ? 'animate-spin' : ''}
        >
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
        {loading ? 'Syncing…' : 'Sync'}
      </button>
    </div>
  )
}
