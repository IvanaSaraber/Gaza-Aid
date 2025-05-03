// pages/api/campaigns.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate') // ✅ CDN cache enabled for 60s

  if (req.method !== 'GET') {
    return res.status(405).end() // Method Not Allowed
  }

  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  const tableName = 'MainTable'

  if (!apiKey || !baseId) {
    return res.status(500).json({ error: 'Missing Airtable config in environment variables.' })
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${tableName}`
  let allRecords = []
  let offset = null

  // Server-side filters via query (e.g., /api/campaigns?weeskind=true&status=Actief)
  const filters = []
  if (req.query.weeskind === 'true') filters.push(`{Weeskind}=TRUE()`)
  if (req.query.status) filters.push(`{Status}='${req.query.status}'`)

  const filterFormula = filters.length > 0 ? `?filterByFormula=AND(${filters.join(',')})` : ''

  try {
    do {
      const url = `${baseUrl}${offset ? (filterFormula ? filterFormula + `&offset=${offset}` : `?offset=${offset}`) : filterFormula}`

      const airtableRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await airtableRes.json()

      if (!airtableRes.ok) {
        return res.status(airtableRes.status).json({ error: data })
      }

      allRecords = allRecords.concat(data.records)
      offset = data.offset
    } while (offset)

    return res.status(200).json({ records: allRecords })
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error.toString() })
  }
}
