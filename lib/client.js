const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("baileys")
const { Boom } = require("@hapi/boom")
const pino = require("pino")
const qrcode = require("qrcode-terminal")
const config = require("../config")
const { initDatabase } = require("./database")

class RaveHubBot {
  constructor() {
    this.commands = []
    this.sock = null
    this.PREFIX = config.PREFIX
    this.VERSION = config.VERSION
    this.state = null
    this.saveCreds = null
  }

  addCommand(commandConfig, handler) {
    this.commands.push({
      ...commandConfig,
      handler,
    })
  }

  async connect() {
    await initDatabase()

    if (!this.state || !this.saveCreds) {
      const { state, saveCreds } = await useMultiFileAuthState("auth_info")
      this.state = state
      this.saveCreds = saveCreds
    }

    this.sock = makeWASocket({
      auth: this.state,
      printQRInTerminal: true,
      logger: pino({ level: "silent" }),
      browser: ["RaveHub Bot", "Chrome", "1.0.0"],
    })

    this.sock.ev.on("creds.update", this.saveCreds)

    this.sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        console.log("📱 Escanea el código QR:")
        qrcode.generate(qr, { small: true })
      }

      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut

        console.log("🔌 Conexión cerrada debido a:", lastDisconnect?.error)

        if (shouldReconnect) {
          console.log("🔄 Reconectando...")
          this.connect()
        }
      } else if (connection === "open") {
        console.log("✅ RaveHub Bot conectado exitosamente!")
        console.log(`🎵 Bienvenido a ${config.COMMUNITY_NAME}`)
      }
    })

    this.sock.ev.on("messages.upsert", async (m) => {
      const message = m.messages[0]
      if (!message.message || message.key.fromMe) return

      await this.handleMessage(message)
    })
  }

  async handleMessage(message) {
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || ""

    if (!text.startsWith(this.PREFIX)) return

    const args = text.slice(this.PREFIX.length).trim().split(" ")
    const commandName = args[0].toLowerCase()
    const match = args.slice(1).join(" ")

    const command = this.commands.find((cmd) => {
      if (cmd.pattern instanceof RegExp) {
        return cmd.pattern.test(text.slice(this.PREFIX.length))
      }
      return cmd.pattern === commandName
    })

    if (command) {
      try {
        const messageObj = {
          ...message,
          jid: message.key.remoteJid,
          fromMe: message.key.fromMe,
          text,
          args,
          match,
          send: async (text, options = {}) => {
            return await this.sock.sendMessage(message.key.remoteJid, {
              text,
              ...options,
            })
          },
          reply: async (text, options = {}) => {
            return await this.sock.sendMessage(
              message.key.remoteJid,
              {
                text,
                ...options,
              },
              { quoted: message },
            )
          },
        }

        await command.handler(messageObj, match, {
          PREFIX: this.PREFIX,
          VERSION: this.VERSION,
          commands: this.commands,
          ...config,
        })
      } catch (error) {
        console.error("❌ Error ejecutando comando:", error)
        await this.sock.sendMessage(message.key.remoteJid, {
          text: "❌ Ocurrió un error al ejecutar el comando.",
        })
      }
    }
  }
}

module.exports = { RaveHubBot }
