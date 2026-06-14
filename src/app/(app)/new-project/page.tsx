'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PROJECT_TYPES = [
  { value: 'new-build', label: 'New Build', description: 'New client — full module configuration' },
  { value: 'new-module', label: 'New Module', description: 'Existing client — adding a new module' },
  { value: 'enhancement', label: 'Enhancement', description: 'Existing client — improving existing functionality' },
  { value: 'task-delivery', label: 'Task Delivery', description: 'Specific task e.g. bulk import / deletion' },
  { value: 'development', label: 'Development', description: 'Custom development work' },
  { value: 'other', label: 'Other', description: 'Falls outside the above categories' },
] as const

type ProjectType = (typeof PROJECT_TYPES)[number]['value']

const MODULES = [
  'Appointments',
  'Campaigns',
  'Case Hub',
  'Client Hub',
  'Client Requests',
  'Fast Sign',
  'Form Builder',
  'Journeys',
  'Lead Management',
  'Lenders',
  'Location Zone',
  'Payment Module',
  'Reports',
  'Settings',
  'Task Manager',
] as const

export type NewProjectInput = {
  projectName: string
  projectDescription: string
  projectType: ProjectType | ''
  modules: string[]
  stakeholderNotes: string
  keyDeadline: string
  projectBrief: string
}

const EMPTY: NewProjectInput = {
  projectName: '',
  projectDescription: '',
  projectType: '',
  modules: [],
  stakeholderNotes: '',
  keyDeadline: '',
  projectBrief: '',
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

export default function NewProjectPage() {
  const router = useRouter()
  const [input, setInput] = useState<NewProjectInput>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem('onboarding_input')
    if (saved) {
      try {
        setInput(JSON.parse(saved) as NewProjectInput)
      } catch {
        // ignore corrupt data
      }
    }
  }, [])

  function set<K extends keyof NewProjectInput>(key: K, value: NewProjectInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }))
  }

  function toggleModule(mod: string) {
    setInput((prev) => ({
      ...prev,
      modules: prev.modules.includes(mod)
        ? prev.modules.filter((m) => m !== mod)
        : [...prev.modules, mod],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.modules.length === 0) {
      setError('Please select at least one module.')
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      sessionStorage.setItem('onboarding_input', JSON.stringify(input))
      router.push('/new-project/results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span style={{ fontSize: '1.25rem', color: 'var(--primary-button-bg)' }}>◈</span>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--foreground-strong)' }}
          >
            New Project Onboarding
          </h1>
        </div>
        <p style={{ color: 'var(--subtle)', fontSize: '0.875rem' }}>
          Fill in the project details and four specialist AI agents will analyse risks, watchouts,
          and suggested tasks based on your brief and past project lessons.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          className="app-panel rounded-2xl p-6 space-y-6 mb-6"
          style={{ boxShadow: 'var(--shadow)' }}
        >
          {/* Project name */}
          <div>
            <label style={labelStyle}>Project Name</label>
            <input
              type="text"
              required
              value={input.projectName}
              onChange={(e) => set('projectName', e.target.value)}
              placeholder="e.g. Acme Financial — New Build"
              style={fieldStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(52,211,153,0.5)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(148,163,184,0.18)')}
            />
          </div>

          {/* Project description */}
          <div>
            <label style={labelStyle}>Project Description</label>
            <textarea
              required
              rows={4}
              value={input.projectDescription}
              onChange={(e) => set('projectDescription', e.target.value)}
              placeholder="Describe what the client needs, the problem being solved, and any known requirements or constraints…"
              style={{ ...fieldStyle, resize: 'vertical', minHeight: '6rem' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(52,211,153,0.5)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(148,163,184,0.18)')}
            />
          </div>

          {/* Project type */}
          <div>
            <label style={labelStyle}>Project Type</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {PROJECT_TYPES.map((t) => {
                const active = input.projectType === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => set('projectType', t.value)}
                    className="text-left rounded-xl px-4 py-3 transition-all"
                    style={{
                      background: active
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(34,197,94,0.06))'
                        : 'rgba(0,0,0,0.2)',
                      border: active
                        ? '1px solid rgba(52,211,153,0.4)'
                        : '1px solid rgba(148,163,184,0.14)',
                    }}
                  >
                    <div
                      className="text-sm font-semibold"
                      style={{ color: active ? '#6ee7b7' : 'var(--foreground)' }}
                    >
                      {t.label}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: active ? 'rgba(110,231,183,0.7)' : 'var(--subtle)' }}
                    >
                      {t.description}
                    </div>
                  </button>
                )
              })}
            </div>
            {/* Hidden required sentinel */}
            <input
              type="text"
              required
              readOnly
              value={input.projectType}
              tabIndex={-1}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0 }}
            />
          </div>

          {/* Key deadline */}
          <div>
            <label style={labelStyle}>Key Deadline</label>
            <input
              type="date"
              required
              value={input.keyDeadline}
              onChange={(e) => set('keyDeadline', e.target.value)}
              style={{ ...fieldStyle, colorScheme: 'dark' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(52,211,153,0.5)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(148,163,184,0.18)')}
            />
          </div>

          {/* Modules */}
          <div>
            <label style={labelStyle}>
              Modules Involved
              {input.modules.length > 0 && (
                <span
                  className="ml-2 normal-case font-normal"
                  style={{ color: '#6ee7b7' }}
                >
                  {input.modules.length} selected
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {MODULES.map((mod) => {
                const active = input.modules.includes(mod)
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => toggleModule(mod)}
                    className="rounded-full px-3 py-1 text-xs font-medium transition-all"
                    style={{
                      background: active ? 'rgba(52,211,153,0.15)' : 'rgba(0,0,0,0.2)',
                      border: active
                        ? '1px solid rgba(52,211,153,0.4)'
                        : '1px solid rgba(148,163,184,0.18)',
                      color: active ? '#6ee7b7' : 'var(--muted)',
                    }}
                  >
                    {active && <span className="mr-1">✓</span>}
                    {mod}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Stakeholder notes */}
          <div>
            <label style={labelStyle}>Client / Stakeholder Notes</label>
            <textarea
              rows={3}
              value={input.stakeholderNotes}
              onChange={(e) => set('stakeholderNotes', e.target.value)}
              placeholder="Known stakeholder concerns, politics, budget constraints, success criteria, previous delivery history…"
              style={{ ...fieldStyle, resize: 'vertical', minHeight: '5rem' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(52,211,153,0.5)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(148,163,184,0.18)')}
            />
          </div>

          {/* Project brief */}
          <div>
            <label style={labelStyle}>
              Project Brief
              <span
                className="ml-2 normal-case font-normal"
                style={{ color: 'var(--subtle)' }}
              >
                optional — paste a client email, requirements doc, or any raw brief content
              </span>
            </label>
            <textarea
              rows={6}
              value={input.projectBrief}
              onChange={(e) => set('projectBrief', e.target.value)}
              placeholder="Paste the client's email, a requirements document, discovery notes, or any other raw brief content here. The agents will read this alongside the fields above."
              style={{ ...fieldStyle, resize: 'vertical', minHeight: '8rem', fontFamily: 'inherit' }}
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
          disabled={submitting}
          className="w-full rounded-xl py-3 text-sm font-bold tracking-wide transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'var(--primary-button-bg)',
            color: 'var(--primary-button-text)',
          }}
          onMouseEnter={(e) =>
            !submitting && (e.currentTarget.style.background = 'var(--primary-button-bg-hover)')
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary-button-bg)')}
        >
          {submitting ? 'Running analysis…' : 'Run AI Analysis →'}
        </button>
      </form>
    </div>
  )
}
