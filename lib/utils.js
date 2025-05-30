const moment = require("moment")
const config = require("../config")

// Configurar moment en español
moment.locale("es")

function formatCurrency(amount) {
  return `${config.CURRENCY_SYMBOL} ${amount.toLocaleString("es-ES")}`
}

function getRandomSalary(baseSalary, level, reputation) {
  const levelBonus = Math.floor(baseSalary * (level * 0.1))
  const repBonus = Math.floor(baseSalary * (reputation * 0.05))
  const randomFactor = 0.8 + Math.random() * 0.4 // Entre 80% y 120%

  return Math.floor((baseSalary + levelBonus + repBonus) * randomFactor)
}

function calculateExperience(job, earnings) {
  const baseExp = 10
  const jobMultiplier = {
    dj: 1.2,
    security: 1.0,
    promoter: 1.1,
    dealer: 1.5,
  }

  return Math.floor(baseExp * (jobMultiplier[job] || 1) * (earnings / 100))
}

function canWork(lastWork, cooldown = config.WORK_COOLDOWN) {
  if (!lastWork) return true

  const now = new Date()
  const timeDiff = now.getTime() - new Date(lastWork).getTime()
  return timeDiff >= cooldown
}

function getTimeUntilWork(lastWork, cooldown = config.WORK_COOLDOWN) {
  if (!lastWork) return 0

  const now = new Date()
  const timeDiff = now.getTime() - new Date(lastWork).getTime()
  const remaining = cooldown - timeDiff

  return remaining > 0 ? remaining : 0
}

function formatTime(milliseconds) {
  const duration = moment.duration(milliseconds)
  const hours = Math.floor(duration.asHours())
  const minutes = duration.minutes()

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

function jidToNum(jid) {
  return jid.split("@")[0]
}

function getUptime() {
  const uptime = process.uptime()
  return formatTime(uptime * 1000)
}

function getDate() {
  const now = moment()
  return [now.toDate(), now.format("HH:mm")]
}

module.exports = {
  formatCurrency,
  getRandomSalary,
  calculateExperience,
  canWork,
  getTimeUntilWork,
  formatTime,
  jidToNum,
  getUptime,
  getDate,
}
