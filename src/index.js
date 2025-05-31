// src/index.js
import { WhatsAppBot } from "./core/bot.js"
import { WebServer } from "./core/server.js"
import { RavehubDatabase } from "./core/database.js"
import { PluginManager } from "./core/plugin-manager.js"
import eventEmitter from "./core/event-emitter.js"
import dotenv from "dotenv"

dotenv.config() // Load .env file

const APP_CONFIG = {
  port: process.env.PORT || 3000,
  clientId: process.env.WA_CLIENT_ID || "ravehub-bot-plugin",
  adminNumber: process.env.ADMIN_NUMBER || "",
  puppeteerArgs: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-zygote",
    "--disable-gpu",
  ],
}

const context = {
  db: null,
  config: APP_CONFIG,
  eventEmitter,
  pluginManager: null,
  client: null,
  whatsAppBot: null,
  app: null,
  webServer: null,
}

let isShuttingDown = false

async function main() {
  console.log("🚀 Iniciando RaveHub Bot (Plugin System)...")
  try {
    context.db = new RavehubDatabase()
    context.pluginManager = new PluginManager(context)
    context.whatsAppBot = new WhatsAppBot(context.pluginManager, APP_CONFIG)
    context.client = context.whatsAppBot.client
    context.webServer = new WebServer(APP_CONFIG.port, context)
    context.app = context.webServer.app

    await context.webServer.start()
    await context.pluginManager.loadPlugins()
    await context.whatsAppBot.initializeClient()

    console.log("✅ RaveHub Bot (Plugin System) completamente iniciado y listo!")
    if (APP_CONFIG.adminNumber) {
      console.log(`👑 Número de admin configurado: ${APP_CONFIG.adminNumber}`)
    } else {
      console.warn("⚠️ ADMIN_NUMBER no está configurado en .env. Algunas funciones de admin pueden no notificar.")
    }

    if (process.send) {
      process.send("ready")
      console.log("🚀 Sent 'ready' signal to PM2.")
    }
  } catch (error) {
    console.error("❌ Error fatal durante el inicio:", error)
    await shutdown("startup_error")
    process.exit(1) // Ensure process exits if main fails
  }
}

async function shutdown(reason = "unknown") {
  if (isShuttingDown) {
    console.log("🔄 Apagado ya en progreso...")
    return
  }
  isShuttingDown = true
  console.log(`🛑 Iniciando apagado del sistema (Razón: ${reason})...`)

  const shutdownGracePeriod = reason === "uncaughtException" || reason === "unhandledRejection" ? 500 : 2000
  await new Promise((resolve) => setTimeout(resolve, shutdownGracePeriod))

  const operations = [
    { name: "Plugins", op: () => context.pluginManager?.shutdownPlugins() },
    { name: "WhatsApp Bot", op: () => context.whatsAppBot?.shutdown() },
    { name: "Web Server", op: () => context.webServer?.stop() },
    { name: "Database", op: () => context.db?.close() },
  ]

  for (const { name, op } of operations) {
    try {
      if (op) await op()
    } catch (e) {
      console.error(`Error durante el apagado de ${name}:`, e)
    }
  }

  console.log("🛑 Sistema apagado.")
  isShuttingDown = false // Reset flag in case of restart attempts by PM2 without full process exit
}
// Graceful shutdown handlers
;["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    console.log(`${signal} recibido, iniciando apagado...`)
    await shutdown(signal)
    process.exit(0) // Exit after shutdown for these signals
  })
})

process.on("uncaughtException", async (error, origin) => {
  console.error(`💥 Uncaught Exception at: ${origin}`, error)
  await shutdown("uncaughtException")
  process.exit(1)
})

process.on("unhandledRejection", async (reason, promise) => {
  console.error("🚫 Unhandled Rejection at:", promise, "reason:", reason)
  await shutdown("unhandledRejection")
  process.exit(1)
})

main().catch(async (error) => {
  // Catch errors from main() itself if it's not caught internally
  console.error("❌ Error no capturado en la función main:", error)
  await shutdown("main_function_error")
  process.exit(1)
})
