const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("baileys")
const pino = require("pino")
const { Boom } = require("@hapi/boom")
const fs = require("fs-extra")
const path = require("path")
const { SESSION_ID, PREFIX } = require("../config")
const qrcode = require("qrcode-terminal")
const { loadPlugins } = require("./plugins")
const { initDatabase } = require("./database")

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
})

class Client {
  constructor() {
    this.commands = []
    this.sessionDir = path.join(__dirname, "../sessions", SESSION_ID)
    this.pluginsCount = 0
    this.PREFIX = PREFIX
    this.VERSION = require("../package.json").version
    this.state = null
    this.saveCreds = null
  }

  async connect() {
    try {
      // Asegurar que el directorio de sesiones existe
      await fs.ensureDir(this.sessionDir)

      // Configurar autenticación
      const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir)
      this.state = state
      this.saveCreds = saveCreds
      const { version } = await fetchLatestBaileysVersion()

      // Inicializar base de datos
      await initDatabase()
      logger.info("✅ Base de datos inicializada")

      // Cargar plugins
      this.commands = await loadPlugins()
      this.pluginsCount = this.commands.length
      logger.info(`📦 ${this.pluginsCount} plugins cargados`)

      // Crear socket de WhatsApp
      const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: this.state,
        browser: ["Ravehub Bot", "Chrome", "1.0.0"],
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
          return { conversation: "hello" }
        },
      })

      // Eventos de conexión
      sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update

        if (connection === "close") {
          const shouldReconnect =
            lastDisconnect?.error instanceof Boom &&
            lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut

          logger.info("❌ Conexión cerrada. Reconectando:", shouldReconnect)

          if (shouldReconnect) {
            setTimeout(() => this.connect(), 5000)
          } else {
            logger.info("🔒 Sesión cerrada. Elimina la carpeta de sesión y vuelve a escanear.")
          }
        } else if (connection === "open") {
          logger.info("🎉 ¡Bot de Ravehub conectado exitosamente!")
          console.log("\n🎵═══════════════════════════════════════🎵")
          console.log("🎧        RAVEHUB BOT CONECTADO        🎧")
          console.log("🎵═══════════════════════════════════════🎵\n")
        }

        if (qr) {
          console.log("\n🎵═══════════════════════════════════════🎵")
          console.log("🎧           RAVEHUB BOT QR            🎧")
          console.log("🎵═══════════════════════════════════════🎵")
          console.log("📱 Escanea este código QR con WhatsApp:")
          qrcode.generate(qr, { small: true })
          console.log("🎵═══════════════════════════════════════🎵\n")
        }
      })

      sock.ev.on("creds.update", this.saveCreds)

      // Manejar mensajes
      sock.ev.on("messages.upsert", async ({ messages }) => {
        for (const message of messages) {
          if (message.key.fromMe) continue
          await this.handleMessage(sock, message)
        }
      })

      this.sock = sock
      return sock
    } catch (error) {
      logger.error("❌ Error en la conexión:", error)
      setTimeout(() => this.connect(), 10000)
    }
  }

  async handleMessage(sock, message) {
    try {
      const body =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        ""

      if (!body.startsWith(PREFIX)) return

      const args = body.slice(PREFIX.length).trim().split(" ")
      const commandName = args.shift().toLowerCase()
      const match = args.join(" ")

      // Buscar comando
      const command = this.commands.find((cmd) => {
        if (typeof cmd.pattern === "string") {
          return cmd.pattern === commandName
        } else if (cmd.pattern instanceof RegExp) {
          return cmd.pattern.test(commandName)
        }
        return false
      })

      if (command) {
        // Crear contexto
        const ctx = {
          commands: this.commands,
          PREFIX: this.PREFIX,
          VERSION: this.VERSION,
          pluginsCount: this.pluginsCount,
          WORK_COOLDOWN: require("../config").WORK_COOLDOWN,
          WARN_LIMIT: require("../config").WARN_LIMIT,
        }

        // Crear objeto message mejorado
        const enhancedMessage = {
          ...message,
          jid: message.key.remoteJid,
          pushName: message.pushName || "Raver",
          client: sock,
          send: async (text, options = {}) => {
            return await sock.sendMessage(message.key.remoteJid, { text, ...options })
          },
          reply: async (text, options = {}) => {
            return await sock.sendMessage(
              message.key.remoteJid,
              {
                text,
                ...options,
              },
              { quoted: message },
            )
          },
        }

        await command.handler(enhancedMessage, match, ctx)
      }
    } catch (error) {
      logger.error("❌ Error manejando mensaje:", error)
    }
  }
}

module.exports = { Client, logger }
