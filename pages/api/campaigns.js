// pages/api/campaigns.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  const tableName = 'MainTable'

  const url = `https://api.airtable.com/v0/${baseId}/${tableName}`

  try {
    const airtableRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    })

    if (!airtableRes.ok) {
      const error = await airtableRes.text()
      return res.status(airtableRes.status).json({ error })
    }

    const data = await airtableRes.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong', details: error })
  }
}
