// CacheService: IndexedDB-backed cache abstraction. Never use localStorage/sessionStorage directly.
// Provides set/get/clear/clearAll/isStale/getLastSyncTime

const DB_NAME = 'smart-inventory-cache'
const STORE_NAME = 'cache'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' })
        store.createIndex('by_key', 'key', { unique: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function withStore(mode, callback) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode)
    const store = tx.objectStore(STORE_NAME)
    let result
    try {
      result = callback(store)
    } catch (err) {
      reject(err)
    }
    tx.oncomplete = () => resolve(result)
    tx.onerror = () => reject(tx.error)
  })
}

export class CacheService {
  constructor() {
    this.defaultTTL = 5 * 60 * 1000 // 5 minutes
  }

  async set(key, data, meta = {}) {
    const payload = {
      key,
      data,
      meta: {
        storedAt: Date.now(),
        lastSync: Date.now(),
        ...meta,
      },
    }
    await withStore('readwrite', (store) => store.put(payload))
    return payload
  }

  async get(key) {
    return withStore('readonly', (store) => {
      return new Promise((resolve, reject) => {
        const req = store.get(key)
        req.onsuccess = () => resolve(req.result ? req.result.data : null)
        req.onerror = () => reject(req.error)
      })
    })
  }

  async getRaw(key) {
    return withStore('readonly', (store) => {
      return new Promise((resolve, reject) => {
        const req = store.get(key)
        req.onsuccess = () => resolve(req.result || null)
        req.onerror = () => reject(req.error)
      })
    })
  }

  async clear(key) {
    return withStore('readwrite', (store) => store.delete(key))
  }

  async clearAll() {
    return withStore('readwrite', (store) => store.clear())
  }

  async isStale(key, ttlMs = this.defaultTTL) {
    const raw = await this.getRaw(key)
    if (!raw || !raw.meta || !raw.meta.lastSync) return true
    return Date.now() - raw.meta.lastSync > ttlMs
  }

  async getLastSyncTime(key) {
    const raw = await this.getRaw(key)
    if (!raw || !raw.meta) return null
    return raw.meta.lastSync
  }
}

// export singleton
export const cacheService = new CacheService()
