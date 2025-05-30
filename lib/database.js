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
    defaultValue: 500, // Balance inicial más alto para Ravehub
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
  await DATABASE.sync()
}

// Funciones de usuario
const getUser = async (jid) => {
  const [user] = await RavehubUser.findOrCreate({
    where: { jid },
    defaults: { balance: 500 },
  })
  return user
}

const updateBalance = async (jid, amount) => {
  const user = await getUser(jid)
  user.balance += amount
  await user.save()
  return user
}

const setLastWork = async (jid, workType) => {
  const user = await getUser(jid)
  user.lastWork = new Date()
  user.workType = workType
  user.totalWorked += 1
  user.reputation += 1
  await user.save()
  return user
}

const canWork = async (jid, cooldown) => {
  const user = await getUser(jid)
  if (!user.lastWork) return true

  const now = new Date()
  const diff = now - user.lastWork
  return diff >= cooldown
}

const upgradeWorkLevel = async (jid) => {
  const user = await getUser(jid)
  user.workLevel += 1
  user.reputation += 5
  await user.save()
  return user
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
