import { supabase } from './supabase'

export async function getInsightsForProducts(productIds = []) {
  if (!productIds || productIds.length === 0) return []
  try {
    const { data, error } = await supabase.from('product_insights').select('*').in('product_id', productIds).order('fetched_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Error fetching product insights', err)
    return []
  }
}

export async function getInsight(productId) {
  if (!productId) return null
  try {
    const { data, error } = await supabase.from('product_insights').select('*').eq('product_id', productId).limit(1).single()
    if (error) {
      // if not found returns error; return null
      return null
    }
    return data
  } catch (err) {
    console.error('Error fetching single product insight', err)
    return null
  }
}
