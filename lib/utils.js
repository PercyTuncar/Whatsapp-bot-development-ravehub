const moment = require("moment")
moment.locale("es")

const addSpace = (index, total) => {
  const spaces = total.toString().length - index.toString().length
  return " ".repeat(spaces)
}

const textToStylist = (text, style) => {
  switch (style) {
    case "mono":
      return `\`${text}\``
    case "smallcaps":
      return text.toLowerCase()
    case "bold":
      return `*${text}*`
    case "italic":
      return `_${text}_`
    default:
      return text
  }
}

const getUptime = (format = "full") => {
  const uptime = process.uptime()
  const hours = Math.floor(uptime / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  const seconds = Math.floor(uptime % 60)

  if (format === "t") {
    return `${hours}h ${minutes}m ${seconds}s`
  }
  return `${hours}h ${minutes}m ${seconds}s`
}

const getRam = () => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024
  return `${Math.round(used * 100) / 100} MB`
}

const getDate = () => {
  const now = moment()
  return [now.toDate(), now.format("HH:mm:ss")]
}

const getPlatform = () => {
  return process.platform
}

const jidToNum = (jid) => {
  return jid.split("@")[0]
}

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = {
  addSpace,
  textToStylist,
  getUptime,
  getRam,
  getDate,
  getPlatform,
  jidToNum,
  sleep,
}
