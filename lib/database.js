const { DataTypes } = require("sequelize")
const config = require("../config")

const User = config.DATABASE.define("User", {
  jid: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  balance: {
    type: DataTypes.INTEGER,
    defaultValue: 1000, // Balance inicial
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastWork: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  currentJob: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  totalWorked: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  reputation: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
})

const WorkHistory = config.DATABASE.define("WorkHistory", {
  userJid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  job: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  earnings: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  success: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
})

// Relaciones
User.hasMany(WorkHistory, { foreignKey: "userJid", sourceKey: "jid" })
WorkHistory.belongsTo(User, { foreignKey: "userJid", targetKey: "jid" })

async function initDatabase() {
  try {
    await config.DATABASE.authenticate()
    await config.DATABASE.sync()
    console.log("✅ Base de datos conectada y sincronizada")
  } catch (error) {
    console.error("❌ Error conectando a la base de datos:", error)
    process.exit(1)
  }
}

module.exports = {
  User,
  WorkHistory,
  initDatabase,
}
