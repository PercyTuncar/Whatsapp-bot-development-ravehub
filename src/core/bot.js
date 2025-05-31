// src/core/bot.js
import pkg from "whatsapp-web.js"
const { Client, LocalAuth } = pkg
import qrcode from "qrcode" // For generating QR as data URL for web
import qrcodeTerminal from "qrcode-terminal" // For terminal QR

export class WhatsAppBot {
  constructor(pluginManager, config) {
    this.pluginManager = pluginManager
    this.config = config // { puppeteerArgs, clientId, adminNumber }
    this.qrCodeDataUrl = null
    this.isReady = false

    const puppeteerOptions = {
      headless: true,
      args: this.config.puppeteerArgs || [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        // '--single-process', // May cause issues, use with caution
        "--disable-gpu",
      ],
    }
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      puppeteerOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
    }

    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: this.config.clientId || "ravehub-bot" }),
      puppeteer: puppeteerOptions,
      webVersionCache: {
        type: "remote",
        remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
      },
    })

    this.initializeEventHandlers()
  }

  initializeEventHandlers() {
    this.client.on("qr", async (qr) => {
      console.log("🔗 Escanea este QR con tu WhatsApp:")
      qrcodeTerminal.generate(qr, { small: true })
      try {
        this.qrCodeDataUrl = await qrcode.toDataURL(qr)
      } catch (err) {
        console.error("Error generating QR data URL:", err)
        this.qrCodeDataUrl = null
      }
      this.pluginManager.context.eventEmitter.emit("qr_updated", this.qrCodeDataUrl)
    })

    this.client.on("ready", () => {
      this.isReady = true
      this.qrCodeDataUrl = null // QR no longer needed
      console.log("✅ Bot de WhatsApp conectado y listo!")
      this.pluginManager.context.eventEmitter.emit("bot_ready")
      if (this.config.adminNumber) {
        const adminChatId = `${this.config.adminNumber}@c.us`
        this.client.sendMessage(adminChatId, "🤖 *RaveHub Bot (Plugin System)* está *online*!").catch((err) => {
          console.warn(`Could not send online message to admin ${this.config.adminNumber}: ${err.message}`)
        })
      }
    })

    this.client.on("message", async (message) => {
      // Pass message to PluginManager for handling
      await this.pluginManager.handleMessage(message)
    })

    this.client.on("authenticated", () => {
      console.log("🔐 Autenticación exitosa.")
      this.qrCodeDataUrl = null // Clear QR on auth
    })

    this.client.on("auth_failure", (msg) => {
      console.error("❌ Error de autenticación:", msg)
      this.isReady = false
      // Potentially trigger a restart or alert
      this.pluginManager.context.eventEmitter.emit("auth_failure")
    })

    this.client.on("disconnected", (reason) => {
      console.warn("🔌 Bot desconectado:", reason)
      this.isReady = false
      this.pluginManager.context.eventEmitter.emit("bot_disconnected", reason)
      // Consider implementing reconnection logic or notifying admin
    })

    this.client.on("loading_screen", (percent, message) => {
      console.log(`🔄 Cargando WhatsApp Web: ${percent}% - ${message}`)
    })
  }

  async initializeClient() {
    console.log("🚀 Inicializando cliente de WhatsApp...")
    try {
      await this.client.initialize()
    } catch (error) {
      console.error("❌ Error fatal inicializando cliente de WhatsApp:", error)
      throw error // Rethrow to be handled by the main application
    }
  }

  getQrCodeDataUrl() {
    return this.qrCodeDataUrl
  }

  getClientStatus() {
    return {
      isReady: this.isReady,
      qrCodeAvailable: !!this.qrCodeDataUrl,
      clientInfo: this.client.info, // May be null if not ready
    }
  }

  async shutdown() {
    console.log("🔌 Desconectando cliente de WhatsApp...")
    if (this.client) {
      await this.client.destroy().catch((err) => console.error("Error destroying client:", err)) // Destroy client session
    }
    this.isReady = false
    console.log("🔌 Cliente de WhatsApp desconectado.")
  }
}
