const MONDAY_API = 'https://api.monday.com/v2'

function getApiKey(): string {
  const key = process.env.MONDAY_API_KEY
  if (!key) throw new Error('MONDAY_API_KEY is not set')
  return key
}

async function query<T>(gql: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(MONDAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getApiKey(),
      'API-Version': '2026-01',
    },
    body: JSON.stringify({ query: gql, variables }),
    cache: 'no-store',
  })
  const json = await res.json()
  if (json.errors?.length) {
    const msg = typeof json.errors[0] === 'string' ? json.errors[0] : json.errors[0].message
    throw new Error(msg)
  }
  return json.data as T
}

export type Group = { id: string; title: string }
export type Board = { id: string; name: string; groups: Group[] }

export async function listBoards(): Promise<Board[]> {
  const data = await query<{ boards: Board[] }>(`
    query {
      boards(limit: 100, state: active) {
        id
        name
        groups { id title }
      }
    }
  `)
  return data.boards
}

export type Item = { id: string; name: string }

export async function getGroupItems(boardId: string, groupId: string): Promise<Item[]> {
  const data = await query<{ boards: { groups: { items_page: { items: Item[] } }[] }[] }>(
    `
    query($boardId: ID!, $groupId: String!) {
      boards(ids: [$boardId]) {
        groups(ids: [$groupId]) {
          items_page(limit: 50) {
            items { id name }
          }
        }
      }
    }
  `,
    { boardId, groupId },
  )
  return data.boards[0]?.groups[0]?.items_page?.items ?? []
}

// Phase group aliases — matches the group names used across FastDox project boards
const WORK_GROUP_ALIASES: string[][] = [
  ['pre-sales/technical discovery', 'pre-sales', 'technical discovery', 'pre sales'],
  ['discovery / scoping', 'discovery', 'scoping', 'estimation & planning'],
  ['build', 'build / demo / refine', 'demo', 'refine', 'development'],
  ['test', 'testing', 'uat', 'internal testing', 'user acceptance testing'],
  ['handhold', 'handhold/prepare for go live', 'prepare for go live', 'go live', 'post go-live', 'closure'],
]

function isWorkGroup(title: string): boolean {
  const t = title.toLowerCase()
  return WORK_GROUP_ALIASES.some((aliases) => aliases.some((a) => t.includes(a)))
}

export type Priority = 'P1' | 'High' | 'Medium' | 'Low'

export function normalizePriority(value: string | null | undefined): Priority {
  const t = value?.trim().toLowerCase() ?? ''
  if (t === 'p1' || t.startsWith('critical')) return 'P1'
  if (t.startsWith('high')) return 'High'
  if (t.startsWith('medium')) return 'Medium'
  return 'Low'
}

export function isCompletedStatus(status: string | null | undefined): boolean {
  const t = status?.trim().toLowerCase() ?? ''
  return t === 'done' || t === 'complete' || t === 'completed'
}

export function parseHours(value: string | null | undefined): number {
  if (!value) return 0
  const n = Number(value.trim())
  return Number.isFinite(n) ? n : 0
}

export type WorkItem = {
  id: string
  name: string
  group: string
  owner: string | null
  status: string | null
  priority: Priority
  targetDate: string | null
  plannedDate: string | null
  effort: string | null
  subitems: string[]
}

type RawColumnValue = {
  text: string | null
  column: { title: string | null } | null
}

type RawItem = {
  id: string
  name: string
  column_values: RawColumnValue[]
  subitems: { id: string; name: string }[]
}

type RawWorkData = {
  boards: {
    groups: {
      title: string
      items_page: { items: RawItem[] }
    }[]
  }[]
}

function getColText(columnValues: RawColumnValue[], ...keys: string[]): string | null {
  for (const key of keys) {
    const match = columnValues.find(
      (cv) => cv.column?.title?.trim().toLowerCase() === key.toLowerCase(),
    )
    const val = match?.text?.trim()
    if (val) return val
  }
  return null
}

export async function getBoardWorkItems(boardId: string, boardGroups: Group[]): Promise<WorkItem[]> {
  const workGroups = boardGroups.filter((g) => isWorkGroup(g.title))
  if (workGroups.length === 0) return []

  const groupIds = workGroups.map((g) => g.id)

  const data = await query<RawWorkData>(
    `
    query($boardId: ID!, $groupIds: [String!]!) {
      boards(ids: [$boardId]) {
        groups(ids: $groupIds) {
          title
          items_page(limit: 100) {
            items {
              id
              name
              column_values {
                text
                column { title }
              }
              subitems { id name }
            }
          }
        }
      }
    }
    `,
    { boardId, groupIds },
  )

  const items: WorkItem[] = []

  for (const group of data.boards[0]?.groups ?? []) {
    for (const raw of group.items_page.items) {
      const cv = raw.column_values

      items.push({
        id: raw.id,
        name: raw.name,
        group: group.title,
        owner: getColText(cv, 'owner', 'assigned to', 'assignee', 'person'),
        status: getColText(cv, 'status'),
        priority: normalizePriority(getColText(cv, 'priority')),
        targetDate: getColText(cv, 'target date', 'target'),
        plannedDate: getColText(cv, 'planned date', 'planned', 'plan date'),
        effort: getColText(cv, 'effort', 'hours', 'estimated hours'),
        subitems: raw.subitems.slice(0, 5).map((s) => s.name),
      })
    }
  }

  return items
}
