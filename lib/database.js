const { DATABASE } = require("../config")
const { DataTypes } = require("sequelize")

// Modelo de Usuario
const User = DATABASE.define("User", {
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
    defaultValue: 100,
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
})

// Inicializar base de datos
const initDatabase = async () => {
  await DATABASE.sync()
}

// Funciones de usuario
const getUser = async (jid) => {
  const [user] = await User.findOrCreate({
    where: { jid },
    defaults: { balance: 100 },
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
  User,
}
