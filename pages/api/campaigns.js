// pages/api/campaigns.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'GET') {
    return res.status(405).end(); // Method Not Allowed
  }
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  const tableName = 'MainTable' // pas aan als je tabel anders heet

  if (!apiKey || !baseId) {
    return res.status(500).json({ error: 'Missing Airtable config in environment variables.' })
  }

  const url = `https://api.airtable.com/v0/${baseId}/${tableName}`

  try {
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

    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error.toString() })
  }
}
