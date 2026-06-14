'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { NewProjectInput } from '@/app/(app)/new-project/page'
import type { LessonGroup } from '@/app/api/onboarding/lessons/route'
import type { AnalyseResponse, AgentOutput } from '@/app/api/onboarding/analyse/route'

// ─── Types ───────────────────────────────────────────────────────────────────

type Agent = 'ba' | 'po' | 'dev' | 'qa'
type Phase = 'loading' | 'error' | 'results' | 'confirm' | 'done'

type Board = { board_id: string; board_name: string }

type TaskKey = string // `${agent}-${index}`

// ─── Agent metadata ───────────────────────────────────────────────────────────

const AGENTS: { key: Agent; label: string; title: string; color: string; border: string; bg: string }[] = [
  {
    key: 'ba',
    label: 'BA',
    title: 'Business Analyst',
    color: '#7dd3fc',
    border: 'rgba(56,189,248,0.35)',
    bg: 'rgba(56,189,248,0.08)',
  },
  {
    key: 'po',
    label: 'PO',
    title: 'Product Owner',
    color: '#c4b5fd',
    border: 'rgba(167,139,250,0.35)',
    bg: 'rgba(167,139,250,0.08)',
  },
  {
    key: 'dev',
    label: 'Dev',
    title: 'Developer',
    color: '#fdba74',
    border: 'rgba(251,146,60,0.35)',
    bg: 'rgba(251,146,60,0.08)',
  },
  {
    key: 'qa',
    label: 'QA',
    title: 'QA Engineer',
    color: '#6ee7b7',
    border: 'rgba(52,211,153,0.35)',
    bg: 'rgba(52,211,153,0.08)',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function taskKey(agent: Agent, idx: number): TaskKey {
  return `${agent}-${idx}`
}

function countSelected(selected: Set<TaskKey>, agent: Agent, output: AgentOutput): number {
  return output.suggested_tasks.filter((_, i) => selected.has(taskKey(agent, i))).length
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--subtle)',
        marginBottom: '0.5rem',
      }}
    >
      {children}
    </p>
  )
}

function Pill({
  children,
  color,
  border,
  bg,
}: {
  children: React.ReactNode
  color: string
  border: string
  bg: string
}) {
  return (
    <li
      style={{
        padding: '0.5rem 0.75rem',
        borderRadius: '0.625rem',
        fontSize: '0.8125rem',
        lineHeight: '1.5',
        color,
        border: `1px solid ${border}`,
        background: bg,
        listStyle: 'none',
      }}
    >
      {children}
    </li>
  )
}

function TaskCard({
  task,
  checked,
  agentColor,
  agentBorder,
  onToggle,
}: {
  task: AgentOutput['suggested_tasks'][number]
  checked: boolean
  agentColor: string
  agentBorder: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full text-left rounded-xl px-4 py-3 transition-all"
      style={{
        background: checked ? 'rgba(52,211,153,0.08)' : 'rgba(0,0,0,0.18)',
        border: checked ? '1px solid rgba(52,211,153,0.4)' : `1px solid ${agentBorder}`,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex-shrink-0 rounded-md flex items-center justify-center"
          style={{
            width: '1.125rem',
            height: '1.125rem',
            border: checked ? '1px solid #34d399' : '1px solid rgba(148,163,184,0.35)',
            background: checked ? '#34d399' : 'transparent',
            fontSize: '0.65rem',
            color: '#020617',
            fontWeight: 700,
          }}
        >
          {checked ? '✓' : ''}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold text-sm"
            style={{ color: checked ? '#6ee7b7' : 'var(--foreground)' }}
          >
            {task.title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>
            {task.description}
          </p>
        </div>
        <span
          className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            color: agentColor,
            background: `${agentColor}18`,
            border: `1px solid ${agentBorder}`,
          }}
        >
          {task.agent}
        </span>
      </div>
    </button>
  )
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingScreen({ step }: { step: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div
        className="rounded-full border-4 border-t-transparent animate-spin"
        style={{
          width: '3rem',
          height: '3rem',
          borderColor: 'rgba(52,211,153,0.3)',
          borderTopColor: '#34d399',
        }}
      />
      <div className="text-center">
        <p className="font-semibold" style={{ color: 'var(--foreground-strong)' }}>
          Running AI Analysis
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--subtle)' }}>
          {step}
        </p>
      </div>
      <div className="flex gap-3 mt-2">
        {AGENTS.map((a) => (
          <span
            key={a.key}
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ color: a.color, background: a.bg, border: `1px solid ${a.border}` }}
          >
            {a.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Confirmation overlay ──────────────────────────────────────────────────────

function ConfirmOverlay({
  selected,
  results,
  boards,
  targetBoardId,
  onBoardChange,
  onConfirm,
  onCancel,
  creating,
}: {
  selected: Set<TaskKey>
  results: AnalyseResponse
  boards: Board[]
  targetBoardId: string
  onBoardChange: (id: string) => void
  onConfirm: () => void
  onCancel: () => void
  creating: boolean
}) {
  const allTasks = AGENTS.flatMap((a) =>
    (results[a.key].suggested_tasks ?? [])
      .map((t, i) => ({ task: t, key: taskKey(a.key, i), agent: a }))
      .filter(({ key }) => selected.has(key)),
  )

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--subtle)',
    marginBottom: '0.375rem',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 space-y-5"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        <div>
          <h2
            className="text-lg font-bold"
            style={{ color: 'var(--foreground-strong)' }}
          >
            Review before creating
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--subtle)' }}>
            {allTasks.length} task{allTasks.length !== 1 ? 's' : ''} will be created in Monday.com.
            This cannot be undone.
          </p>
        </div>

        {/* Board selector */}
        <div>
          <label style={labelStyle}>Target Monday.com Board</label>
          {boards.length > 0 ? (
            <select
              value={targetBoardId}
              onChange={(e) => onBoardChange(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(148,163,184,0.22)',
                borderRadius: '0.75rem',
                padding: '0.625rem 0.875rem',
                fontSize: '0.875rem',
                color: 'var(--foreground)',
                outline: 'none',
              }}
            >
              <option value="" style={{ background: '#140f24' }}>
                Select board…
              </option>
              {boards.map((b) => (
                <option key={b.board_id} value={b.board_id} style={{ background: '#140f24' }}>
                  {b.board_name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm" style={{ color: '#fca5a5' }}>
              No active boards found. Sync Monday.com boards first.
            </p>
          )}
        </div>

        {/* Task list */}
        <div>
          <label style={labelStyle}>Tasks to create</label>
          <ul className="space-y-1.5">
            {allTasks.map(({ task, key, agent }) => (
              <li
                key={key}
                className="flex items-start gap-2 rounded-lg px-3 py-2"
                style={{
                  background: agent.bg,
                  border: `1px solid ${agent.border}`,
                }}
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                  style={{ color: agent.color, background: `${agent.color}18` }}
                >
                  {agent.label}
                </span>
                <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={creating}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(148,163,184,0.2)',
              color: 'var(--muted)',
            }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={creating || !targetBoardId}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--primary-button-bg)',
              color: 'var(--primary-button-text)',
            }}
          >
            {creating ? 'Creating…' : `Create ${allTasks.length} Task${allTasks.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Done screen ──────────────────────────────────────────────────────────────

function DoneScreen({
  createResults,
  onReset,
}: {
  createResults: { title: string; success: boolean; error?: string }[]
  onReset: () => void
}) {
  const succeeded = createResults.filter((r) => r.success).length
  const failed = createResults.filter((r) => !r.success).length

  return (
    <div className="max-w-lg mx-auto py-16 space-y-6">
      <div className="text-center">
        <div
          className="text-4xl mb-4"
          style={{ color: failed === 0 ? '#34d399' : '#fb923c' }}
        >
          {failed === 0 ? '✓' : '⚠'}
        </div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--foreground-strong)' }}>
          {failed === 0
            ? `${succeeded} task${succeeded !== 1 ? 's' : ''} created`
            : `${succeeded} created, ${failed} failed`}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--subtle)' }}>
          {failed === 0
            ? 'All tasks have been added to Monday.com.'
            : 'Some tasks could not be created — see details below.'}
        </p>
      </div>

      {failed > 0 && (
        <ul className="space-y-1.5">
          {createResults
            .filter((r) => !r.success)
            .map((r, i) => (
              <li
                key={i}
                className="rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.25)',
                  color: '#fca5a5',
                }}
              >
                <span className="font-semibold">{r.title}</span>
                {r.error && ` — ${r.error}`}
              </li>
            ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-xl py-2.5 text-sm font-bold"
        style={{
          background: 'var(--primary-button-bg)',
          color: 'var(--primary-button-text)',
        }}
      >
        Start another project
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter()

  const [phase, setPhase] = useState<Phase>('loading')
  const [loadingStep, setLoadingStep] = useState('Fetching lessons from past projects…')
  const [error, setError] = useState<string | null>(null)
  const [projectInput, setProjectInput] = useState<NewProjectInput | null>(null)
  const [results, setResults] = useState<AnalyseResponse | null>(null)
  const [activeTab, setActiveTab] = useState<Agent>('ba')
  const [selected, setSelected] = useState<Set<TaskKey>>(new Set())
  const [boards, setBoards] = useState<Board[]>([])
  const [targetBoardId, setTargetBoardId] = useState('')
  const [creating, setCreating] = useState(false)
  const [createResults, setCreateResults] = useState<
    { title: string; success: boolean; error?: string }[]
  >([])

  const run = useCallback(async (input: NewProjectInput) => {
    try {
      setLoadingStep('Fetching lessons from past projects…')
      const lessonsRes = await fetch('/api/onboarding/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectType: input.projectType, modules: input.modules }),
      })
      const lessonsData: { lessons: LessonGroup[] } = lessonsRes.ok
        ? await lessonsRes.json()
        : { lessons: [] }

      setLoadingStep('Running BA, PO, Dev and QA analysis in parallel…')
      const analyseRes = await fetch('/api/onboarding/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectInput: input, lessons: lessonsData.lessons }),
      })
      if (!analyseRes.ok) {
        const body = await analyseRes.json().catch(() => ({}))
        throw new Error(body.error ?? `Analysis failed (${analyseRes.status})`)
      }
      const analysis: AnalyseResponse = await analyseRes.json()
      setResults(analysis)

      // Pre-select all tasks
      const allKeys = new Set<TaskKey>()
      for (const agent of ['ba', 'po', 'dev', 'qa'] as Agent[]) {
        ;(analysis[agent].suggested_tasks ?? []).forEach((_, i) =>
          allKeys.add(taskKey(agent, i)),
        )
      }
      setSelected(allKeys)
      setPhase('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setPhase('error')
    }
  }, [])

  useEffect(() => {
    const raw = sessionStorage.getItem('onboarding_input')
    if (!raw) {
      router.replace('/new-project')
      return
    }
    const input = JSON.parse(raw) as NewProjectInput
    setProjectInput(input)
    run(input)

    // Load board list for the confirmation step
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => setBoards(d.projects ?? []))
      .catch(() => {})
  }, [run, router])

  function toggleTask(agent: Agent, idx: number) {
    const key = taskKey(agent, idx)
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  async function handleCreate() {
    if (!targetBoardId || !results) return
    setCreating(true)

    const tasks = AGENTS.flatMap((a) =>
      (results[a.key].suggested_tasks ?? [])
        .map((t, i) => ({ task: t, key: taskKey(a.key, i) }))
        .filter(({ key }) => selected.has(key))
        .map(({ task }) => task),
    )

    try {
      const res = await fetch('/api/onboarding/create-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, boardId: targetBoardId }),
      })
      const data = await res.json()
      setCreateResults(data.results ?? [])
      setPhase('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tasks')
    } finally {
      setCreating(false)
    }
  }

  function handleReset() {
    sessionStorage.removeItem('onboarding_input')
    router.push('/new-project')
  }

  // ── Render: loading ──────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="max-w-3xl mx-auto">
        <LoadingScreen step={loadingStep} />
      </div>
    )
  }

  // ── Render: error ────────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="max-w-2xl mx-auto py-16 space-y-4">
        <div
          className="rounded-xl px-5 py-4"
          style={{
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.3)',
            color: '#fca5a5',
          }}
        >
          <p className="font-semibold text-sm">Analysis failed</p>
          <p className="text-sm mt-1 opacity-80">{error}</p>
        </div>
        <button
          onClick={() => router.push('/new-project')}
          className="rounded-xl px-4 py-2 text-sm font-semibold"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(148,163,184,0.2)',
            color: 'var(--muted)',
          }}
        >
          ← Back to form
        </button>
      </div>
    )
  }

  // ── Render: done ─────────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="max-w-3xl mx-auto">
        <DoneScreen createResults={createResults} onReset={handleReset} />
      </div>
    )
  }

  // ── Render: results ───────────────────────────────────────────────────────────
  if (!results) return null

  const totalSelected = selected.size
  const activeAgent = AGENTS.find((a) => a.key === activeTab)!
  const activeOutput = results[activeTab]

  return (
    <>
      {phase === 'confirm' && (
        <ConfirmOverlay
          selected={selected}
          results={results}
          boards={boards}
          targetBoardId={targetBoardId}
          onBoardChange={setTargetBoardId}
          onConfirm={handleCreate}
          onCancel={() => setPhase('results')}
          creating={creating}
        />
      )}

      <div className="max-w-3xl mx-auto pb-28">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => router.push('/new-project')}
              className="text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--subtle)' }}
            >
              ← New Project
            </button>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--foreground-strong)' }}
          >
            {projectInput?.projectName ?? 'Analysis Results'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--subtle)' }}>
            Select the tasks you want to create in Monday.com, then click the button below.
          </p>
        </div>

        {/* Agent tabs */}
        <div
          className="flex gap-1 p-1 rounded-2xl mb-5"
          style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}
        >
          {AGENTS.map((a) => {
            const isActive = activeTab === a.key
            const selCount = countSelected(selected, a.key, results[a.key])
            const totalTasks = results[a.key].suggested_tasks?.length ?? 0
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => setActiveTab(a.key)}
                className="flex-1 rounded-xl py-2 text-sm font-semibold transition-all"
                style={{
                  background: isActive ? a.bg : 'transparent',
                  border: isActive ? `1px solid ${a.border}` : '1px solid transparent',
                  color: isActive ? a.color : 'var(--subtle)',
                }}
              >
                {a.label}
                {totalTasks > 0 && (
                  <span
                    className="ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isActive ? `${a.color}22` : 'rgba(148,163,184,0.12)',
                      color: isActive ? a.color : 'var(--subtle)',
                    }}
                  >
                    {selCount}/{totalTasks}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Agent label */}
        <p className="text-xs font-semibold mb-4" style={{ color: activeAgent.color }}>
          {activeAgent.title}
        </p>

        <div className="space-y-5">
          {/* Risks */}
          {activeOutput.risks?.length > 0 && (
            <div className="app-panel rounded-2xl p-5">
              <SectionLabel>Risks</SectionLabel>
              <ul className="space-y-2">
                {activeOutput.risks.map((r, i) => (
                  <Pill
                    key={i}
                    color="#fca5a5"
                    border="rgba(248,113,113,0.28)"
                    bg="rgba(248,113,113,0.08)"
                  >
                    {r}
                  </Pill>
                ))}
              </ul>
            </div>
          )}

          {/* Watchouts */}
          {activeOutput.watchouts?.length > 0 && (
            <div className="app-panel rounded-2xl p-5">
              <SectionLabel>Watchouts</SectionLabel>
              <ul className="space-y-2">
                {activeOutput.watchouts.map((w, i) => (
                  <Pill
                    key={i}
                    color="#fdba74"
                    border="rgba(251,146,60,0.28)"
                    bg="rgba(251,146,60,0.08)"
                  >
                    {w}
                  </Pill>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested tasks */}
          {activeOutput.suggested_tasks?.length > 0 && (
            <div className="app-panel rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Suggested Tasks</SectionLabel>
                <button
                  type="button"
                  className="text-xs font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'var(--subtle)' }}
                  onClick={() => {
                    const allSelected = activeOutput.suggested_tasks.every((_, i) =>
                      selected.has(taskKey(activeTab, i)),
                    )
                    setSelected((prev) => {
                      const next = new Set(prev)
                      activeOutput.suggested_tasks.forEach((_, i) => {
                        allSelected
                          ? next.delete(taskKey(activeTab, i))
                          : next.add(taskKey(activeTab, i))
                      })
                      return next
                    })
                  }}
                >
                  {activeOutput.suggested_tasks.every((_, i) =>
                    selected.has(taskKey(activeTab, i)),
                  )
                    ? 'Deselect all'
                    : 'Select all'}
                </button>
              </div>
              <div className="space-y-2">
                {activeOutput.suggested_tasks.map((task, i) => (
                  <TaskCard
                    key={i}
                    task={task}
                    checked={selected.has(taskKey(activeTab, i))}
                    agentColor={activeAgent.color}
                    agentBorder={activeAgent.border}
                    onToggle={() => toggleTask(activeTab, i)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-xl"
        style={{
          background: 'rgba(20,15,36,0.92)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <p className="text-sm" style={{ color: 'var(--subtle)' }}>
            {totalSelected === 0 ? (
              'No tasks selected'
            ) : (
              <>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                  {totalSelected}
                </span>{' '}
                task{totalSelected !== 1 ? 's' : ''} selected across{' '}
                {AGENTS.filter((a) => countSelected(selected, a.key, results[a.key]) > 0).length}{' '}
                agent{
                  AGENTS.filter((a) => countSelected(selected, a.key, results[a.key]) > 0)
                    .length !== 1
                    ? 's'
                    : ''
                }
              </>
            )}
          </p>
          <button
            type="button"
            disabled={totalSelected === 0}
            onClick={() => setPhase('confirm')}
            className="rounded-xl px-6 py-2.5 text-sm font-bold transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'var(--primary-button-bg)',
              color: 'var(--primary-button-text)',
            }}
            onMouseEnter={(e) =>
              totalSelected > 0 &&
              (e.currentTarget.style.background = 'var(--primary-button-bg-hover)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'var(--primary-button-bg)')
            }
          >
            Create in Monday.com →
          </button>
        </div>
      </div>
    </>
  )
}
