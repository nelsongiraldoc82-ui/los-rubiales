// Cliente HTTP para Turso - sin dependencias nativas
const getHttpUrl = (libsqlUrl: string) => {
  return libsqlUrl.replace('libsql://', 'https://')
}

interface TursoResult {
  columns?: string[]
  rows?: Array<Array<{ type: string; value: string }>>
}

interface TursoResponse {
  results?: Array<{
    type: string
    response?: {
      result?: TursoResult
    }
  }>
}

export async function tursoExecute(
  sql: string,
  args: (string | number | null)[] = []
): Promise<TursoResult | null> {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    throw new Error('TURSO_DATABASE_URL y TURSO_AUTH_TOKEN deben estar configurados')
  }

  const httpUrl = getHttpUrl(tursoUrl)

  const response = await fetch(`${httpUrl}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tursoToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql: sql,
            args: args.map(arg => {
              if (arg === null) return { type: 'null' }
              if (typeof arg === 'number') return { type: 'integer', value: String(arg) }
              return { type: 'text', value: String(arg) }
            })
          }
        },
        { type: 'close' }
      ]
    })
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Turso error ${response.status}: ${text}`)
  }

  const data: TursoResponse = await response.json()
  return data.results?.[0]?.response?.result || null
}

export function parseTursoRows(result: TursoResult | null): Record<string, unknown>[] {
  if (!result?.columns || !result?.rows) return []
  
  return result.rows.map(row => {
    const obj: Record<string, unknown> = {}
    result.columns!.forEach((col, i) => {
      obj[col] = row[i]?.value || null
    })
    return obj
  })
}
