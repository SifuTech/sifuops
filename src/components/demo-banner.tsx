'use client'

export function DemoBanner() {
  return (
    <div
      style={{
        background: 'rgba(251,191,36,0.12)',
        borderBottom: '1px solid rgba(251,191,36,0.25)',
        color: 'rgba(251,191,36,0.9)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textAlign: 'center',
        padding: '5px 0',
        textTransform: 'uppercase',
      }}
    >
      Demo Mode — all data is simulated
    </div>
  )
}
