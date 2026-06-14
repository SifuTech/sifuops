'use client'

import { useState } from 'react'
import type { SowSections, SowInput } from '@/lib/sow-agent'

const SECTION_LABELS: Record<keyof SowSections, string> = {
  goals_and_objectives: 'Goals & Objectives',
  scope_of_work: 'Scope of Work',
  required_modules: 'Required Modules',
  deliverables_by_fastdox: 'Deliverables by FastDox',
  third_party_deliverables: 'Third Party Deliverables',
  system_for_integrations: 'Systems & Integrations',
  acceptance_criteria: 'Acceptance Criteria',
  training: 'Training',
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(148,163,184,0.18)',
  borderRadius: '0.75rem',
  padding: '0.625rem 0.875rem',
  fontSize: '0.875rem',
  color: 'var(--foreground)',
  outline: 'none',
  transition: 'border-color 0.15s',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--subtle)',
  marginBottom: '0.375rem',
}

export default function SowPage() {
  const [input, setInput] = useState<SowInput>({
    project_title: '',
    project_manager: '',
    project_overview: '',
  })
  const [sections, setSections] = useState<SowSections | null>(null)
  const [generating, setGenerating] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    setError(null)
    setSections(null)

    try {
      const res = await fetch('/api/sow/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setSections(data.sections)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  async function handleDownload() {
    if (!sections) return
    setDownloading(true)

    try {
      const res = await fetch('/api/sow/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections, input }),
      })
      if (!res.ok) throw new Error(await res.text())

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${input.project_title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-sow.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span style={{ fontSize: '1.25rem', color: 'var(--primary-button-bg)' }}>≡</span>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground-strong)' }}>
            SOW Generator
          </h1>
        </div>
        <p style={{ color: 'var(--subtle)', fontSize: '0.875rem' }}>
          Enter project details and Claude will draft the Statement of Works for review and download.
        </p>
      </div>

      {/* Input form */}
      <form onSubmit={handleGenerate}>
        <div className="app-panel rounded-2xl p-6 space-y-5 mb-6" style={{ boxShadow: 'var(--shadow)' }}>
          <div>
            <label style={labelStyle}>Project Title</label>
            <input
              type="text"
              required
              value={input.project_title}
              onChange={(e) => setInput((p) => ({ ...p, project_title: e.target.value }))}
              placeholder="e.g. Sterling Claims Management — Campaigns Module"
              style={fieldStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(52,211,153,0.5)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(148,163,184,0.18)')}
            />
          </div>

          <div>
            <label style={labelStyle}>Project Manager</label>
            <input
              type="text"
              required
              value={input.project_manager}
              onChange={(e) => setInput((p) => ({ ...p, project_manager: e.target.value }))}
              placeholder="Your name"
              style={fieldStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(52,211,153,0.5)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(148,163,184,0.18)')}
            />
          </div>

          <div>
            <label style={labelStyle}>Project Overview</label>
            <textarea
              required
              rows={5}
              value={input.project_overview}
              onChange={(e) => setInput((p) => ({ ...p, project_overview: e.target.value }))}
              placeholder="Describe the project — what the client needs, the problem being solved, key requirements and any known constraints…"
              style={{ ...fieldStyle, resize: 'vertical', minHeight: '7rem' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(52,211,153,0.5)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(148,163,184,0.18)')}
            />
          </div>
        </div>

        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm mb-4"
            style={{
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              color: '#fca5a5',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={generating}
          className="w-full rounded-xl py-3 text-sm font-bold tracking-wide transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mb-8"
          style={{ background: 'var(--primary-button-bg)', color: 'var(--primary-button-text)' }}
          onMouseEnter={(e) => !generating && (e.currentTarget.style.background = 'var(--primary-button-bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary-button-bg)')}
        >
          {generating ? 'Generating SOW…' : 'Generate SOW →'}
        </button>
      </form>

      {/* Generating state */}
      {generating && (
        <div className="text-center py-10" style={{ color: 'var(--subtle)', fontSize: '0.875rem' }}>
          Claude is drafting your SOW — this takes about 15 seconds…
        </div>
      )}

      {/* Preview */}
      {sections && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground-strong)' }}>
              Preview
            </h2>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--primary-button-bg)', color: 'var(--primary-button-text)' }}
              onMouseEnter={(e) => !downloading && (e.currentTarget.style.background = 'var(--primary-button-bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary-button-bg)')}
            >
              {downloading ? 'Preparing…' : 'Download .docx'}
            </button>
          </div>

          {(Object.keys(SECTION_LABELS) as (keyof SowSections)[]).map((key) => (
            <div key={key} className="app-panel rounded-2xl p-5">
              <p style={{ ...labelStyle, marginBottom: '0.5rem' }}>{SECTION_LABELS[key]}</p>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--foreground)', lineHeight: 1.7 }}>
                {sections[key]}
              </p>
            </div>
          ))}

          <div className="pb-8 pt-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full rounded-xl py-3 text-sm font-bold tracking-wide transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--primary-button-bg)', color: 'var(--primary-button-text)' }}
              onMouseEnter={(e) => !downloading && (e.currentTarget.style.background = 'var(--primary-button-bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary-button-bg)')}
            >
              {downloading ? 'Preparing…' : 'Download SOW (.docx)'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
