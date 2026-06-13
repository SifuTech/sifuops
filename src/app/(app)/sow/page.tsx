'use client'

import { useState } from 'react'
import type { SowSections, SowInput } from '@/lib/sow-agent'

const SECTION_LABELS: Record<keyof SowSections, string> = {
  goals_and_objectives: 'Goals & Objectives',
  scope_of_work: 'Scope of Work',
  required_modules: 'Required Modules',
  deliverables_by_fastdox: 'Deliverables by FastDox',
  third_party_deliverables: 'Third Party Deliverables',
  system_for_integrations: 'Systems & Integrations',
  acceptance_criteria: 'Acceptance Criteria',
  training: 'Training',
}

export default function SowPage() {
  const [input, setInput] = useState<SowInput>({
    project_title: '',
    project_manager: '',
    project_overview: '',
  })
  const [sections, setSections] = useState<SowSections | null>(null)
  const [generating, setGenerating] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    setError(null)
    setSections(null)

    try {
      const res = await fetch('/api/sow/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setSections(data.sections)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  async function handleDownload() {
    if (!sections) return
    setDownloading(true)

    try {
      const res = await fetch('/api/sow/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections, input }),
      })
      if (!res.ok) throw new Error(await res.text())

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${input.project_title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-sow.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Statement of Work Generator</h1>
        <p className="text-gray-500 mb-8">Enter project details and Claude will draft the SOW for review.</p>

        <form onSubmit={handleGenerate} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
            <input
              type="text"
              required
              value={input.project_title}
              onChange={(e) => setInput((p) => ({ ...p, project_title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. FDX Player Portal v2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
            <input
              type="text"
              required
              value={input.project_manager}
              onChange={(e) => setInput((p) => ({ ...p, project_manager: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Overview</label>
            <textarea
              required
              rows={5}
              value={input.project_overview}
              onChange={(e) => setInput((p) => ({ ...p, project_overview: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe the project — what the client needs, the problem being solved, key requirements..."
            />
          </div>

          <button
            type="submit"
            disabled={generating}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? 'Generating SOW...' : 'Generate SOW'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {generating && (
          <div className="text-center text-gray-500 text-sm py-10">
            Claude is drafting your SOW — this takes about 15 seconds...
          </div>
        )}

        {sections && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="bg-green-600 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {downloading ? 'Preparing...' : 'Download SOW (.docx)'}
              </button>
            </div>

            {(Object.keys(SECTION_LABELS) as (keyof SowSections)[]).map((key) => (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {SECTION_LABELS[key]}
                </h3>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{sections[key]}</p>
              </div>
            ))}

            <div className="pt-2 pb-8">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {downloading ? 'Preparing...' : 'Download SOW (.docx)'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
