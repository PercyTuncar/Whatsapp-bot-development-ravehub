const { bot, lang } = require("../lib/")

bot(
  {
    pattern: "ravehub ?(.*)",
    desc: lang.plugins.ravehub.desc,
    type: "info",
  },
  async (message, match, ctx) => {
    await message.send(lang.plugins.ravehub.info)
  },
)

bot(
  {
    pattern: "info ?(.*)",
    desc: "Información del bot Ravehub",
    type: "info",
  },
  async (message, match, ctx) => {
    const infoText = `🎵 *RAVEHUB BOT* 🎵\n\n📊 *Estadísticas:*\n• Versión: ${ctx.VERSION}\n• Plugins: ${ctx.pluginsCount}\n• RAM: ${require("../lib/utils").getRam()}\n• Encendido: ${require("../lib/utils").getUptime()}\n• Plataforma: ${require("../lib/utils").getPlatform()}\n\n🎧 *Creado para la comunidad de música electrónica*\n\n💻 *Desarrollado con:*\n• Node.js\n• Baileys\n• Sequelize\n• PM2\n\n🌟 *¡Únete a la revolución electrónica!*`

    await message.send(infoText)
  },
)
