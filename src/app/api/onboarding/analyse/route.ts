import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import type { NewProjectInput } from '@/app/(app)/new-project/page'
import type { LessonGroup } from '@/app/api/onboarding/lessons/route'

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

async function loadReferenceDocs(): Promise<string> {
  const docsDir = path.join(process.cwd(), 'agents', 'docs')
  let files: string[]
  try {
    files = (await fs.readdir(docsDir))
      .filter((f) => f.endsWith('.md'))
      .sort()
  } catch {
    return ''
  }

  const sections = await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(path.join(docsDir, file), 'utf-8')
      return content.trim()
    }),
  )

  return sections.filter(Boolean).join('\n\n---\n\n')
}

async function runAgent(
  agent: Agent,
  userPrompt: string,
  referenceDocs: string,
): Promise<AgentOutput> {
  const systemPrompt = await readSystemPrompt(agent)

  const systemBlocks: Anthropic.TextBlockParam[] = [
    {
      type: 'text',
      text: systemPrompt,
      cache_control: { type: 'ephemeral' },
    },
  ]

  if (referenceDocs) {
    systemBlocks.push({
      type: 'text',
      text: `# Reference Documents\n\nThe following documents describe our delivery methodology and product modules. Use them when assessing risks, watchouts, and suggesting tasks.\n\n${referenceDocs}`,
      cache_control: { type: 'ephemeral' },
    })
  }

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

  // Ensure agent field is correct on all suggested tasks
  parsed.suggested_tasks = (parsed.suggested_tasks ?? []).map((t) => ({
    ...t,
    agent: AGENT_LABELS[agent],
  }))

  return parsed
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

    const [userPrompt, referenceDocs] = await Promise.all([
      Promise.resolve(buildUserPrompt(projectInput, lessons ?? [])),
      loadReferenceDocs(),
    ])

    const [ba, po, dev, qa] = await Promise.all([
      runAgent('ba', userPrompt, referenceDocs),
      runAgent('po', userPrompt, referenceDocs),
      runAgent('dev', userPrompt, referenceDocs),
      runAgent('qa', userPrompt, referenceDocs),
    ])

    const result: AnalyseResponse = { ba, po, dev, qa }
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
