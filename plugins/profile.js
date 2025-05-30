const { User, WorkHistory } = require("../lib/database")
const { formatCurrency, formatTime } = require("../lib/utils")
const config = require("../config")

function addProfileCommand(bot) {
  bot.addCommand(
    {
      pattern: "perfil",
      desc: "Ver tu perfil de RaveHub",
      type: "user",
    },
    async (message) => {
      const userJid = message.key.remoteJid
      const userName = message.pushName || "Raver"

      let user = await User.findOne({ where: { jid: userJid } })
      if (!user) {
        user = await User.create({
          jid: userJid,
          name: userName,
        })
      }

      // Obtener estadísticas de trabajo
      const workStats = await WorkHistory.findAll({
        where: { userJid: userJid },
        attributes: [
          "job",
          [config.DATABASE.fn("COUNT", config.DATABASE.col("job")), "count"],
          [config.DATABASE.fn("SUM", config.DATABASE.col("earnings")), "totalEarnings"],
        ],
        group: ["job"],
      })

      const totalEarnings =
        (await WorkHistory.sum("earnings", {
          where: { userJid: userJid, success: true },
        })) || 0

      const favoriteJob = workStats.length > 0 ? workStats.reduce((a, b) => (a.count > b.count ? a : b)) : null

      const expToNextLevel = user.level * 1000 - user.experience
      const progressBar =
        "█".repeat(Math.floor((user.experience % 1000) / 100)) +
        "░".repeat(10 - Math.floor((user.experience % 1000) / 100))

      await message.reply(`
🎵 *PERFIL DE ${user.name.toUpperCase()}* 🎵

👤 *Información Personal*
├ 📱 ID: ${userJid.split("@")[0]}
├ 🆔 Nivel: ${user.level}
├ ⭐ Experiencia: ${user.experience} XP
├ 📊 Progreso: [${progressBar}] ${expToNextLevel} XP para nivel ${user.level + 1}
└ 🏆 Reputación: ${user.reputation}

💰 *Economía*
├ 💳 Balance: ${formatCurrency(user.balance)}
├ 💵 Total ganado: ${formatCurrency(totalEarnings)}
└ 💼 Trabajos realizados: ${user.totalWorked}

🎯 *Estadísticas de Trabajo*
${favoriteJob ? `├ 🌟 Trabajo favorito: ${config.JOBS[favoriteJob.job]?.emoji} ${config.JOBS[favoriteJob.job]?.name}` : "├ 🌟 Trabajo favorito: Ninguno"}
${
  workStats
    .map((stat) => `├ ${config.JOBS[stat.job]?.emoji} ${config.JOBS[stat.job]?.name}: ${stat.count} veces`)
    .join("\n") || "└ No has trabajado aún"
}

📅 *Registro*
└ 🗓️ Miembro desde: ${new Date(user.joinedAt).toLocaleDateString("es-ES")}

🎵 *¡Bienvenido a la ciudad virtual de ${config.COMMUNITY_NAME}!* 🎵
`)
    },
  )

  bot.addCommand(
    {
      pattern: "balance",
      desc: "Ver tu balance de RaveCoins",
      type: "economy",
    },
    async (message) => {
      const userJid = message.key.remoteJid
      const userName = message.pushName || "Raver"

      let user = await User.findOne({ where: { jid: userJid } })
      if (!user) {
        user = await User.create({
          jid: userJid,
          name: userName,
        })
      }

      await message.reply(`
💰 *TU BALANCE EN RAVEHUB* 💰

${config.CURRENCY_SYMBOL} *${formatCurrency(user.balance)}*

📊 Nivel: ${user.level}
⭐ Experiencia: ${user.experience} XP
💼 Trabajos realizados: ${user.totalWorked}

💡 *Tip:* Usa !work para ganar más ${config.CURRENCY_NAME}
`)
    },
  )
}

module.exports = { addProfileCommand }
