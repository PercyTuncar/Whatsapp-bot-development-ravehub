const { User, WorkHistory } = require("../lib/database")
const {
  formatCurrency,
  getRandomSalary,
  calculateExperience,
  canWork,
  getTimeUntilWork,
  formatTime,
} = require("../lib/utils")
const config = require("../config")

function addWorkCommand(bot) {
  bot.addCommand(
    {
      pattern: "work",
      desc: "Sistema de trabajos de RaveHub - Gana RaveCoins trabajando",
      type: "economy",
    },
    async (message, match) => {
      const userJid = message.key.remoteJid
      const userName = message.pushName || "Raver"

      // Obtener o crear usuario
      let user = await User.findOne({ where: { jid: userJid } })
      if (!user) {
        user = await User.create({
          jid: userJid,
          name: userName,
        })
      }

      if (!match) {
        return await message.reply(`
🎵 *SISTEMA DE TRABAJOS RAVEHUB* 🎵

Trabajos disponibles:
${Object.entries(config.JOBS)
  .map(
    ([key, job]) =>
      `${job.emoji} *${job.name}* - ${formatCurrency(job.baseSalary)}/hora
  └ ${job.description}
  └ ${job.requirements}`,
  )
  .join("\n\n")}

💡 *Uso:* !work [trabajo]
📊 *Tu nivel:* ${user.level} | *Balance:* ${formatCurrency(user.balance)}

⏰ *Cooldown:* ${formatTime(config.WORK_COOLDOWN)}
`)
      }

      const jobKey = match.toLowerCase()
      const job = config.JOBS[jobKey]

      if (!job) {
        return await message.reply(`❌ Trabajo no válido. Usa: ${Object.keys(config.JOBS).join(", ")}`)
      }

      // Verificar cooldown
      if (!canWork(user.lastWork)) {
        const timeLeft = getTimeUntilWork(user.lastWork)
        return await message.reply(`⏰ Debes esperar *${formatTime(timeLeft)}* antes de trabajar de nuevo.`)
      }

      // Verificar requisitos de nivel
      if (jobKey === "dealer" && user.level < 5) {
        return await message.reply(`🚫 Necesitas ser nivel 5 o superior para trabajar como ${job.name}`)
      }

      // Simular trabajo
      let success = true
      let earnings = getRandomSalary(job.baseSalary, user.level, user.reputation)
      let resultMessage = ""

      // Trabajo especial: Dealer tiene riesgo
      if (jobKey === "dealer") {
        const caught = Math.random() < job.risk
        if (caught) {
          success = false
          earnings = 0
          const fine = Math.floor(user.balance * 0.1) // Multa del 10%
          user.balance = Math.max(0, user.balance - fine)
          resultMessage = `🚔 *¡Te atraparon!* 
Perdiste ${formatCurrency(fine)} en multas.
La seguridad está vigilando más de cerca...`
        } else {
          // Bonus por riesgo
          earnings = Math.floor(earnings * 1.3)
          resultMessage = `💊 *Operación exitosa*
Vendiste productos en las sombras sin ser detectado.
Bonus de riesgo aplicado! (+30%)`
        }
      } else {
        // Mensajes específicos por trabajo
        const workMessages = {
          dj: [
            "🎧 Mezclaste un set increíble que hizo vibrar toda la pista",
            "🔥 Tu música electrizó a la multitud toda la noche",
            "⚡ Los beats que pusiste fueron épicos, la gente no paró de bailar",
          ],
          security: [
            "🛡️ Mantuviste el orden durante todo el evento sin incidentes",
            "👮 Protegiste la entrada y verificaste a todos los asistentes",
            "🚨 Resolviste una situación complicada de manera profesional",
          ],
          promoter: [
            "📢 Tu promoción atrajo a cientos de nuevos ravers",
            "📱 Tus posts en redes sociales se volvieron virales",
            "🎉 Organizaste una campaña publicitaria exitosa",
          ],
        }

        const messages = workMessages[jobKey] || ["Completaste tu trabajo exitosamente"]
        resultMessage = messages[Math.floor(Math.random() * messages.length)]
      }

      if (success) {
        // Actualizar balance y experiencia
        user.balance += earnings
        const expGained = calculateExperience(jobKey, earnings)
        user.experience += expGained

        // Verificar subida de nivel
        const newLevel = Math.floor(user.experience / 1000) + 1
        let levelUpMessage = ""
        if (newLevel > user.level) {
          user.level = newLevel
          levelUpMessage = `\n🆙 *¡SUBISTE DE NIVEL!* Ahora eres nivel ${newLevel}`
        }

        user.totalWorked += 1
        user.lastWork = new Date()
        user.currentJob = jobKey

        await user.save()

        // Guardar historial
        await WorkHistory.create({
          userJid: userJid,
          job: jobKey,
          earnings: earnings,
          success: true,
        })

        await message.reply(`${job.emoji} *TRABAJO COMPLETADO* ${job.emoji}

${resultMessage}

💰 *Ganaste:* ${formatCurrency(earnings)}
💳 *Balance actual:* ${formatCurrency(user.balance)}
⭐ *Experiencia:* +${expGained} XP${levelUpMessage}

⏰ Podrás trabajar de nuevo en ${formatTime(config.WORK_COOLDOWN)}`)
      } else {
        user.lastWork = new Date()
        await user.save()

        // Guardar historial de fallo
        await WorkHistory.create({
          userJid: userJid,
          job: jobKey,
          earnings: 0,
          success: false,
        })

        await message.reply(`${job.emoji} *TRABAJO FALLIDO* 🚫

${resultMessage}

💳 *Balance actual:* ${formatCurrency(user.balance)}

⏰ Podrás intentar trabajar de nuevo en ${formatTime(config.WORK_COOLDOWN)}`)
      }
    },
  )
}

module.exports = { addWorkCommand }
