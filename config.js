const { Sequelize } = require("sequelize")
const { existsSync } = require("fs")
const path = require("path")
const configPath = path.join(__dirname, "./config.env")
const databasePath = path.join(__dirname, "./database.db")
if (existsSync(configPath)) require("dotenv").config({ path: configPath })
const toBool = (x) => x == "true"

const DATABASE_URL = process.env.DATABASE_URL === undefined ? databasePath : process.env.DATABASE_URL

module.exports = {
  VERSION: require("./package.json").version,
  SESSION_ID: (process.env.SESSION_ID || "").trim(),
  DATABASE:
    DATABASE_URL === databasePath
      ? new Sequelize({
          dialect: "sqlite",
          storage: DATABASE_URL,
          logging: false,
        })
      : new Sequelize(DATABASE_URL, {
          dialect: "postgres",
          ssl: true,
          protocol: "postgres",
          dialectOptions: {
            native: true,
            ssl: { require: true, rejectUnauthorized: false },
          },
          logging: false,
        }),
  PREFIX: (process.env.PREFIX || "!").trim(),
  SUDO: process.env.SUDO || "",
  STICKER_PACKNAME: process.env.STICKER_PACKNAME || "❤️,Ravehub",
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE,
  LOG_MSG: process.env.LOG_MSG || "false",
  RMBG_KEY: process.env.RMBG_KEY || "null",
  BAILEYS_LOG_LVL: process.env.BAILEYS_LOG_LVL || "silent",
  LANG: (process.env.LANGUAG || "es").toLowerCase(),
  BOT_LANG: process.env.BOT_LANG || "es",
  WARN_LIMIT: process.env.WARN_LIMIT || 3,
  FORCE_LOGOUT: process.env.FORCE_LOGOUT || "false",
  MAX_UPLOAD: process.env.MAX_UPLOAD || 230,
  REJECT_CALL: process.env.REJECT_CALL,
  VPS: toBool(process.env.VPS),
  AUTO_STATUS_VIEW: (process.env.AUTO_STATUS_VIEW || "false").trim(),
  SEND_READ: process.env.SEND_READ,
  AJOIN: process.env.AJOIN || "false",
  DISABLE_START_MESSAGE: process.env.DISABLE_START_MESSAGE || "false",
  PERSONAL_MESSAGE: (process.env.PERSONAL_MESSAGE || "null").trim(),
  WORK_COOLDOWN: Number.parseInt(process.env.WORK_COOLDOWN || "3600000"),
  TIMEZONE: process.env.TIMEZONE || "America/Mexico_City",
}
