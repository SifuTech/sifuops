import { cookies } from 'next/headers'
import { DEMO_COOKIE } from '@/lib/demo'
import { DEMO_WORK_ITEMS, DEMO_PROJECTS, DEMO_LESSONS_COUNT } from '@/lib/demo-data'
import { sql } from '@/lib/db'
import {
  DeliveryControl,
  type PriorityOrderItem,
  type WorkloadItem,
  type TimelineProject,
  type TimelinePhase,
  type DashboardKPIs,
  type Priority,
} from '@/components/delivery-control'

type RawWorkItem = {
  item_id: string
  board_id: string
  board_name: string | null
  group_name: string | null
  phase_key: string | null
  name: string
  owner: string | null
  status: string | null
  priority: string
  target_date: string | null
  planned_date: string | null
  effort: string | null
}

type RawProject = {
  board_id: string
  board_name: string
}

const PHASES: Array<{ key: string; label: string }> = [
  { key: 'presales', label: 'Pre-Sales / Technical Discovery' },
  { key: 'discovery', label: 'Discovery / Scoping' },
  { key: 'build', label: 'Build / Demo / Refine' },
  { key: 'test', label: 'Test' },
  { key: 'handhold', label: 'Handhold / Go Live' },
]

function isOpen(status: string | null) {
  const s = status?.trim().toLowerCase() ?? ''
  return !['done', 'complete', 'completed'].includes(s)
}

function startOfToday() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isOverdue(plannedDate: string | null) {
  if (!plannedDate) return false
  return new Date(`${plannedDate}T00:00:00`) < startOfToday()
}

function isDueThisWeek(plannedDate: string | null) {
  if (!plannedDate) return false
  const d = new Date(`${plannedDate}T00:00:00`)
  const today = startOfToday()
  const day = today.getDay()
  const offset = day === 0 ? 1 : 1 - day
  const weekStart = new Date(today.getTime() + offset * 86400000)
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000)
  return d >= weekStart && d < weekEnd
}

function priorityRank(p: string) {
  const lp = p.toLowerCase()
  if (lp === 'p1') return 0
  if (lp === 'high') return 1
  if (lp === 'medium') return 2
  return 3
}

function parseHours(effort: string | null): number {
  if (!effort) return 0
  const n = Number(effort)
  return Number.isFinite(n) ? n : 0
}

async function getDashboardData() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get(DEMO_COOKIE)?.value === '1'

  let items: RawWorkItem[] = []
  let projects: RawProject[] = []
  let lessonsCount = 0

  if (isDemo) {
    items = DEMO_WORK_ITEMS as RawWorkItem[]
    projects = DEMO_PROJECTS
    lessonsCount = DEMO_LESSONS_COUNT
  } else {
    try {
      items = (await sql`SELECT * FROM monday_work_items`) as RawWorkItem[]
    } catch {
      // table may not exist yet
    }

    try {
      projects = (await sql`
        SELECT board_id, board_name FROM projects WHERE active = true ORDER BY board_name
      `) as RawProject[]
    } catch {
      // table may not exist yet
    }

    try {
      const rows = (await sql`SELECT COUNT(*)::int AS count FROM lessons_learnt`) as { count: number }[]
      lessonsCount = rows[0]?.count ?? 0
    } catch {
      // ignore
    }
  }

  const openItems = items.filter((i) => isOpen(i.status))

  // KPIs
  const kpis: DashboardKPIs = {
    openWork: openItems.length,
    dueThisWeek: openItems.filter((i) => isDueThisWeek(i.planned_date)).length,
    overdue: openItems.filter((i) => isOverdue(i.planned_date)).length,
    atRisk: openItems.filter((i) => {
      const s = i.status?.trim().toLowerCase() ?? ''
      return s === 'blocked' || s === 'awaiting client'
    }).length,
    unassigned: openItems.filter((i) => !i.owner).length,
    activeProjects: projects.length,
    lessonsLearnt: lessonsCount,
  }

  // Priority order — open items with owner, sorted by priority then planned date
  const priorityOrderItems: PriorityOrderItem[] = openItems
    .filter((i) => i.owner)
    .sort((a, b) => {
      const pd = priorityRank(a.priority) - priorityRank(b.priority)
      if (pd !== 0) return pd
      const at = a.planned_date ? new Date(`${a.planned_date}T00:00:00`).getTime() : Infinity
      const bt = b.planned_date ? new Date(`${b.planned_date}T00:00:00`).getTime() : Infinity
      return at - bt
    })
    .slice(0, 20)
    .map((i) => ({
      itemId: i.item_id,
      title: i.name,
      owner: i.owner ?? 'Unassigned',
      status: i.status ?? '',
      priority: i.priority as Priority,
      parentTitle: i.group_name ?? '',
      boardName: i.board_name,
      plannedDate: i.planned_date,
      effortHours: i.effort,
      itemUrl: null,
    }))

  // Workload — open items with owner, for week/day filtering in client
  const workloadItems: WorkloadItem[] = openItems
    .filter((i) => i.owner)
    .map((i) => ({
      itemId: i.item_id,
      title: i.name,
      boardName: i.board_name,
      owner: i.owner!,
      status: i.status,
      plannedDate: i.planned_date,
      effortHours: i.effort,
      itemUrl: null,
    }))

  // Timeline — per project, per phase
  const timelineProjects: TimelineProject[] = projects
    .map((p) => {
      const boardItems = items.filter((i) => i.board_id === p.board_id)

      const phases: TimelinePhase[] = PHASES.map((phase) => {
        const phaseItems = boardItems.filter((i) => i.phase_key === phase.key)
        const totalEffort = phaseItems.reduce((sum, i) => sum + parseHours(i.effort), 0)
        const completedItems = phaseItems.filter((i) => !isOpen(i.status))
        const completedEffort = completedItems.reduce((sum, i) => sum + parseHours(i.effort), 0)
        const targetDate = phaseItems.reduce<string | null>((latest, i) => {
          if (!i.target_date) return latest
          if (!latest) return i.target_date
          return i.target_date > latest ? i.target_date : latest
        }, null)
        const pct =
          totalEffort > 0
            ? Math.round((completedEffort / totalEffort) * 100)
            : phaseItems.length > 0
            ? Math.round((completedItems.length / phaseItems.length) * 100)
            : 0

        return {
          key: phase.key,
          label: phase.label,
          totalEffortHours: totalEffort,
          completedEffortHours: completedEffort,
          remainingEffortHours: Math.max(totalEffort - completedEffort, 0),
          percentComplete: Math.min(pct, 100),
          targetDate,
          itemCount: phaseItems.length,
        }
      })

      const totalEffortHours = phases.reduce((s, ph) => s + ph.totalEffortHours, 0)
      const completedEffortHours = phases.reduce((s, ph) => s + ph.completedEffortHours, 0)
      const percentComplete =
        totalEffortHours > 0 ? Math.round((completedEffortHours / totalEffortHours) * 100) : 0

      const currentPhase =
        phases.find((ph) => ph.itemCount > 0 && ph.percentComplete < 100)?.key ?? null

      const targetDate = phases.reduce<string | null>((latest, ph) => {
        if (!ph.targetDate) return latest
        if (!latest) return ph.targetDate
        return ph.targetDate > latest ? ph.targetDate : latest
      }, null)

      return {
        itemId: p.board_id,
        title: p.board_name,
        currentPhase,
        targetDate,
        totalEffortHours,
        completedEffortHours,
        remainingEffortHours: Math.max(totalEffortHours - completedEffortHours, 0),
        percentComplete: Math.min(percentComplete, 100),
        phases,
      }
    })
    .filter((p) => p.phases.some((ph) => ph.itemCount > 0))

  return { kpis, priorityOrderItems, workloadItems, timelineProjects }
}

export default async function DashboardPage() {
  const { kpis, priorityOrderItems, workloadItems, timelineProjects } = await getDashboardData()
  const todayIso = new Date().toISOString().slice(0, 10)

  return (
    <DeliveryControl
      kpis={kpis}
      priorityOrderItems={priorityOrderItems}
      workloadItems={workloadItems}
      timelineProjects={timelineProjects}
      todayIso={todayIso}
    />
  )
}
