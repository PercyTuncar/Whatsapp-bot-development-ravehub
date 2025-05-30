const { Client, logger } = require("./lib/client")
const { DATABASE, VERSION } = require("./config")
const { stopInstance } = require("./lib/pm2")

const start = async () => {
  logger.info(`🎵 Ravehub Bot ${VERSION} 🎵`)
  try {
    await DATABASE.authenticate({ retry: { max: 3 } })
    logger.info("✅ Conexión a la base de datos establecida")
  } catch (error) {
    const databaseUrl = process.env.DATABASE_URL
    logger.error({ msg: "❌ No se pudo conectar a la base de datos", error: error.message, databaseUrl })
    return stopInstance()
  }
  try {
    const bot = new Client()
    await bot.connect()
  } catch (error) {
    logger.error(error)
  }
}
start()
