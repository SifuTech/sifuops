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

type Group = { id: string; title: string }
type Board = { id: string; name: string; groups: Group[] }

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

type Item = { id: string; name: string }

export async function getGroupItems(boardId: string, groupId: string): Promise<Item[]> {
  const data = await query<{ boards: { groups: { items_page: { items: Item[] } }[] }[] }>(
    `
    query($boardId: ID!, $groupId: String!) {
      boards(ids: [$boardId]) {
        groups(ids: [$groupId]) {
          items_page(limit: 20) {
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
