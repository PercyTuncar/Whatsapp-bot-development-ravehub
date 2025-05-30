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
  HEROKU_APP_NAME: process.env.HEROKU_APP_NAME,
  HEROKU_API_KEY: process.env.HEROKU_API_KEY,
  BRANCH: "master",
  STICKER_PACKNAME: process.env.STICKER_PACKNAME || "🎵,Ravehub",
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE,
  LOG_MSG: process.env.LOG_MSG || "false",
  RMBG_KEY: process.env.RMBG_KEY || "null",
  BAILEYS_LOG_LVL: process.env.BAILEYS_LOG_LVL || "silent",
  LANG: (process.env.LANGUAG || "es").toLowerCase(),
  BOT_LANG: process.env.BOT_LANG || "es",
  WARN_LIMIT: process.env.WARN_LIMIT || 3,
  FORCE_LOGOUT: process.env.FORCE_LOGOUT || "false",
  BRAINSHOP: process.env.BRAINSHOP || "159501,6pq8dPiYt7PdqHz3",
  DISABLE_BOT: process.env.DISABLE_BOT || "null",
  ANTILINK_MSG: process.env.ANTILINK_MSG || "_Antilink Detectado &mention expulsado_",
  ANTISPAM_MSG: process.env.ANTISPAM_MSG || "_Antispam Detectado &mention expulsado_",
  ANTIWORDS_MSG: process.env.ANTIWORDS_MSG || "_Palabra prohibida detectada &mention expulsado_",
  ANTIWORDS: process.env.ANTIWORDS || "palabra",
  MENTION: process.env.MENTION || "",
  MAX_UPLOAD: process.env.MAX_UPLOAD || 230,
  REJECT_CALL: process.env.REJECT_CALL,
  VPS: toBool(process.env.VPS),
  AUTO_STATUS_VIEW: (process.env.AUTO_STATUS_VIEW || "false").trim(),
  SEND_READ: process.env.SEND_READ,
  AJOIN: process.env.AJOIN || "false",
  APPROVE: (process.env.APPROVE || "").trim(),
  ANTI_DELETE: (process.env.ANTI_DELETE || "null").trim(),
  PERSONAL_MESSAGE: (process.env.PERSONAL_MESSAGE || "null").trim(),
  DISABLE_START_MESSAGE: process.env.DISABLE_START_MESSAGE || "false",
  ANTI_BOT: (process.env.ANTI_BOT || "off").trim(),
  ANTI_BOT_MESSAGE: process.env.ANTI_BOT_MESSAGE || "&mention removido",
  WARN_MESSAGE:
    process.env.WARN_MESSAGE || "⚠️ADVERTENCIA⚠️\n*Usuario :* &mention\n*Advertencia :* &warn\n*Restantes :* &remaining",
  WARN_RESET_MESSAGE:
    process.env.WARN_RESET_MESSAGE || `ADVERTENCIAS REINICIADAS\nUsuario : &mention\nRestantes : &remaining`,
  WARN_KICK_MESSAGE: process.env.WARN_KICK_MESSAGE || "&mention expulsado",
  DELETE_TYPE: (process.env.DELETE_TYPE || "").trim(),
  LIST_TYPE: (process.env.LIST_TYPE || "text").trim(),
  TIMEZONE: process.env.TIMEZONE,
  CMD_REACTION: process.env.CMD_REACTION || "true",
  AUTO_UPDATE: process.env.AUTO_UPDATE || "true",
  WHITE_LIST: process.env.WHITE_LIST || "",
  WORK_COOLDOWN: Number.parseInt(process.env.WORK_COOLDOWN || "3600000"), // 1 hora
}
