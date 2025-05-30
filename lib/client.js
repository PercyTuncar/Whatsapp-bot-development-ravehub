const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("baileys")
const pino = require("pino")
const { Boom } = require("@hapi/boom")
const fs = require("fs")
const path = require("path")
const { SESSION_ID, PREFIX, LANG } = require("../config")
const qrcode = require("qrcode-terminal")
const { loadPlugins } = require("./plugins")
const { initDatabase } = require("./database")
const lang = require(`../lang/${LANG}.json`)

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
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
  }

  async connect() {
    // Crear directorio de sesiones si no existe
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true })
    }

    // Configurar autenticación
    const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir)
    const { version } = await fetchLatestBaileysVersion()

    // Inicializar base de datos
    await initDatabase()
    logger.info("Base de datos inicializada")

    // Cargar plugins
    this.commands = await loadPlugins()
    this.pluginsCount = this.commands.length
    logger.info(`${this.pluginsCount} plugins cargados`)

    // Crear socket de WhatsApp
    const sock = makeWASocket({
      version,
      logger: pino({ level: "silent" }),
      printQRInTerminal: true,
      auth: state,
      browser: ["Ravehub Bot", "Chrome", "1.0.0"],
      getMessage: async (key) => {
        return { conversation: "hello" }
      },
    })

    // Eventos de conexión
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update

      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect?.error instanceof Boom && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut

        logger.info("Conexión cerrada:", lastDisconnect?.error, "Reconectando:", shouldReconnect)

        if (shouldReconnect) {
          this.connect()
        } else {
          logger.info("Sesión cerrada. Elimina la carpeta de sesión y vuelve a escanear.")
        }
      } else if (connection === "open") {
        logger.info("¡Bot de Ravehub conectado exitosamente!")
      }

      if (qr) {
        console.log("\n🎵 RAVEHUB BOT 🎵")
        console.log("Escanea este código QR con WhatsApp:")
        qrcode.generate(qr, { small: true })
      }
    })

    sock.ev.on("creds.update", saveCreds)

    // Manejar mensajes
    sock.ev.on("messages.upsert", async ({ messages }) => {
      for (const message of messages) {
        if (message.key.fromMe) continue
        await this.handleMessage(sock, message)
      }
    })

    this.sock = sock
    return sock
  }

  async handleMessage(sock, message) {
    try {
      const body = message.message?.conversation || message.message?.extendedTextMessage?.text || ""

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
        // Crear contexto similar a Levanter
        const ctx = {
          commands: this.commands,
          PREFIX: this.PREFIX,
          VERSION: this.VERSION,
          pluginsCount: this.pluginsCount,
          WORK_COOLDOWN: require("../config").WORK_COOLDOWN,
        }

        // Crear objeto message mejorado
        const enhancedMessage = {
          ...message,
          jid: message.key.remoteJid,
          pushName: message.pushName || "Usuario",
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
      logger.error("Error manejando mensaje:", error)
    }
  }
}

module.exports = { Client, logger }
