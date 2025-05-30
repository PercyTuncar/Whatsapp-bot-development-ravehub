const pm2 = require("pm2")

const stopInstance = () => {
  pm2.connect((err) => {
    if (err) {
      console.error(err)
      process.exit(2)
    }

    pm2.stop("ravehub", (err) => {
      if (err) console.error(err)
      pm2.disconnect()
      process.exit(0)
    })
  })
}

module.exports = { stopInstance }
