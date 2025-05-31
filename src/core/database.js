// src/core/database.js
import Database from "better-sqlite3"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class RavehubDatabase {
  constructor(dbPath = path.join(__dirname, "..", "..", "ravehub.db")) {
    console.log(`💾 Initializing database at: ${dbPath}`)
    this.db = new Database(dbPath)
    this.db.pragma("journal_mode = WAL")
    this.db.pragma("synchronous = NORMAL")
    this.db.pragma("cache_size = 1000")
    this.db.pragma("temp_store = memory")
    this.db.pragma("foreign_keys = ON") // Ensure foreign key constraints are enforced
    this.initSchema()
  }

  initSchema() {
    try {
      console.log("🔧 Ensuring database schema exists...")

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          ravecoins INTEGER DEFAULT 0,
          bank_balance INTEGER DEFAULT 0,
          level INTEGER DEFAULT 1,
          experience INTEGER DEFAULT 0,
          is_admin INTEGER DEFAULT 0,
          is_police INTEGER DEFAULT 0, -- Future use
          reputation INTEGER DEFAULT 100,
          total_earned INTEGER DEFAULT 0,
          total_stolen INTEGER DEFAULT 0,
          times_robbed INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_active DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          command TEXT UNIQUE NOT NULL,
          salary_min INTEGER NOT NULL,
          salary_max INTEGER NOT NULL,
          duration INTEGER NOT NULL, -- minutes
          experience_reward INTEGER DEFAULT 10,
          level_required INTEGER DEFAULT 1,
          description TEXT,
          emoji TEXT DEFAULT '💼'
        )
      `)

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS active_works (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          job_name TEXT NOT NULL,
          salary INTEGER NOT NULL,
          experience INTEGER NOT NULL,
          start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          end_time DATETIME NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `)

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS bank_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          from_user TEXT, -- Can be NULL for system transactions like loans/fines
          to_user TEXT,   -- Can be NULL for system transactions like fines
          amount INTEGER NOT NULL,
          type TEXT NOT NULL, -- 'deposit', 'withdraw', 'transfer', 'gift', 'loan', 'loan_repayment', 'robbery_victim', 'robbery_success', 'fine', 'admin_gift', 'admin_confiscate'
          description TEXT,
          status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'rejected'
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (from_user) REFERENCES users (id) ON DELETE SET NULL,
          FOREIGN KEY (to_user) REFERENCES users (id) ON DELETE SET NULL
        )
      `)

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS loans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          borrower_id TEXT NOT NULL,
          amount INTEGER NOT NULL,
          interest_rate REAL DEFAULT 0.1, -- Example: 0.1 for 10%
          amount_to_repay INTEGER NOT NULL,
          due_date DATETIME NOT NULL,
          status TEXT DEFAULT 'active', -- 'active', 'paid', 'defaulted'
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          paid_at DATETIME,
          FOREIGN KEY (borrower_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `)

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS work_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          job_name TEXT NOT NULL,
          salary_earned INTEGER NOT NULL,
          experience_gained INTEGER NOT NULL,
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `)

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS system_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_type TEXT NOT NULL, -- 'robbery_success', 'robbery_failed', 'fine_paid', 'system_reward', 'admin_action'
          user_id TEXT, -- User performing action or affected
          target_id TEXT, -- Target of action, if any
          amount INTEGER DEFAULT 0,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
          FOREIGN KEY (target_id) REFERENCES users (id) ON DELETE SET NULL
        )
      `)

      this.insertDefaultJobs()
      console.log("✅ Database schema verified/created.")
    } catch (error) {
      console.error("❌ Error initializing database schema:", error)
      throw error // Propagate error to stop initialization if DB schema fails
    }
  }

  insertDefaultJobs() {
    const jobs = [
      {
        name: "DJ de Rave",
        command: "dj",
        salary_min: 100,
        salary_max: 200,
        duration: 30,
        experience_reward: 25,
        level_required: 1,
        description: "Mezcla música en eventos electrónicos",
        emoji: "🎧",
      },
      {
        name: "Seguridad VIP",
        command: "security",
        salary_min: 80,
        salary_max: 150,
        duration: 45,
        experience_reward: 20,
        level_required: 2,
        description: "Protege a los VIPs en eventos",
        emoji: "🛡️",
      },
      {
        name: "Promoter de Eventos",
        command: "promoter",
        salary_min: 60,
        salary_max: 120,
        duration: 25,
        experience_reward: 15,
        level_required: 1,
        description: "Promociona fiestas y eventos",
        emoji: "📢",
      },
      {
        name: "Dealer Exclusivo",
        command: "dealer",
        salary_min: 150,
        salary_max: 300,
        duration: 60,
        experience_reward: 35,
        level_required: 3,
        description: "Actividades del mercado negro 😏",
        emoji: "💊",
      },
      {
        name: "Bartender Premium",
        command: "bartender",
        salary_min: 50,
        salary_max: 100,
        duration: 20,
        experience_reward: 12,
        level_required: 1,
        description: "Prepara bebidas exclusivas",
        emoji: "🍹",
      },
      {
        name: "Organizador de Afterparty",
        command: "organizer",
        salary_min: 120,
        salary_max: 250,
        duration: 90,
        experience_reward: 40,
        level_required: 4,
        description: "Organiza las mejores afterparties",
        emoji: "🎉",
      },
    ]
    const insertJob = this.db.prepare(`
      INSERT OR IGNORE INTO jobs (name, command, salary_min, salary_max, duration, experience_reward, level_required, description, emoji)
      VALUES (@name, @command, @salary_min, @salary_max, @duration, @experience_reward, @level_required, @description, @emoji)
    `)

    const jobCount = this.db.get("SELECT COUNT(*) as count FROM jobs")?.count || 0
    if (jobCount < jobs.length) {
      // Only run transaction if new jobs might be added
      const insertMany = this.db.transaction((jobList) => {
        for (const job of jobList) insertJob.run(job)
      })
      try {
        insertMany(jobs)
        console.log(
          `ℹ️ ${jobs.length - jobCount} new default jobs inserted. Total jobs: ${this.db.get("SELECT COUNT(*) as count FROM jobs").count}.`,
        )
      } catch (error) {
        console.warn(
          "⚠️ Error inserting default jobs (might be a conflict not handled by OR IGNORE, or other DB issue):",
          error.message,
        )
      }
    } else {
      console.log("ℹ️ Default jobs already seem to exist, skipping insertion.")
    }
  }

  // Centralized query methods for better error handling and potential logging
  run(sql, params) {
    try {
      return this.db.prepare(sql).run(params)
    } catch (error) {
      console.error(`DB Error (run) - SQL: ${sql} - Params: ${JSON.stringify(params)}`, error)
      throw error // Re-throw to be handled by the caller
    }
  }

  get(sql, params) {
    try {
      return this.db.prepare(sql).get(params)
    } catch (error) {
      console.error(`DB Error (get) - SQL: ${sql} - Params: ${JSON.stringify(params)}`, error)
      throw error
    }
  }

  all(sql, params) {
    try {
      return this.db.prepare(sql).all(params)
    } catch (error) {
      console.error(`DB Error (all) - SQL: ${sql} - Params: ${JSON.stringify(params)}`, error)
      throw error
    }
  }

  // Transaction helper
  transaction(fn) {
    return this.db.transaction(fn)
  }

  close() {
    if (this.db && this.db.open) {
      this.db.close((err) => {
        if (err) {
          console.error("❌ Error closing the database connection:", err.message)
        } else {
          console.log("📁 Database connection closed successfully.")
        }
      })
    }
  }
}
