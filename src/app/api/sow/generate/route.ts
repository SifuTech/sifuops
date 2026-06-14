import { NextRequest } from 'next/server'
import { generateSowSections, type SowInput } from '@/lib/sow-agent'
import { isDemoMode } from '@/lib/demo'
import { DEMO_SOW_SECTIONS } from '@/lib/demo-data'

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SowInput

  if (!body.project_title || !body.project_manager || !body.project_overview) {
    return new Response('Missing required fields', { status: 400 })
  }

  if (await isDemoMode(request)) {
    return Response.json({ sections: DEMO_SOW_SECTIONS, input: body })
  }

  const sections = await generateSowSections(body)
  return Response.json({ sections, input: body })
}
