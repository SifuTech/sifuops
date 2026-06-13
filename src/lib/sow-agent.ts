import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export type SowInput = {
  project_title: string
  project_manager: string
  project_overview: string
}

export type SowSections = {
  goals_and_objectives: string
  scope_of_work: string
  required_modules: string
  deliverables_by_fastdox: string
  third_party_deliverables: string
  system_for_integrations: string
  acceptance_criteria: string
  training: string
}

const SYSTEM_PROMPT = `You are a senior business analyst at FastDox, a technology delivery company.
You write Statements of Work for client projects.

Given a project title and overview, generate professional content for each SOW section.
Rules:
- Plain text only — no markdown, no asterisks, no dashes for bullets
- Use numbered lists where a list is appropriate (1. 2. 3.)
- Be specific, professional, and concise
- Write from FastDox's perspective as the delivery partner
- Base required_modules and deliverables_by_fastdox on the FastDox module documentation provided
- Match the tone, structure and depth of the example SOWs provided
- Respond with a single valid JSON object and nothing else`

async function fetchDoc(url: string | undefined): Promise<string> {
  if (!url) return ''
  const res = await fetch(url)
  if (!res.ok) return ''
  return res.text()
}

export async function generateSowSections(input: SowInput): Promise<SowSections> {
  const [moduleDocs, sowExamples] = await Promise.all([
    fetchDoc(process.env.FASTDOX_MODULES_URL),
    fetchDoc(process.env.SOW_EXAMPLES_URL),
  ])

  const referenceContent = [
    moduleDocs && `FastDox Module Documentation:\n${moduleDocs}`,
    sowExamples && `Example Statement of Work:\n${sowExamples}`,
  ]
    .filter(Boolean)
    .join('\n\n---\n\n')

  const systemBlocks: Anthropic.TextBlockParam[] = [
    {
      type: 'text',
      text: SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' },
    },
  ]

  if (referenceContent) {
    systemBlocks.push({
      type: 'text',
      text: referenceContent,
      cache_control: { type: 'ephemeral' },
    })
  }

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    system: systemBlocks,
    messages: [
      {
        role: 'user',
        content: `Generate SOW sections for this project:

Project Title: ${input.project_title}
Project Manager: ${input.project_manager}
Project Overview: ${input.project_overview}

Return a JSON object with exactly these keys:
{
  "goals_and_objectives": "...",
  "scope_of_work": "...",
  "required_modules": "...",
  "deliverables_by_fastdox": "...",
  "third_party_deliverables": "...",
  "system_for_integrations": "...",
  "acceptance_criteria": "...",
  "training": "..."
}`,
      },
    ],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in Claude response')

  return JSON.parse(jsonMatch[0]) as SowSections
}
