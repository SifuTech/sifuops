const MONDAY_API = 'https://api.monday.com/v2'

async function query<T>(gql: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(MONDAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.MONDAY_API_KEY!,
    },
    body: JSON.stringify({ query: gql, variables }),
  })
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
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
