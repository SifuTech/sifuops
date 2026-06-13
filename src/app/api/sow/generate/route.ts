import { NextRequest } from 'next/server'
import { generateSowSections, type SowInput } from '@/lib/sow-agent'

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SowInput

  if (!body.project_title || !body.project_manager || !body.project_overview) {
    return new Response('Missing required fields', { status: 400 })
  }

  const sections = await generateSowSections(body)
  return Response.json({ sections, input: body })
}
