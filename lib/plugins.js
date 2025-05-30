const fs = require("fs")
const path = require("path")
const { logger } = require("./client")

const loadPlugins = async () => {
  const commands = []
  const pluginsDir = path.join(__dirname, "../plugins")

  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir, { recursive: true })
    return commands
  }

  const files = fs.readdirSync(pluginsDir).filter((file) => file.endsWith(".js"))

  for (const file of files) {
    try {
      delete require.cache[require.resolve(path.join(pluginsDir, file))]
      require(path.join(pluginsDir, file))
      logger.info(`Plugin cargado: ${file}`)
    } catch (error) {
      logger.error(`Error cargando plugin ${file}:`, error)
    }
  }

  return global.commands || []
}

// Función para registrar comandos (similar a Levanter)
const bot = (config, handler) => {
  if (!global.commands) global.commands = []

  global.commands.push({
    pattern: config.pattern,
    handler,
    desc: config.desc || "Sin descripción",
    type: config.type || "misc",
    onlyGroup: config.onlyGroup || false,
    dontAddCommandList: config.dontAddCommandList || false,
  })
}

module.exports = { loadPlugins, bot }
