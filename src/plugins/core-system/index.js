// src/plugins/core-system/index.js
import { BasePlugin } from "../base-plugin.js"
import moment from "moment"
import os from "os"

export default class CoreSystemPlugin extends BasePlugin {
  async initialize() {
    await super.initialize()
    this.registerCommand("ping", this.handlePing, "Verifica si el bot está respondiendo.")
    this.registerCommand("help", this.handleHelp, "Muestra esta lista de comandos.")
    this.registerCommand("status", this.handleStatus, "Muestra el estado del bot y sistema.", true) // Admin only
    this.registerCommand("uptime", this.handleUptime, "Muestra el tiempo de actividad del bot.")

    console.log("🔌 CoreSystemPlugin cargado y comandos registrados.")
  }

  async handlePing(message) {
    const startTime = Date.now()
    await message.reply("🏓 *Pong!*")
    const endTime = Date.now()
    await message.reply(`_Latencia:_ \`${endTime - startTime}ms\``)
  }

  async handleHelp(message, args, userId, userName, isAdmin) {
    const helpMessages = this.pluginManager.getHelpMessages()
    let response = "🤖 *Comandos Disponibles de RaveHub Bot*\n\n"

    helpMessages.forEach((help) => {
      if (help.adminOnly && !isAdmin) return // Skip admin commands for non-admins
      response += `*${help.command}*`
      if (help.adminOnly) response += " `(Admin)`"
      response += `\n_> ${help.description}_\n\n`
    })

    response += "_¡Gestiona tu vida en el rave!_"
    await message.reply(response)
  }

  async handleStatus(message) {
    const clientStatus = this.pluginManager.context.whatsAppBot.getClientStatus()
    const memoryUsage = process.memoryUsage()
    const uptime = process.uptime()

    const formatBytes = (bytes, decimals = 2) => {
      if (bytes === 0) return "0 Bytes"
      const k = 1024
      const dm = decimals < 0 ? 0 : decimals
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
    }

    let statusText = `📊 *Estado del Sistema RaveHub*\n\n`
    statusText += `*Bot WhatsApp*: ${clientStatus.isReady ? "✅ Conectado" : "❌ Desconectado"}\n`
    if (clientStatus.clientInfo) {
      statusText += `  - Nombre: _${clientStatus.clientInfo.pushname}_\n`
      statusText += `  - Número: \`${clientStatus.clientInfo.wid.user}\`\n`
    }
    statusText += `*Servidor Uptime*: _${moment.duration(uptime, "seconds").humanize()}_\n`
    statusText += `*Uso de Memoria (RSS)*: \`${formatBytes(memoryUsage.rss)}\`\n`
    statusText += `*Carga del Sistema (1m)*: \`${(os.loadavg()[0]).toFixed(2)}\`\n`
    statusText += `*Plugins Cargados*: \`${this.pluginManager.plugins.length}\`\n`

    try {
      const totalUsers = this.db.get("SELECT COUNT(*) as count FROM users")?.count || 0
      const activeWorks = this.db.get("SELECT COUNT(*) as count FROM active_works")?.count || 0
      statusText += `*Usuarios Totales*: \`${totalUsers}\`\n`
      statusText += `*Trabajos Activos*: \`${activeWorks}\`\n`
    } catch (e) {
      statusText += `*Error DB Stats*: _${e.message}_\n`
    }

    await message.reply(statusText)
  }

  async handleUptime(message) {
    const uptime = process.uptime()
    await message.reply(`⏳ El bot ha estado activo por: *${moment.duration(uptime, "seconds").humanize()}*.`)
  }
}
