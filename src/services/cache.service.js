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
  try {
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
  } catch (err) {
    // Handle storage quota exceeded errors
    if (err.name === 'QuotaExceededError' || err.message.includes('FILE_ERROR_NO_SPACE')) {
      console.warn('Storage quota exceeded, clearing cache to free space')
      try {
        await clearAll()
        // Retry the operation
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
      } catch (clearErr) {
        throw new Error('Unable to free up space: ' + clearErr.message)
      }
    }
    throw err
  }
}

export class CacheService {
  constructor() {
    this.defaultTTL = 2 * 60 * 1000 // Reduced from 5 minutes to 2 minutes
  }

  async set(key, data, meta = {}) {
    try {
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
    } catch (err) {
      console.warn('Cache set failed:', err)
      // Return the payload even if caching fails
      return {
        key,
        data,
        meta: {
          storedAt: Date.now(),
          lastSync: Date.now(),
          ...meta,
        },
      }
    }
  }

  async get(key) {
    try {
      return withStore('readonly', (store) => {
        return new Promise((resolve, reject) => {
          const req = store.get(key)
          req.onsuccess = () => resolve(req.result ? req.result.data : null)
          req.onerror = () => reject(req.error)
        })
      })
    } catch (err) {
      console.warn('Cache get failed:', err)
      return null
    }
  }

  async getRaw(key) {
    try {
      return withStore('readonly', (store) => {
        return new Promise((resolve, reject) => {
          const req = store.get(key)
          req.onsuccess = () => resolve(req.result || null)
          req.onerror = () => reject(req.error)
        })
      })
    } catch (err) {
      console.warn('Cache getRaw failed:', err)
      return null
    }
  }

  async clear(key) {
    try {
      return withStore('readwrite', (store) => store.delete(key))
    } catch (err) {
      console.warn('Cache clear failed:', err)
      return null
    }
  }

  async clearAll() {
    try {
      return withStore('readwrite', (store) => store.clear())
    } catch (err) {
      console.warn('Cache clearAll failed:', err)
      return null
    }
  }

  async isStale(key, ttlMs = this.defaultTTL) {
    try {
      const raw = await this.getRaw(key)
      if (!raw || !raw.meta || !raw.meta.lastSync) return true
      return Date.now() - raw.meta.lastSync > ttlMs
    } catch (err) {
      console.warn('Cache isStale check failed:', err)
      return true
    }
  }

  async getLastSyncTime(key) {
    try {
      const raw = await this.getRaw(key)
      if (!raw || !raw.meta) return null
      return raw.meta.lastSync
    } catch (err) {
      console.warn('Cache getLastSyncTime failed:', err)
      return null
    }
  }
}

// export singleton
export const cacheService = new CacheService()