const pm2 = require("pm2")
<<<<<<< HEAD
=======
const { logger } = require("./client")
>>>>>>> 23afb8d (Primer commit)

const stopInstance = () => {
  pm2.connect((err) => {
    if (err) {
<<<<<<< HEAD
      console.error(err)
=======
      logger.error("Error conectando a PM2:", err)
>>>>>>> 23afb8d (Primer commit)
      process.exit(2)
    }

    pm2.stop("ravehub", (err) => {
<<<<<<< HEAD
      if (err) console.error(err)
=======
      if (err) logger.error("Error deteniendo instancia:", err)
>>>>>>> 23afb8d (Primer commit)
      pm2.disconnect()
      process.exit(0)
    })
  })
}

<<<<<<< HEAD
module.exports = { stopInstance }
=======
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
>>>>>>> 23afb8d (Primer commit)
