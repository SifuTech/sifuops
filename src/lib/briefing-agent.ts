import Anthropic from '@anthropic-ai/sdk'
import type { WorkItem } from './monday'

const client = new Anthropic()

export type ProjectWorkData = {
  boardName: string
  items: WorkItem[]
}

const SYSTEM_PROMPT = `You are a Delivery Manager's morning briefing assistant for a game development studio.
Each morning you receive active project tasks grouped by project, with phase, target date, planned date, and effort.

Your job: produce a focused daily briefing for Discord.

Prioritisation logic:
- Overdue tasks (target or planned date has passed) → urgent
- Tasks due within the next 7 days → high priority
- High effort tasks approaching deadline need early flagging

Format rules (follow exactly):
1. Open with "🎯 **Focus today:**" followed by the top 2-3 urgent priorities across all projects as short bullet points
2. Then a blank line
3. Then each project that has something relevant as a single bullet point — one concise sentence on what needs attention
4. No greeting, no sign-off, no overall status sentence
5. Use Discord markdown (** for bold, • for bullets)
6. Keep the entire response under 1800 characters
7. Omit projects with nothing urgent`

function formatItems(items: WorkItem[]): string {
  return items
    .map((item) => {
      const meta: string[] = []
      if (item.targetDate) meta.push(`Target: ${item.targetDate}`)
      else if (item.plannedDate) meta.push(`Planned: ${item.plannedDate}`)
      if (item.effort) meta.push(`${item.effort}h`)
      const suffix = meta.length ? ` (${meta.join(', ')})` : ''
      const main = `• [${item.group}] ${item.name}${suffix}`
      const subs = item.subitems.map((s) => `  ↳ ${s}`).join('\n')
      return subs ? `${main}\n${subs}` : main
    })
    .join('\n')
}

export async function generateBriefing(
  projects: ProjectWorkData[],
  { maskNames = false }: { maskNames?: boolean } = {},
): Promise<string> {
  const hasItems = projects.some((p) => p.items.length > 0)
  if (!hasItems) {
    return '🎯 **Focus today:** No active tasks across projects.'
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const displayProjects = maskNames
    ? projects.map((p, i) => ({ ...p, boardName: `Project ${String.fromCharCode(65 + i)}` }))
    : projects

  const projectText = displayProjects
    .filter((p) => p.items.length > 0)
    .map((p) => `**${p.boardName}**\n${formatItems(p.items)}`)
    .join('\n\n')

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
        content: `Today is ${today}.\n\nHere are the active project tasks:\n\n${projectText}\n\nPlease generate today's briefing.`,
      },
    ],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  return textBlock?.type === 'text' ? textBlock.text : 'Good morning! ☀️ (Briefing unavailable)'
}
