/*
  Supabase Edge Function (or serverless endpoint) template: geminiDemandInsight

  This function expects a query or JSON body with { product_id }
  It aggregates the product's sales history (last 6 months), builds a compact
  internal summary, calls a configured LLM endpoint (Gemini/Generative API)
  and returns structured JSON:

  {
    trend_label: 'up'|'flat'|'down',
    recommendation: 'aggressive_buy'|'normal_buy'|'cautious_buy'|'avoid_overstock',
    summary: '...',
    stock_advice: '...',
    risk_factors: ['...'],
    suggested_actions: ['...'],
    internal: { total_sold, avg_weekly, current_stock, reorder_level }
  }

  Deployment notes:
  - Deploy as a Supabase Edge Function or any serverless endpoint.
  - Provide the following env vars to the function runtime:
    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (for server access),
    LLM_API_URL, LLM_API_KEY
  - For Google Gemini, set LLM_API_URL to the appropriate Generative API endpoint
    and LLM_API_KEY to the Google Cloud API key or use OAuth.

  This file is a template — you can deploy it as a Supabase Edge Function
  by copying into your Supabase functions folder and configuring environment variables.
*/

import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const LLM_API_URL = process.env.LLM_API_URL
const LLM_API_KEY = process.env.LLM_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. This function requires server-side keys.')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function buildPrompt(internal) {
  // Build a compact prompt that separates internal data and asks for structured JSON
  const prompt = `INTERNAL DATA:\n${JSON.stringify(internal)}\n\n\
You are a retail expert. Based on the INTERNAL DATA above (which is from a single physical store),\
and considering general market signals, answer concisely in JSON with the following keys:\n\
trend_label: one of \"up\" | \"flat\" | \"down\"\n\
recommendation: one of \"aggressive_buy\" | \"normal_buy\" | \"cautious_buy\" | \"avoid_overstock\"\n\
summary: 1-2 sentence human-readable summary\n\
stock_advice: one short actionable sentence (e.g., \"Increase stock by 20-30% vs last month\")\n\
risk_factors: array of up to 3 short strings\n\
suggested_actions: array of 2-3 short action items\n\
Only emit valid JSON object. Do NOT include extra commentary outside the JSON.\n`;
  return prompt
}

async function callLLM(prompt) {
  if (!LLM_API_URL || !LLM_API_KEY) {
    throw new Error('LLM_API_URL or LLM_API_KEY not configured')
  }

  // If the URL looks like Google's Generative API, send the v1beta2/text-bison-style body and use key param.
  try {
    const isGoogle = LLM_API_URL.includes('generative.googleapis.com')
    let url = LLM_API_URL
    const headers = { 'Content-Type': 'application/json' }

    if (isGoogle) {
      // append key if not present
      if (!url.includes('?') || !url.includes('key=')) {
        url = url + (url.includes('?') ? '&' : '?') + `key=${encodeURIComponent(LLM_API_KEY)}`
      }

      const body = {
        prompt: { text: prompt },
        temperature: 0.2,
        maxOutputTokens: 400,
      }

      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`LLM call failed: ${res.status} ${text}`)
      }
      const json = await res.json()
      // Google Generative API v1beta2: response.candidates[0].output or .candidates[0].content
      const content = (json.candidates && json.candidates[0] && (json.candidates[0].output || json.candidates[0].content)) || JSON.stringify(json)
      return content
    }

    // Fallback: generic POST with Bearer token
    const res = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: Object.assign(headers, { Authorization: `Bearer ${LLM_API_KEY}` }),
      body: JSON.stringify({ prompt, max_tokens: 400, temperature: 0.2 }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`LLM call failed: ${res.status} ${text}`)
    }

    const json = await res.json()
    const content = (json.output && json.output[0] && json.output[0].content) || (json.choices && json.choices[0] && (json.choices[0].message?.content || json.choices[0].text)) || JSON.stringify(json)
    return content
  } catch (err) {
    throw err
  }
}

export default async function handler(req, res) {
  try {
    const product_id = req.method === 'GET' ? req.query.product_id : req.body.product_id
    if (!product_id) return res.status(400).json({ error: 'product_id is required' })

    // Fetch product metadata
    const { data: product, error: pErr } = await supabase.from('products').select('*').eq('id', product_id).single()
    if (pErr) throw pErr
    if (!product) return res.status(404).json({ error: 'product not found' })

    // Aggregate transactions: last 180 days
    const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
    const { data: txns, error: tErr } = await supabase.from('transactions').select('created_at,quantity,type').eq('product_id', product_id).gte('created_at', cutoff).order('created_at', { ascending: true })
    if (tErr) throw tErr

    // Aggregate daily sales (out transactions)
    const daily = {}
    for (const t of txns || []) {
      if (!t || t.type !== 'out') continue
      const day = (new Date(t.created_at)).toISOString().slice(0,10)
      daily[day] = (daily[day] || 0) + Math.abs(Number(t.quantity) || 0)
    }

    // Fill last 180 days with zeros where missing and compute totals
    const dates = []
    const now = new Date()
    for (let i = 179; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      dates.push(d.toISOString().slice(0,10))
    }
    const series = dates.map((d) => ({ date: d, sold: daily[d] || 0 }))
    const total_sold = series.reduce((s, x) => s + x.sold, 0)
    const avg_daily = total_sold / 180
    const avg_weekly = avg_daily * 7

    // Simple trend: compare last 30 days avg vs previous 30 days
    const last30 = series.slice(-30)
    const prev30 = series.slice(-60, -30)
    const avgLast30 = last30.reduce((s, x) => s + x.sold, 0) / (last30.length || 1)
    const avgPrev30 = prev30.reduce((s, x) => s + x.sold, 0) / (prev30.length || 1)
    let trend = 'flat'
    if (avgLast30 > avgPrev30 * 1.1) trend = 'up'
    else if (avgLast30 < avgPrev30 * 0.9) trend = 'down'

    const internal = {
      product_id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      brand: product.brand,
      total_sold: Math.round(total_sold),
      avg_weekly: Math.round(avg_weekly),
      trend_internal: trend,
      current_stock: Number(product.quantity || 0),
      reorder_level: Number(product.reorder_level || 0),
      period_days: 180,
      // include recent series for charting (last 90 days and last 30 days)
      series_last_90: series.slice(-90),
      series_last_30: series.slice(-30),
      series_all_180: series,
    }

    // Build prompt and call LLM
    const prompt = buildPrompt(internal)
    let llmContent = null
    try {
      llmContent = await callLLM(prompt)
    } catch (err) {
      console.error('LLM call failed', err)
    }

    // Parse LLM JSON (if available)
    let ai = null
    if (llmContent) {
      // attempt to extract JSON substring
      const text = typeof llmContent === 'string' ? llmContent : JSON.stringify(llmContent)
      const firstBrace = text.indexOf('{')
      if (firstBrace >= 0) {
        const jsonText = text.slice(firstBrace)
        try {
          ai = JSON.parse(jsonText)
        } catch (err) {
          console.warn('Failed to parse LLM JSON, returning raw text')
          ai = { raw: text }
        }
      } else {
        ai = { raw: text }
      }
    }

    // Persist AI output into product_insights table when structured JSON is available
    try {
      if (ai && (ai.trend_label || ai.recommendation || ai.summary)) {
        const upsertRow = {
          product_id,
          trend_label: ai.trend_label || null,
          recommendation: ai.recommendation || null,
          summary: ai.summary || null,
          stock_advice: ai.stock_advice || null,
          risk_factors: ai.risk_factors || null,
          suggested_actions: ai.suggested_actions || null,
          ai_raw: ai.raw ? ai.raw : ai,
          fetched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        try {
          await supabase.from('product_insights').upsert([upsertRow], { onConflict: 'product_id', returning: 'minimal' })
        } catch (persistErr) {
          console.warn('Failed to persist product_insights', persistErr?.message || persistErr)
        }
      }
    } catch (persistErr) {
      console.warn('product_insights persistence error', persistErr)
    }

    const out = { internal, ai }
    return res.status(200).json(out)
  } catch (err) {
    console.error('geminiDemandInsight error', err)
    return res.status(500).json({ error: err.message || String(err) })
  }
}
