const { getUptime, getDate } = require("../lib/utils")
const config = require("../config")

function addMenuCommand(bot) {
  bot.addCommand(
    {
      pattern: "menu",
      desc: "Menú principal de RaveHub Bot",
      type: "general",
    },
    async (message) => {
      const [date, time] = getDate()

      const commands = {}
      bot.commands.forEach((command) => {
        if (!command.dontAddCommandList && command.pattern) {
          const cmdType = command.type || "general"
          if (!commands[cmdType]) commands[cmdType] = []
          commands[cmdType].push(command.pattern)
        }
      })

      const sortedCommandKeys = Object.keys(commands).sort()

      let msg = `
🎵 *RAVEHUB BOT* 🎵
╭────────────────╮
      CIUDAD VIRTUAL
╰────────────────╯

╭────────────────
│ 🕐 Hora: ${time}
│ 📅 Fecha: ${date.toLocaleDateString("es-ES")}
│ 🤖 Versión: ${config.VERSION}
│ ⚡ Uptime: ${getUptime()}
│ 🎵 Comunidad: ${config.COMMUNITY_NAME}
╰────────────────

`

      for (const commandType of sortedCommandKeys) {
        const typeEmojis = {
          general: "🏠",
          economy: "💰",
          user: "👤",
          admin: "⚙️",
          fun: "🎉",
        }

        msg += `╭─❏ ${typeEmojis[commandType] || "📋"} ${commandType.toUpperCase()} ❏\n`
        commands[commandType].forEach((cmd) => {
          msg += `│ ${config.PREFIX}${cmd}\n`
        })
        msg += `╰─────────────────\n`
      }

      msg += `
🎵 *¡Bienvenido a la ciudad virtual de música electrónica!* 🎵
💡 Usa ${config.PREFIX}work para empezar a ganar ${config.CURRENCY_NAME}
`

      await message.reply(msg.trim())
    },
  )

  bot.addCommand(
    {
      pattern: "help",
      desc: "Ayuda del bot",
      type: "general",
    },
    async (message, match) => {
      if (!match) {
        return await message.reply(`
🆘 *AYUDA DE RAVEHUB BOT* 🆘

📋 *Comandos principales:*
• ${config.PREFIX}menu - Ver todos los comandos
• ${config.PREFIX}work - Sistema de trabajos
• ${config.PREFIX}perfil - Ver tu perfil
• ${config.PREFIX}balance - Ver tu balance

💡 *Para ayuda específica:*
${config.PREFIX}help [comando]

🎵 *¡Únete a la revolución de la música electrónica!* 🎵
`)
      }

      const command = bot.commands.find((cmd) => cmd.pattern === match.toLowerCase())
      if (command) {
        await message.reply(`
ℹ️ *AYUDA: ${match.toUpperCase()}*

📝 *Descripción:* ${command.desc}
🏷️ *Tipo:* ${command.type || "general"}
💡 *Uso:* ${config.PREFIX}${command.pattern}
`)
      } else {
        await message.reply(`❌ Comando "${match}" no encontrado.`)
      }
    },
  )
}

module.exports = { addMenuCommand }
