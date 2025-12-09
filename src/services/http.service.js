export async function fetchWithAuth(url, opts = {}) {
  const headers = Object.assign({}, opts.headers || {}, { 'Content-Type': 'application/json' })
  const response = await fetch(url, Object.assign({}, opts, { credentials: 'same-origin', headers }))
  return response
}
