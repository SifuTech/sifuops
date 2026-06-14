import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import type { NewProjectInput } from '@/app/(app)/new-project/page'
import type { LessonGroup } from '@/app/api/onboarding/lessons/route'
import { isDemoMode } from '@/lib/demo'
import { DEMO_AGENT_RESULTS } from '@/lib/demo-data'

const client = new Anthropic()

type Agent = 'ba' | 'po' | 'dev' | 'qa'

export type AgentOutput = {
  risks: string[]
  watchouts: string[]
  suggested_tasks: {
    title: string
    description: string
    agent: string
  }[]
}

export type AnalyseResponse = Record<Agent, AgentOutput>

const AGENT_LABELS: Record<Agent, string> = {
  ba: 'BA',
  po: 'PO',
  dev: 'Dev',
  qa: 'QA',
}

function buildUserPrompt(input: NewProjectInput, lessons: LessonGroup[]): string {
  const projectTypeLabelMap: Record<string, string> = {
    'new-build': 'New Build (new client, full module configuration)',
    'new-module': 'New Module (existing client, adding a new module)',
    'enhancement': 'Enhancement (existing client, improving existing functionality)',
    'task-delivery': 'Task Delivery (specific task e.g. bulk import / deletion)',
    'development': 'Development (custom development work)',
    'other': 'Other',
  }

  const lines: string[] = [
    '## New Project Brief',
    '',
    `**Project Name:** ${input.projectName}`,
    `**Project Type:** ${projectTypeLabelMap[input.projectType] ?? input.projectType}`,
    `**Key Deadline:** ${input.keyDeadline}`,
    `**Modules Involved:** ${input.modules.length > 0 ? input.modules.join(', ') : 'None specified'}`,
    '',
    '**Project Description:**',
    input.projectDescription,
  ]

  if (input.stakeholderNotes.trim()) {
    lines.push('', '**Client / Stakeholder Notes:**', input.stakeholderNotes)
  }

  if (input.projectBrief?.trim()) {
    lines.push('', '## Raw Project Brief', '', input.projectBrief.trim())
  }

  if (lessons.length > 0) {
    lines.push('', '## Lessons Learnt from Past Projects', '')
    for (const group of lessons) {
      lines.push(`### ${group.projectName}`)
      for (const lesson of group.lessons) {
        lines.push(`- ${lesson}`)
      }
      lines.push('')
    }
  } else {
    lines.push('', '## Lessons Learnt from Past Projects', '', '_No relevant lessons found from past projects._')
  }

  lines.push(
    '',
    '---',
    '',
    'Analyse the brief above and return your structured JSON response.',
  )

  return lines.join('\n')
}

async function readSystemPrompt(agent: Agent): Promise<string> {
  const filePath = path.join(process.cwd(), 'agents', agent, 'system-prompt.md')
  return fs.readFile(filePath, 'utf-8')
}

async function loadReferenceDocs(selectedModules: string[]): Promise<string> {
  const docsDir = path.join(process.cwd(), 'agents', 'docs')
  const parts: string[] = []

  // Always include full delivery methodology
  try {
    const content = await fs.readFile(path.join(docsDir, 'delivery-methodology.md'), 'utf-8')
    if (content.trim()) parts.push(content.trim())
  } catch { /* skip if missing */ }

  // Include only the modules selected for this project
  try {
    const content = await fs.readFile(path.join(docsDir, 'module-documentation.md'), 'utf-8')
    const selected = selectedModules.map((m) => m.toLowerCase())
    const useAll = selected.length === 0

    const filtered = content
      .split(/\n---\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((section) => {
        if (useAll) return true
        if (section.startsWith('# Module Documentation')) return true
        const match = section.match(/^## \d+\.\s+(.+)/)
        if (!match) return true
        const sectionName = match[1].toLowerCase()
        return selected.some((m) => sectionName.includes(m))
      })

    if (filtered.length > 0) parts.push(filtered.join('\n\n---\n\n'))
  } catch { /* skip if missing */ }

  return parts.join('\n\n---\n\n')
}

async function runAgent(
  agent: Agent,
  userPrompt: string,
  referenceDocs: string,
): Promise<{ output: AgentOutput; usage: Anthropic.Usage }> {
  const systemPrompt = await readSystemPrompt(agent)

  // Reference docs first — identical across all agents so sequential runs share the cache
  const systemBlocks: Anthropic.TextBlockParam[] = []

  if (referenceDocs) {
    systemBlocks.push({
      type: 'text',
      text: `# Reference Documents\n\nThe following documents describe our delivery methodology and product modules. Use them when assessing risks, watchouts, and suggesting tasks.\n\n${referenceDocs}`,
      cache_control: { type: 'ephemeral' },
    })
  }

  // Agent-specific prompt second
  systemBlocks.push({
    type: 'text',
    text: systemPrompt,
    cache_control: { type: 'ephemeral' },
  })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemBlocks,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error(`${AGENT_LABELS[agent]} agent returned no text`)
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error(`${AGENT_LABELS[agent]} agent returned no JSON`)
  }

  const parsed = JSON.parse(jsonMatch[0]) as AgentOutput

  parsed.suggested_tasks = (parsed.suggested_tasks ?? []).map((t) => ({
    ...t,
    agent: AGENT_LABELS[agent],
  }))

  return { output: parsed, usage: message.usage }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectInput, lessons } = body as {
      projectInput: NewProjectInput
      lessons: LessonGroup[]
    }

    if (!projectInput?.projectName) {
      return NextResponse.json({ error: 'projectInput is required' }, { status: 400 })
    }

    if (await isDemoMode(req)) {
      return NextResponse.json(DEMO_AGENT_RESULTS)
    }

    const [userPrompt, referenceDocs] = await Promise.all([
      Promise.resolve(buildUserPrompt(projectInput, lessons ?? [])),
      loadReferenceDocs(projectInput.modules ?? []),
    ])

    // Sequential so each agent after the first gets a cache hit on the shared reference docs block
    const baResult = await runAgent('ba', userPrompt, referenceDocs)
    const poResult = await runAgent('po', userPrompt, referenceDocs)
    const devResult = await runAgent('dev', userPrompt, referenceDocs)
    const qaResult = await runAgent('qa', userPrompt, referenceDocs)

    const totalInput = baResult.usage.input_tokens + poResult.usage.input_tokens + devResult.usage.input_tokens + qaResult.usage.input_tokens
    const totalOutput = baResult.usage.output_tokens + poResult.usage.output_tokens + devResult.usage.output_tokens + qaResult.usage.output_tokens
    const cacheUsage = (u: Anthropic.Usage) => u as unknown as { cache_read_input_tokens?: number; cache_creation_input_tokens?: number }
    const totalCacheRead = (cacheUsage(baResult.usage).cache_read_input_tokens ?? 0) + (cacheUsage(poResult.usage).cache_read_input_tokens ?? 0) + (cacheUsage(devResult.usage).cache_read_input_tokens ?? 0) + (cacheUsage(qaResult.usage).cache_read_input_tokens ?? 0)
    const totalCacheWrite = (cacheUsage(baResult.usage).cache_creation_input_tokens ?? 0) + (cacheUsage(poResult.usage).cache_creation_input_tokens ?? 0) + (cacheUsage(devResult.usage).cache_creation_input_tokens ?? 0) + (cacheUsage(qaResult.usage).cache_creation_input_tokens ?? 0)

    console.log(`[onboarding/analyse] token usage — input: ${totalInput}, output: ${totalOutput}, cache_read: ${totalCacheRead}, cache_write: ${totalCacheWrite}, total: ${totalInput + totalOutput}`)
    console.log(`[onboarding/analyse] per-agent — ba: ${baResult.usage.input_tokens}+${baResult.usage.output_tokens}, po: ${poResult.usage.input_tokens}+${poResult.usage.output_tokens}, dev: ${devResult.usage.input_tokens}+${devResult.usage.output_tokens}, qa: ${qaResult.usage.input_tokens}+${qaResult.usage.output_tokens}`)

    const result: AnalyseResponse = {
      ba: baResult.output,
      po: poResult.output,
      dev: devResult.output,
      qa: qaResult.output,
    }
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
