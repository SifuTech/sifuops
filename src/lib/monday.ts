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
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query: gql, variables }),
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

const WORK_GROUP_TITLES = [
  'pre-sales/technical discovery',
  'discovery / scoping',
  'build',
  'development',
  'testing',
  'handhold/prepare for go live',
]

export type WorkItem = {
  id: string
  name: string
  group: string
  targetDate: string | null
  plannedDate: string | null
  effort: string | null
  subitems: string[]
}

type RawItem = {
  id: string
  name: string
  column_values: { id: string; text: string }[]
  subitems: { id: string; name: string }[]
}

type RawWorkData = {
  boards: {
    columns: { id: string; title: string }[]
    groups: {
      title: string
      items_page: { items: RawItem[] }
    }[]
  }[]
}

function findCol(map: Map<string, string>, keys: string[]): string | null {
  for (const key of keys) {
    const val = map.get(key)
    if (val) return val
  }
  return null
}

export async function getBoardWorkItems(boardId: string, boardGroups: Group[]): Promise<WorkItem[]> {
  const workGroups = boardGroups.filter((g) =>
    WORK_GROUP_TITLES.includes(g.title.toLowerCase()),
  )
  if (workGroups.length === 0) return []

  const groupIds = workGroups.map((g) => g.id)

  const data = await query<RawWorkData>(
    `
    query($boardId: ID!, $groupIds: [String!]!) {
      boards(ids: [$boardId]) {
        columns { id title }
        groups(ids: $groupIds) {
          title
          items_page(limit: 100) {
            items {
              id
              name
              column_values { id text }
              subitems { id name }
            }
          }
        }
      }
    }
    `,
    { boardId, groupIds },
  )

  const board = data.boards[0]
  if (!board) return []

  // Build columnId → lowercase title map from board column definitions
  const colTitles = new Map(board.columns.map((c) => [c.id, c.title.toLowerCase()]))

  const items: WorkItem[] = []

  for (const group of board.groups) {
    for (const raw of group.items_page.items) {
      // Map column title → text value for this item
      const colMap = new Map(
        raw.column_values.map((cv) => [colTitles.get(cv.id) ?? cv.id, cv.text]),
      )

      items.push({
        id: raw.id,
        name: raw.name,
        group: group.title,
        targetDate: findCol(colMap, ['target date', 'target']),
        plannedDate: findCol(colMap, ['planned date', 'planned', 'plan date']),
        effort: findCol(colMap, ['effort', 'hours', 'estimated hours']),
        subitems: raw.subitems.slice(0, 5).map((s) => s.name),
      })
    }
  }

  return items
}
