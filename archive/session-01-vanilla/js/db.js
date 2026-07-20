/**
 * db.js — IndexedDB wrapper for Cyber Focus Coach
 * Handles all persistent storage (sessions, logs, streaks, roadmap, quizzes)
 */

const DB_NAME = 'CyberFocusCoach';
const DB_VERSION = 1;

const STORES = {
  users:           { keyPath: 'id' },
  roadmap_topics:  { keyPath: 'id' },
  study_sessions:  { keyPath: 'id' },
  focus_events:    { keyPath: 'id' },
  session_artifacts:{ keyPath: 'id' },
  daily_logs:      { keyPath: 'id' },
  streaks:         { keyPath: 'id' },
  quizzes:         { keyPath: 'id' },
  quiz_attempts:   { keyPath: 'id' },
  settings:        { keyPath: 'id' },
};

const CFC_DB = {
  db: null,

  open() {
    return new Promise((resolve, reject) => {
      if (this.db) { resolve(this.db); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        for (const [name, opts] of Object.entries(STORES)) {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, opts);
            // Indexes for common lookups
            if (name === 'study_sessions') {
              store.createIndex('by_user', 'user_id', { unique: false });
              store.createIndex('by_date', 'start_time', { unique: false });
            }
            if (name === 'focus_events') {
              store.createIndex('by_session', 'session_id', { unique: false });
            }
            if (name === 'daily_logs') {
              store.createIndex('by_date', 'log_date', { unique: false });
              store.createIndex('by_user', 'user_id', { unique: false });
            }
            if (name === 'quiz_attempts') {
              store.createIndex('by_user', 'user_id', { unique: false });
              store.createIndex('by_quiz', 'quiz_id', { unique: false });
            }
            if (name === 'quizzes') {
              store.createIndex('by_topic', 'topic_id', { unique: false });
            }
          }
        }
      };

      req.onsuccess = (e) => { this.db = e.target.result; resolve(this.db); };
      req.onerror  = (e) => reject(e.target.error);
    });
  },

  async tx(storeName, mode = 'readonly') {
    const db = await this.open();
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  },

  wrap(req) {
    return new Promise((res, rej) => {
      req.onsuccess = (e) => res(e.target.result);
      req.onerror   = (e) => rej(e.target.error);
    });
  },

  async get(store, id) {
    const s = await this.tx(store);
    return this.wrap(s.get(id));
  },

  async getAll(store) {
    const s = await this.tx(store);
    return this.wrap(s.getAll());
  },

  async getByIndex(store, indexName, value) {
    const s = await this.tx(store);
    const idx = s.index(indexName);
    return this.wrap(idx.getAll(value));
  },

  async put(store, data) {
    const s = await this.tx(store, 'readwrite');
    return this.wrap(s.put(data));
  },

  async delete(store, id) {
    const s = await this.tx(store, 'readwrite');
    return this.wrap(s.delete(id));
  },

  async clear(store) {
    const s = await this.tx(store, 'readwrite');
    return this.wrap(s.clear());
  },

  uid() {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
  },

  /** Check if any data exists in the db (used to detect first launch) */
  async isFirstLaunch() {
    const users = await this.getAll('users');
    return users.length === 0;
  },
};

window.CFC_DB = CFC_DB;
