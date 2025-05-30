const { DATABASE } = require("../config")
const { DataTypes } = require("sequelize")

// Modelo de Usuario Ravehub
const RavehubUser = DATABASE.define("RavehubUser", {
  jid: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  balance: {
    type: DataTypes.INTEGER,
    defaultValue: 500,
  },
  lastWork: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  workType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  workLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  totalWorked: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  reputation: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  joinDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
})

// Inicializar base de datos
const initDatabase = async () => {
  try {
    await DATABASE.authenticate()
    await DATABASE.sync()
    console.log("✅ Base de datos conectada y sincronizada")
  } catch (error) {
    console.error("❌ Error en la base de datos:", error)
    throw error
  }
}

// Funciones de usuario
const getUser = async (jid) => {
  try {
    const [user] = await RavehubUser.findOrCreate({
      where: { jid },
      defaults: { balance: 500 },
    })
    return user
  } catch (error) {
    console.error("Error obteniendo usuario:", error)
    throw error
  }
}

const updateBalance = async (jid, amount) => {
  try {
    const user = await getUser(jid)
    user.balance += amount
    await user.save()
    return user
  } catch (error) {
    console.error("Error actualizando balance:", error)
    throw error
  }
}

const setLastWork = async (jid, workType) => {
  try {
    const user = await getUser(jid)
    user.lastWork = new Date()
    user.workType = workType
    user.totalWorked += 1
    user.reputation += 1
    await user.save()
    return user
  } catch (error) {
    console.error("Error estableciendo último trabajo:", error)
    throw error
  }
}

const canWork = async (jid, cooldown) => {
  try {
    const user = await getUser(jid)
    if (!user.lastWork) return true

    const now = new Date()
    const diff = now - user.lastWork
    return diff >= cooldown
  } catch (error) {
    console.error("Error verificando cooldown:", error)
    return false
  }
}

const upgradeWorkLevel = async (jid) => {
  try {
    const user = await getUser(jid)
    user.workLevel += 1
    user.reputation += 5
    await user.save()
    return user
  } catch (error) {
    console.error("Error subiendo nivel:", error)
    throw error
  }
}

module.exports = {
  initDatabase,
  getUser,
  updateBalance,
  setLastWork,
  canWork,
  upgradeWorkLevel,
  RavehubUser,
}
