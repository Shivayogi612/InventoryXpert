import { fetchWithAuth } from './http.service'

const API_BASE = '/api' // adjust if your deployment uses a different prefix

export async function getProductDemandInsight(productId) {
  const url = `${API_BASE}/geminiDemandInsight?product_id=${encodeURIComponent(productId)}`
  const res = await fetchWithAuth(url)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Demand insight request failed: ${res.status} ${text}`)
  }
  return res.json()
}
