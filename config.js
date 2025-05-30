const { Sequelize } = require("sequelize")
const { existsSync } = require("fs")
const path = require("path")

const configPath = path.join(__dirname, "./config.env")
const databasePath = path.join(__dirname, "./database.db")

if (existsSync(configPath)) require("dotenv").config({ path: configPath })

const toBool = (x) => x === "true"

module.exports = {
  VERSION: require("./package.json").version,
  SESSION_ID: (process.env.SESSION_ID || "").trim(),
  DATABASE: new Sequelize({
    dialect: "sqlite",
    storage: databasePath,
    logging: false,
  }),
  PREFIX: process.env.PREFIX || "!",
  SUDO: process.env.SUDO || "",
  BOT_NAME: process.env.BOT_NAME || "RaveHub Bot",
  COMMUNITY_NAME: "RaveHub",
  CURRENCY_NAME: "RaveCoins",
  CURRENCY_SYMBOL: "🪙",
  WORK_COOLDOWN: Number.parseInt(process.env.WORK_COOLDOWN) || 3600000, // 1 hora en ms
  TIMEZONE: process.env.TIMEZONE || "America/Mexico_City",
  LANG: "es",

  // Configuración de trabajos
  JOBS: {
    dj: {
      name: "DJ",
      emoji: "🎧",
      baseSalary: 150,
      description: "Mezcla los mejores beats y haz vibrar la pista",
      requirements: "Nivel mínimo: 1",
    },
    security: {
      name: "Seguridad",
      emoji: "🛡️",
      baseSalary: 120,
      description: "Mantén el orden en los eventos y protege la comunidad",
      requirements: "Nivel mínimo: 1",
    },
    promoter: {
      name: "Promoter",
      emoji: "📢",
      baseSalary: 100,
      description: "Promociona las mejores fiestas y eventos",
      requirements: "Nivel mínimo: 1",
    },
    dealer: {
      name: "Dealer",
      emoji: "💊",
      baseSalary: 200,
      description: "Vende productos especiales en el mercado underground",
      requirements: "Nivel mínimo: 5",
      risk: 0.15, // 15% de probabilidad de ser atrapado
    },
  },
}
