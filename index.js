const { RaveHubBot } = require("./lib/client")
const { addWorkCommand } = require("./plugins/work")
const { addProfileCommand } = require("./plugins/profile")
const { addMenuCommand } = require("./plugins/menu")
const config = require("./config")

console.log(`
🎵 ================================ 🎵
    RAVEHUB BOT v${config.VERSION}
    Ciudad Virtual de Música Electrónica
🎵 ================================ 🎵
`)

async function start() {
  try {
    const bot = new RaveHubBot()

    // Cargar plugins
    addWorkCommand(bot)
    addProfileCommand(bot)
    addMenuCommand(bot)

    console.log("📦 Plugins cargados exitosamente")
    console.log("🔌 Iniciando conexión...")

    await bot.connect()
  } catch (error) {
    console.error("❌ Error iniciando el bot:", error)
    process.exit(1)
  }
}

start()
