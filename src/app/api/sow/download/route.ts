import { NextRequest } from 'next/server'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import type { SowInput, SowSections } from '@/lib/sow-agent'

export async function POST(request: NextRequest) {
  const templateUrl = process.env.SOW_TEMPLATE_URL
  if (!templateUrl) {
    return new Response('SOW_TEMPLATE_URL not configured', { status: 500 })
  }

  const { sections, input } = (await request.json()) as { sections: SowSections; input: SowInput }

  const templateRes = await fetch(templateUrl)
  if (!templateRes.ok) {
    return new Response('Failed to fetch template', { status: 500 })
  }

  const templateBuffer = await templateRes.arrayBuffer()
  const zip = new PizZip(templateBuffer)
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })

  doc.render({
    project_title: input.project_title,
    project_manager: input.project_manager,
    date: new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    project_overview: input.project_overview,
    ...sections,
  })

  const output = new Uint8Array(doc.getZip().generate({ type: 'nodebuffer' }))
  const filename = `${input.project_title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-sow.docx`

  return new Response(output, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
