import Anthropic from '@anthropic-ai/sdk'
import type { SubItem, WorkItem } from './monday'

const client = new Anthropic()

export type ProjectWorkData = {
  boardName: string
  items: WorkItem[]
}

const SYSTEM_PROMPT = `You are a Delivery Manager's daily briefing assistant for a game development studio.
You receive two pre-split lists: FOCUS ITEMS and OTHER ITEMS. One group may be labelled "BAU" — ongoing operational tasks; treat them the same as any project. Subtasks appear beneath tasks with ↳ and may carry [OVERDUE] or [DUE TODAY] labels with planned dates.

Produce a Discord briefing in exactly two sections. Use emojis throughout to make the message clear and easy to scan.

━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — Focus
━━━━━━━━━━━━━━━━━━━━━
Header (weekday): __🎯 **Focus today:**__
Header (Sunday):  __🗓️ **Focus Monday:**__

Format every task from the FOCUS ITEMS list. Do not add or remove any tasks.

For each project that has focus tasks:
  📌 **Project Name**
  • Task name — short justification (e.g. "P1 · overdue 3 days · 6h", "High priority · deadline today")

ORDERING — apply in this exact sequence:
1. Projects with at least one [OVERDUE] task appear before projects that only have [DUE TODAY/MONDAY] tasks
2. Within each project: [OVERDUE] tasks before [DUE TODAY/MONDAY] tasks
3. Within each urgency tier: P1 → High → Medium → unlabelled (Low)
4. Within the same priority: higher effort (≥ 4h) first

- Always include priority in the justification if P1 or High; always include effort if ≥ 4h
- If the FOCUS ITEMS list is empty, write "Nothing overdue or due — clear start ✅"
- Leave a blank line between each project block

━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — Other
━━━━━━━━━━━━━━━━━━━━━
Header: __📋 **Other**__

Format every task from the OTHER ITEMS list, grouped by project.
  🗂 **Project Name**
  • Key task or theme outstanding
  • [AWAITING CLIENT] Task name — awaiting client response
  • [BLOCKED] Task name — blocked

- Within each project, lead with P1 or High priority tasks if present
- Keep bullets concise — one line each; mention effort if ≥ 4h and priority if P1 or High
- Omit projects with nothing notable
- Leave a blank line between each project block

━━━━━━━━━━━━━━━━━━━━━
GLOBAL FORMAT RULES
━━━━━━━━━━━━━━━━━━━━━
- Use Discord markdown (** for bold, • for bullets)
- Leave a blank line between Section 1 and Section 2
- No greeting, no sign-off, no overall status sentence
- Do NOT add emojis at the end of bullet points — only use emojis on section headers (🎯/🗓️/📋) and project headers (📌/🗂)
- Keep the entire response under 1900 characters`

function todayUTCStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function focusDateStr(isSunday: boolean): string {
  const d = new Date()
  if (isSunday) d.setUTCDate(d.getUTCDate() + 1) // target Monday's tasks on Sunday
  return d.toISOString().slice(0, 10)
}

function normaliseDate(d: string): string {
  return d.slice(0, 10)
}

type DateLabel = '[OVERDUE]' | '[DUE TODAY/MONDAY]' | '[AWAITING CLIENT]' | '[BLOCKED]' | ''

function isCompletedStatus(s: string | null | undefined): boolean {
  const t = s?.trim().toLowerCase() ?? ''
  return t === 'done' || t === 'complete' || t === 'completed'
}

function subtaskUrgency(subitems: SubItem[], todayStr: string, focusStr: string): DateLabel {
  let best: DateLabel = ''
  for (const sub of subitems) {
    if (!sub.plannedDate || isCompletedStatus(sub.status)) continue
    const d = normaliseDate(sub.plannedDate)
    if (d < todayStr) return '[OVERDUE]'
    if (d === focusStr) best = '[DUE TODAY/MONDAY]'
  }
  return best
}

function dateLabel(item: WorkItem, todayStr: string, focusStr: string): DateLabel {
  const statusLower = item.status?.trim().toLowerCase() ?? ''

  // Done items get no label — excluded from both sections
  if (isCompletedStatus(statusLower)) return ''

  // Awaiting client / blocked → routed to Other section by the prompt
  if (statusLower === 'awaiting client' || statusLower === 'awaiting') return '[AWAITING CLIENT]'
  if (statusLower === 'blocked') return '[BLOCKED]'

  // Task-level target date takes priority
  if (item.targetDate) {
    const d = normaliseDate(item.targetDate)
    if (d < todayStr) return '[OVERDUE]'
    if (d === focusStr) return '[DUE TODAY/MONDAY]'
  }

  // Surface the task if any active subtask has a planned date that is overdue or due today
  return subtaskUrgency(item.subitems, todayStr, focusStr)
}

function formatItems(items: WorkItem[], todayStr: string, focusStr: string): string {
  return items
    .map((item) => {
      const label = dateLabel(item, todayStr, focusStr)
      const meta: string[] = []
      if (item.owner) meta.push(`👤 ${item.owner}`)
      if (item.status) meta.push(item.status)
      if (item.priority !== 'Low') meta.push(item.priority)
      if (item.targetDate) meta.push(`Target: ${item.targetDate}`)
      else if (item.plannedDate) meta.push(`Planned: ${item.plannedDate}`)
      if (item.effort) meta.push(`${item.effort}h`)
      const suffix = meta.length ? ` (${meta.join(' · ')})` : ''
      const labelPrefix = label ? `${label} ` : ''
      const main = `• ${labelPrefix}[${item.group}] ${item.name}${suffix}`
      const subs = item.subitems
        .filter((s) => !isCompletedStatus(s.status))
        .map((s) => {
          const subMeta: string[] = []
          if (s.status) subMeta.push(s.status)
          let subUrgency = ''
          if (s.plannedDate) {
            const d = normaliseDate(s.plannedDate)
            subUrgency = d < todayStr ? '[OVERDUE] ' : d === focusStr ? '[DUE TODAY] ' : ''
            subMeta.push(`Planned: ${s.plannedDate}`)
          }
          const subSuffix = subMeta.length ? ` (${subMeta.join(' · ')})` : ''
          return `  ↳ ${subUrgency}${s.name}${subSuffix}`
        })
        .join('\n')
      return subs ? `${main}\n${subs}` : main
    })
    .join('\n')
}

export async function generateBriefing(
  projects: ProjectWorkData[],
  { maskNames = false, isSunday = false }: { maskNames?: boolean; isSunday?: boolean } = {},
): Promise<string> {
  const hasItems = projects.some((p) => p.items.length > 0)
  if (!hasItems) {
    return isSunday
      ? '🗓️ **Focus Monday:** No active tasks — clean slate heading into the week.'
      : '🎯 **Focus today:** No active tasks across projects.'
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const todayStr = todayUTCStr()
  const focusStr = focusDateStr(isSunday)

  const displayProjects = maskNames
    ? projects.map((p, i) => ({ ...p, boardName: `Project ${String.fromCharCode(65 + i)}` }))
    : projects

  const activeProjects = displayProjects.map((p) => ({
    ...p,
    items: p.items.filter((item) => !isCompletedStatus(item.status)),
  }))

  const focusText = activeProjects
    .map((p) => {
      const items = p.items.filter((item) => {
        const label = dateLabel(item, todayStr, focusStr)
        return label === '[OVERDUE]' || label === '[DUE TODAY/MONDAY]'
      })
      if (!items.length) return null
      return `**${p.boardName}**\n${formatItems(items, todayStr, focusStr)}`
    })
    .filter(Boolean)
    .join('\n\n')

  const otherText = activeProjects
    .map((p) => {
      const items = p.items.filter((item) => {
        const label = dateLabel(item, todayStr, focusStr)
        return label !== '[OVERDUE]' && label !== '[DUE TODAY/MONDAY]'
      })
      if (!items.length) return null
      return `**${p.boardName}**\n${formatItems(items, todayStr, focusStr)}`
    })
    .filter(Boolean)
    .join('\n\n')

  const dayContext = isSunday
    ? 'Today is Sunday. This is the Monday preparation briefing.'
    : 'This is the daily morning briefing.'

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Today is ${today}. ${dayContext}\n\n=== FOCUS ITEMS (overdue or due today — goes in Section 1) ===\n${focusText || '(none)'}\n\n=== OTHER ITEMS (active but not overdue/due today — goes in Section 2) ===\n${otherText || '(none)'}\n\nPlease generate today's briefing.`,
      },
    ],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  return textBlock?.type === 'text' ? textBlock.text : 'Good morning! ☀️ (Briefing unavailable)'
}
