'use client'

import { useState } from 'react'

export type Priority = 'P1' | 'High' | 'Medium' | 'Low'

export type PriorityOrderItem = {
  itemId: string
  title: string
  owner: string
  status: string
  priority: Priority
  parentTitle: string
  boardName: string | null
  plannedDate: string | null
  effortHours: string | null
  itemUrl: string | null
}

export type WorkloadItem = {
  itemId: string
  title: string
  boardName: string | null
  owner: string
  status: string | null
  plannedDate: string | null
  effortHours: string | null
  itemUrl: string | null
}

export type TimelinePhase = {
  key: string
  label: string
  totalEffortHours: number
  completedEffortHours: number
  remainingEffortHours: number
  percentComplete: number
  targetDate: string | null
  itemCount: number
}

export type TimelineProject = {
  itemId: string
  title: string
  currentPhase: string | null
  targetDate: string | null
  totalEffortHours: number
  completedEffortHours: number
  remainingEffortHours: number
  percentComplete: number
  phases: TimelinePhase[]
}

export type DashboardKPIs = {
  openWork: number
  dueThisWeek: number
  overdue: number
  atRisk: number
  unassigned: number
  activeProjects: number
  lessonsLearnt: number
}

type WorkloadScope = 'week' | 'day'

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function getToday() {
  return startOfDay(new Date())
}

function addDays(d: Date, n: number) {
  const next = new Date(d)
  next.setDate(next.getDate() + n)
  return next
}

function parseDate(date: string | null) {
  return date ? new Date(`${date}T00:00:00`) : null
}

function formatDate(date: string | null) {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parseDate(date) ?? getToday())
}

function formatHours(value: number) {
  const r = Math.round(value * 10) / 10
  return Number.isInteger(r) ? `${r}` : r.toFixed(1)
}

function formatEffortHours(value: string | null | undefined) {
  if (!value) return null
  const n = Number(value)
  return Number.isFinite(n) ? formatHours(n) : null
}

function getWeekRange(date: Date) {
  const day = date.getDay()
  const offset = day === 0 ? 1 : 1 - day
  const weekStart = startOfDay(addDays(date, offset))
  const weekEnd = addDays(weekStart, 7)
  return { weekStart, weekEnd }
}

function getPriorityStyle(priority: Priority): React.CSSProperties {
  if (priority === 'P1') return {
    borderColor: 'var(--priority-critical-border)',
    background: 'var(--priority-critical-bg)',
    color: 'var(--priority-critical-text)',
  }
  if (priority === 'High') return {
    borderColor: 'var(--priority-high-border)',
    background: 'var(--priority-high-bg)',
    color: 'var(--priority-high-text)',
  }
  if (priority === 'Medium') return {
    borderColor: 'var(--priority-medium-border)',
    background: 'var(--priority-medium-bg)',
    color: 'var(--priority-medium-text)',
  }
  return {
    borderColor: 'var(--priority-low-border)',
    background: 'var(--priority-low-bg)',
    color: 'var(--priority-low-text)',
  }
}

function getPriorityLabel(priority: Priority) {
  return priority === 'P1' ? 'Critical' : priority
}

function getOwnerCapacityHours(owner: string, scope: WorkloadScope) {
  if (owner.trim().toLowerCase().includes('daniel')) {
    return scope === 'week' ? 10 : 2
  }
  return scope === 'week' ? 25 : 5
}

function getOwnerDisplayOrder(owner: string) {
  const n = owner.trim().toLowerCase()
  if (n === 'ken chan') return 0
  if (n === 'chris maxey' || n === 'christopher maxey') return 1
  if (n === 'daniel carter') return 2
  return 99
}

function isPastTargetDate(date: string | null, today: Date) {
  const d = parseDate(date)
  if (!d) return false
  return d < startOfDay(today)
}

function getProjectMetricChipStyle(metric: 'total' | 'done' | 'left' | 'complete') {
  const base = 'color-mix(in srgb, var(--foreground)'
  if (metric === 'total') return { borderColor: `${base} 12%, var(--divider))`, background: `${base} 4%, var(--panel) 96%)`, color: 'var(--foreground)' }
  if (metric === 'done') return { borderColor: `${base} 16%, var(--divider))`, background: `${base} 6%, var(--panel) 94%)`, color: 'var(--foreground)' }
  if (metric === 'left') return { borderColor: `${base} 20%, var(--divider))`, background: `${base} 8%, var(--panel) 92%)`, color: 'var(--foreground)' }
  return { borderColor: `${base} 24%, var(--divider))`, background: `${base} 10%, var(--panel) 90%)`, color: 'var(--foreground)' }
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--subtle)' }}
    >
      {message}
    </div>
  )
}

function DashboardPanel({
  title,
  subtitle,
  headerActions,
  children,
}: {
  title: string
  subtitle?: string
  headerActions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="app-card rounded-3xl overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="app-heading text-base font-semibold">{title}</h2>
          {subtitle && <p className="app-subtle text-sm mt-0.5">{subtitle}</p>}
        </div>
        {headerActions && <div className="shrink-0">{headerActions}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

type DeliveryControlProps = {
  kpis: DashboardKPIs
  priorityOrderItems: PriorityOrderItem[]
  workloadItems: WorkloadItem[]
  timelineProjects: TimelineProject[]
  todayIso: string
}

export function DeliveryControl({
  kpis,
  priorityOrderItems,
  workloadItems,
  timelineProjects,
  todayIso,
}: DeliveryControlProps) {
  const [workloadScope, setWorkloadScope] = useState<WorkloadScope>('week')
  const [priorityExpanded, setPriorityExpanded] = useState(false)
  const [expandedWorkload, setExpandedWorkload] = useState<Record<string, boolean>>({})
  const [expandedTimeline, setExpandedTimeline] = useState<Record<string, boolean>>({ all: true })
  const today = parseDate(todayIso) ?? getToday()

  function toggleWorkload(key: string) {
    setExpandedWorkload((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleTimeline(key: string) {
    setExpandedTimeline((prev) => ({ ...prev, [key]: !(prev[key] ?? true) }))
  }

  const summaryCards = [
    { label: 'Due this week', value: kpis.dueThisWeek, tone: 'from-sky-400/40 to-sky-500/5' },
    { label: 'Overdue', value: kpis.overdue, tone: 'from-rose-400/50 to-red-500/10' },
    { label: 'At risk / blocked', value: kpis.atRisk, tone: 'from-amber-300/60 to-orange-400/10' },
    { label: 'Open work', value: kpis.openWork, tone: 'from-cyan-400/40 to-cyan-500/5' },
    { label: 'Unassigned', value: kpis.unassigned, tone: 'from-fuchsia-400/40 to-fuchsia-500/5' },
    { label: 'Active projects', value: kpis.activeProjects, tone: 'from-emerald-400/40 to-emerald-500/5' },
    { label: 'Lessons learnt', value: kpis.lessonsLearnt, tone: 'from-violet-400/40 to-violet-500/5' },
  ]

  const { weekStart, weekEnd } = getWeekRange(today)
  const ownerSet = Array.from(new Set(workloadItems.map((i) => i.owner))).sort(
    (a, b) => getOwnerDisplayOrder(a) - getOwnerDisplayOrder(b),
  )

  const liveWorkload = ownerSet.map((owner) => {
    const ownerItems = workloadItems.filter((i) => i.owner === owner)
    const scopedItems = ownerItems.filter((i) => {
      const d = parseDate(i.plannedDate)
      if (!d) return false
      if (workloadScope === 'day') return d.getTime() === today.getTime()
      return d >= weekStart && d < weekEnd
    })
    const estimatedEffort = scopedItems.reduce((sum, i) => {
      const n = Number(i.effortHours ?? 0)
      return sum + (Number.isFinite(n) ? n : 0)
    }, 0)
    const dueTodayItems = ownerItems.filter((i) => {
      const d = parseDate(i.plannedDate)
      const s = i.status?.trim().toLowerCase()
      return d && d.getTime() === today.getTime() && (s === 'in progress' || s === 'to do')
    })
    const inProgressItems = ownerItems.filter((i) => {
      const d = parseDate(i.plannedDate)
      const s = i.status?.trim().toLowerCase()
      return d && d >= weekStart && d < weekEnd && (s === 'in progress' || s === 'to do')
    })
    return {
      owner,
      openCount: ownerItems.filter((i) => i.status?.trim().toLowerCase() !== 'in progress').length,
      inProgressCount: ownerItems.filter((i) => i.status?.trim().toLowerCase() === 'in progress').length,
      overdueCount: ownerItems.filter((i) => {
        const d = parseDate(i.plannedDate)
        return d && d < today
      }).length,
      blockedCount: ownerItems.filter((i) => i.status?.trim().toLowerCase() === 'blocked').length,
      estimatedEffort,
      dueTodayItems,
      inProgressItems,
    }
  })

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <p className="app-subtle text-xs font-semibold uppercase tracking-widest">Project</p>
        <h1 className="app-heading mt-1 text-2xl font-semibold">Delivery Control</h1>
        <p className="app-subtle text-sm mt-1">
          A focused view of delivery priorities, upcoming deadlines, ownership, and execution risk across the active project portfolio.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        {summaryCards.map((card) => (
          <section
            key={card.label}
            className="rounded-3xl border p-5"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div className={`h-1.5 rounded-full bg-gradient-to-r ${card.tone}`} />
            <div className="mt-4 flex items-center justify-center">
              <p className="text-sm font-semibold tracking-[0.01em] text-center" style={{ color: 'var(--foreground-strong)' }}>
                {card.label}
              </p>
            </div>
            <p className="mt-2 text-center text-[1.65rem] font-normal tracking-tight" style={{ color: 'var(--muted)' }}>
              {card.value}
            </p>
          </section>
        ))}
      </div>

      {/* Priority Order + Workload */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Priority Order */}
        <DashboardPanel title="Priority order" subtitle="Open items sorted by priority then planned date.">
          <div className="space-y-2">
            {priorityOrderItems.length === 0 ? (
              <EmptyState message="No open items found. Run the morning sync to fetch data." />
            ) : (
              <>
                {(priorityExpanded ? priorityOrderItems : priorityOrderItems.slice(0, 5)).map((item, index) => (
                  <div
                    key={item.itemId}
                    className="group block w-full rounded-3xl border px-4 py-3 transition"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--surface)',
                    }}
                  >
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className="rounded-full border px-2.5 py-1 text-xs font-semibold"
                            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                          >
                            #{index + 1}
                          </span>
                          <span
                            className="rounded-full border px-2.5 py-1 text-xs font-medium"
                            style={getPriorityStyle(item.priority)}
                          >
                            {getPriorityLabel(item.priority)}
                          </span>
                          <span
                            className="rounded-full border px-2.5 py-1 text-xs font-medium"
                            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                          >
                            {item.status || 'No status'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--foreground-strong)' }}>{item.title}</p>
                          <p className="mt-0.5 text-xs" style={{ color: 'var(--subtle)' }}>
                            {item.boardName ?? 'monday'} / {item.owner} / {item.parentTitle}
                          </p>
                        </div>
                      </div>
                      <div className="grid shrink-0 grid-cols-2 gap-2 text-sm xl:w-[17rem]" style={{ color: 'var(--muted)' }}>
                        <div className="rounded-2xl border px-3 py-2" style={{ borderColor: 'var(--border)', background: 'var(--inset)' }}>
                          <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--subtle)' }}>Planned</p>
                          <p className="mt-0.5 text-sm" style={{ color: 'var(--foreground-strong)' }}>{formatDate(item.plannedDate)}</p>
                        </div>
                        <div className="rounded-2xl border px-3 py-2" style={{ borderColor: 'var(--border)', background: 'var(--inset)' }}>
                          <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--subtle)' }}>Effort</p>
                          <p className="mt-0.5 text-sm" style={{ color: 'var(--foreground-strong)' }}>
                            {formatEffortHours(item.effortHours) ? `${formatEffortHours(item.effortHours)}h` : 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {priorityOrderItems.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setPriorityExpanded((v) => !v)}
                    className="mt-1 w-full rounded-2xl border py-2 text-xs font-medium transition"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--subtle)' }}
                  >
                    {priorityExpanded ? 'Show less' : `Show ${priorityOrderItems.length - 5} more`}
                  </button>
                )}
              </>
            )}
          </div>
        </DashboardPanel>

        {/* Workload */}
        <DashboardPanel
          title="Team workload"
          subtitle={
            workloadScope === 'week'
              ? 'Planned hours and capacity by owner for the current week.'
              : 'Planned hours and capacity by owner for today.'
          }
          headerActions={
            <div
              className="inline-flex rounded-full border p-1"
              style={{ borderColor: 'var(--border)', background: 'var(--inset)' }}
            >
              {(['week', 'day'] as const).map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setWorkloadScope(scope)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    workloadScope === scope
                      ? 'border border-emerald-300/60 bg-emerald-100 text-emerald-950 shadow-sm'
                      : 'border border-transparent'
                  }`}
                  style={workloadScope !== scope ? { color: 'var(--subtle)' } : {}}
                >
                  {scope === 'week' ? 'Week' : 'Today'}
                </button>
              ))}
            </div>
          }
        >
          <div className="space-y-4">
            {liveWorkload.length === 0 ? (
              <EmptyState message="No assigned items found. Run the morning sync to fetch data." />
            ) : (
              liveWorkload.map((entry) => {
                const capacity = getOwnerCapacityHours(entry.owner, workloadScope)
                const sectionKey = `${workloadScope}:${entry.owner}`
                const isExpanded = expandedWorkload[sectionKey] ?? false
                const taskCount = workloadScope === 'day' ? entry.dueTodayItems.length : entry.inProgressItems.length
                const isOverCapacity = entry.estimatedEffort > capacity
                const usedPct = Math.min((entry.estimatedEffort / capacity) * 100, 100)
                const remainingPct = Math.max(100 - usedPct, 0)
                const overHours = Math.max(entry.estimatedEffort - capacity, 0)
                const remainingHours = Math.max(capacity - entry.estimatedEffort, 0)

                return (
                  <article
                    key={entry.owner}
                    className="rounded-2xl border p-4"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold" style={{ color: 'var(--foreground-strong)' }}>{entry.owner}</p>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                          {entry.inProgressCount} in progress / {entry.openCount} open /{' '}
                          {entry.overdueCount} overdue / {entry.blockedCount} blocked
                        </p>
                      </div>
                    </div>

                    {/* Capacity bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--subtle)' }}>
                        <span>{entry.estimatedEffort}h planned</span>
                        <span>{isOverCapacity ? `${formatHours(overHours)}h over` : `${formatHours(remainingHours)}h left`}</span>
                      </div>
                      <div
                        className="relative mt-2 flex h-5 overflow-hidden rounded-full border"
                        style={{ borderColor: 'var(--border)', background: 'var(--inset)' }}
                      >
                        <div
                          className={`h-full border-r ${
                            isOverCapacity
                              ? 'bg-[linear-gradient(90deg,rgba(248,113,113,0.98),rgba(239,68,68,0.94))]'
                              : 'bg-[linear-gradient(90deg,rgba(34,197,94,0.78),rgba(22,163,74,0.72))]'
                          }`}
                          style={{ width: `${usedPct}%`, borderColor: 'var(--border)' }}
                        />
                        <div
                          className={`h-full ${isOverCapacity ? 'bg-rose-500/20' : 'bg-slate-500/20'}`}
                          style={{ width: `${remainingPct}%` }}
                        />
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-3 text-[11px] font-medium text-white">
                          <span className="whitespace-nowrap drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]">
                            {Math.min(Math.round((entry.estimatedEffort / capacity) * 100), 999)}%{' '}
                            {workloadScope === 'week' ? 'weekly' : 'daily'} capacity
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable task list */}
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => toggleWorkload(sectionKey)}
                        className="flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left transition"
                        style={{
                          borderColor: 'var(--accent-border)',
                          background: 'var(--accent-soft)',
                        }}
                      >
                        <span className="text-sm font-medium" style={{ color: 'var(--foreground-strong)' }}>
                          {workloadScope === 'day' ? `Today tasks (${taskCount})` : `Week tasks (${taskCount})`}
                        </span>
                        <span
                          className="rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-sm"
                          style={{
                            borderColor: 'var(--accent-border)',
                            background: 'var(--primary-button-bg)',
                            color: 'var(--primary-button-text)',
                          }}
                        >
                          {isExpanded ? 'Hide' : 'Show'}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="mt-3 space-y-2">
                          {workloadScope === 'day' ? (
                            entry.dueTodayItems.length === 0 ? (
                              <p className="text-sm" style={{ color: 'var(--muted)' }}>No tasks due today.</p>
                            ) : (
                              entry.dueTodayItems.map((item) => (
                                <div
                                  key={item.itemId}
                                  className="block rounded-xl border px-3 py-2"
                                  style={{ borderColor: 'var(--border)', background: 'var(--inset)' }}
                                >
                                  <p className="text-sm font-medium" style={{ color: 'var(--foreground-strong)' }}>{item.title}</p>
                                  <p className="mt-1 text-xs" style={{ color: 'var(--subtle)' }}>
                                    {item.boardName ?? 'monday'} / {item.status ?? 'No status'} /{' '}
                                    {formatEffortHours(item.effortHours) ? `${formatEffortHours(item.effortHours)}h` : 'No effort'}
                                  </p>
                                </div>
                              ))
                            )
                          ) : (
                            entry.inProgressItems.length === 0 ? (
                              <p className="text-sm" style={{ color: 'var(--muted)' }}>No to-do or in-progress items due this week.</p>
                            ) : (
                              entry.inProgressItems.map((item) => (
                                <div
                                  key={item.itemId}
                                  className="block rounded-xl border px-3 py-2"
                                  style={{ borderColor: 'var(--border)', background: 'var(--inset)' }}
                                >
                                  <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                                    <span className="font-medium" style={{ color: 'var(--foreground-strong)' }}>{item.title}</span>{' '}
                                    <span style={{ color: 'var(--subtle)' }}>/</span>{' '}
                                    {item.boardName ?? 'monday'}{' '}
                                    <span style={{ color: 'var(--subtle)' }}>/</span>{' '}
                                    {item.status ?? 'No status'}{' '}
                                    <span style={{ color: 'var(--subtle)' }}>/</span>{' '}
                                    {formatDate(item.plannedDate)}{' '}
                                    <span style={{ color: 'var(--subtle)' }}>/</span>{' '}
                                    {formatEffortHours(item.effortHours) ? `${formatEffortHours(item.effortHours)}h` : 'No effort'}
                                  </p>
                                </div>
                              ))
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </DashboardPanel>
      </div>

      {/* Timeline */}
      <DashboardPanel
        title="Delivery timeline"
        subtitle="Phase-by-phase progress for each active project."
      >
        <div className="space-y-4">
          {timelineProjects.length === 0 ? (
            <EmptyState message="No project data available. Run the morning sync to populate." />
          ) : (
            <section className="app-panel space-y-3 rounded-3xl p-4">
              <button
                type="button"
                onClick={() => toggleTimeline('all')}
                className="flex w-full items-center justify-between gap-3 border-b px-1 pb-3 text-left transition"
                style={{ borderColor: 'var(--divider)' }}
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--foreground-strong)' }}>
                    Active projects
                  </h3>
                  <span
                    className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-2 text-[11px] font-semibold shadow-sm"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--accent-border) 72%, transparent)',
                      background: 'color-mix(in srgb, var(--accent-soft) 82%, transparent)',
                      color: 'var(--foreground-strong)',
                    }}
                  >
                    {timelineProjects.length}
                  </span>
                </div>
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border shadow-sm"
                  style={{
                    borderColor: 'var(--timeline-section-toggle-border)',
                    background: 'var(--timeline-section-toggle-bg)',
                    color: 'var(--timeline-section-toggle-text)',
                  }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className={`h-4 w-4 transition-transform ${(expandedTimeline['all'] ?? true) ? 'rotate-90' : 'rotate-0'}`}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 5l6 5-6 5" />
                  </svg>
                </span>
              </button>

              {(expandedTimeline['all'] ?? true) && (
                <div className="space-y-3">
                  {timelineProjects.map((project) => {
                    const currentPhaseKey = project.currentPhase

                    return (
                      <div
                        key={project.itemId}
                        className="app-card rounded-2xl p-3"
                        style={{
                          borderColor: 'color-mix(in srgb, var(--divider) 100%, var(--foreground) 12%)',
                          boxShadow: 'inset 0 1px 0 color-mix(in srgb, white 10%, transparent), 0 0 0 1px color-mix(in srgb, var(--divider) 72%, transparent)',
                        }}
                      >
                        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                          <p className="text-base font-semibold" style={{ color: 'var(--foreground-strong)' }}>
                            {project.title}
                          </p>
                          {project.targetDate && (
                            <span
                              className="rounded-full border px-2 py-0.5 text-[11px]"
                              style={{
                                borderColor: 'var(--divider)',
                                background: 'color-mix(in srgb, var(--panel) 72%, transparent)',
                                color: 'var(--foreground)',
                              }}
                            >
                              Target {formatDate(project.targetDate)}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                            {project.phases.map((phase) => {
                              const isCurrentPhase = currentPhaseKey === phase.key
                              const isOverdue = isCurrentPhase && isPastTargetDate(phase.targetDate, today)

                              return (
                                <div
                                  key={`${project.itemId}-${phase.key}`}
                                  className="rounded-xl border px-2.5 py-2"
                                  style={
                                    isOverdue
                                      ? {
                                          borderColor: 'var(--timeline-phase-overdue-border)',
                                          background: 'var(--timeline-phase-overdue-bg)',
                                          boxShadow: 'inset 0 1px 0 color-mix(in srgb, white 12%, transparent)',
                                        }
                                      : isCurrentPhase
                                      ? {
                                          borderColor: 'var(--timeline-phase-active-border)',
                                          background: 'var(--timeline-phase-active-bg)',
                                          boxShadow: 'inset 0 1px 0 color-mix(in srgb, white 18%, transparent)',
                                        }
                                      : {
                                          borderColor: 'var(--divider)',
                                          background: 'color-mix(in srgb, var(--panel) 68%, transparent)',
                                        }
                                  }
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span
                                      className="truncate text-[11px] font-medium uppercase tracking-[0.12em]"
                                      style={{
                                        color: isOverdue
                                          ? 'var(--timeline-phase-overdue-text)'
                                          : isCurrentPhase
                                          ? 'var(--timeline-phase-active-text)'
                                          : 'var(--timeline-phase-text)',
                                      }}
                                    >
                                      {phase.label}
                                    </span>
                                    <span
                                      className="text-[11px]"
                                      style={{
                                        color: isOverdue
                                          ? 'var(--timeline-phase-overdue-text)'
                                          : isCurrentPhase
                                          ? 'var(--timeline-phase-active-text)'
                                          : 'var(--foreground-strong)',
                                      }}
                                    >
                                      {phase.percentComplete}%
                                    </span>
                                  </div>
                                  <div
                                    className="mt-2 h-2 overflow-hidden rounded-full border"
                                    style={{
                                      borderColor: isOverdue
                                        ? 'var(--timeline-phase-overdue-border)'
                                        : 'color-mix(in srgb, var(--divider) 72%, transparent)',
                                      background: isOverdue
                                        ? 'var(--timeline-phase-overdue-track)'
                                        : 'color-mix(in srgb, var(--panel) 76%, transparent)',
                                    }}
                                  >
                                    <div
                                      className={isOverdue ? 'h-full' : 'h-full bg-[linear-gradient(90deg,rgba(56,189,248,0.95),rgba(34,197,94,0.9))]'}
                                      style={{
                                        width: `${Math.min(phase.percentComplete, 100)}%`,
                                        background: isOverdue ? 'var(--timeline-phase-overdue-bar)' : undefined,
                                      }}
                                    />
                                  </div>
                                  <div
                                    className="mt-1.5 space-y-0.5 text-[11px]"
                                    style={{
                                      color: isOverdue
                                        ? 'color-mix(in srgb, var(--timeline-phase-overdue-text) 78%, transparent)'
                                        : isCurrentPhase
                                        ? 'color-mix(in srgb, var(--timeline-phase-active-text) 84%, transparent)'
                                        : 'var(--timeline-phase-muted-text)',
                                    }}
                                  >
                                    <p>Target {formatDate(phase.targetDate)}</p>
                                    <p>{formatHours(phase.totalEffortHours)}h total</p>
                                    <p>{formatHours(phase.remainingEffortHours)}h left</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          <div className="flex flex-wrap items-start justify-end gap-1.5 text-[11px]">
                            {[
                              { label: `${formatHours(project.totalEffortHours)}h total`, metric: 'total' as const },
                              { label: `${formatHours(project.completedEffortHours)}h done`, metric: 'done' as const },
                              { label: `${formatHours(project.remainingEffortHours)}h left`, metric: 'left' as const },
                              { label: `${project.percentComplete}% complete`, metric: 'complete' as const },
                            ].map((item) => (
                              <span
                                key={item.label}
                                className="rounded-full border px-2 py-0.5"
                                style={getProjectMetricChipStyle(item.metric)}
                              >
                                {item.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </DashboardPanel>
    </div>
  )
}
