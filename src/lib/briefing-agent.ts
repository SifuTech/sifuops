import Anthropic from '@anthropic-ai/sdk'
import type { WorkItem } from './monday'

const client = new Anthropic()

export type ProjectWorkData = {
  boardName: string
  items: WorkItem[]
}

const SYSTEM_PROMPT = `You are a Delivery Manager's daily briefing assistant for a game development studio.
Each morning you receive active project tasks grouped by project. Items are pre-labelled [OVERDUE] or [DUE TODAY/MONDAY] where relevant.

Produce a Discord briefing in exactly two sections. Use emojis throughout to make the message clear and easy to scan.

━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — Focus
━━━━━━━━━━━━━━━━━━━━━
Header (weekday): __🎯 **Focus today:**__
Header (Sunday):  __🗓️ **Focus Monday:**__

Group ONLY items labelled [OVERDUE] or [DUE TODAY/MONDAY] by project. For each project that has qualifying tasks:
  📌 **Project Name**
  • Task name — short justification (e.g. "overdue 2 days", "deadline today", "blocks milestone")
  • Task name — short justification

- Tasks from the same project go under the same project header — do NOT split them into separate entries
- If more than 3 projects qualify, pick the most critical ones using judgment
- If nothing qualifies, write "Nothing overdue or due — clear start ✅"
- Leave a blank line between each project block

━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — Other
━━━━━━━━━━━━━━━━━━━━━
Header: __📋 **Other**__

For each project with outstanding work NOT already covered in Section 1:
  🗂 **Project Name**
  • Key task or theme outstanding
  • Another key task if relevant

- Group by project — do not create separate entries for the same project
- Keep bullets concise — one line each
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

type DateLabel = '[OVERDUE]' | '[DUE TODAY/MONDAY]' | ''

function dateLabel(item: WorkItem, todayStr: string, focusStr: string): DateLabel {
  const raw = item.targetDate || item.plannedDate
  if (!raw) return ''
  const d = normaliseDate(raw)
  if (d < todayStr) return '[OVERDUE]'
  if (d === focusStr) return '[DUE TODAY/MONDAY]'
  return ''
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
      const subs = item.subitems.map((s) => `  ↳ ${s}`).join('\n')
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

  const projectText = displayProjects
    .filter((p) => p.items.length > 0)
    .map((p) => `**${p.boardName}**\n${formatItems(p.items, todayStr, focusStr)}`)
    .join('\n\n')

  const dayContext = isSunday
    ? 'Today is Sunday. This is the Monday preparation briefing — the Focus section should cover tasks that are overdue OR due on Monday.'
    : 'This is the daily morning briefing.'

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
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
        content: `Today is ${today}. ${dayContext}\n\nHere are the active project tasks (items marked [OVERDUE] or [DUE TODAY/MONDAY] are your Section 1 candidates):\n\n${projectText}\n\nPlease generate today's briefing.`,
      },
    ],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  return textBlock?.type === 'text' ? textBlock.text : 'Good morning! ☀️ (Briefing unavailable)'
}
