const pm2 = require("pm2")
const { logger } = require("./client")

const stopInstance = () => {
  pm2.connect((err) => {
    if (err) {
      logger.error("Error conectando a PM2:", err)
      process.exit(2)
    }

    pm2.stop("ravehub", (err) => {
      if (err) logger.error("Error deteniendo instancia:", err)
      pm2.disconnect()
      process.exit(0)
    })
  })
}

const restartInstance = () => {
  pm2.connect((err) => {
    if (err) {
      logger.error("Error conectando a PM2:", err)
      return
    }

    pm2.restart("ravehub", (err) => {
      if (err) logger.error("Error reiniciando instancia:", err)
      pm2.disconnect()
    })
  })
}

module.exports = { stopInstance, restartInstance }
