// src/plugins/work-system/index.js
import { BasePlugin } from "../base-plugin.js"
import moment from "moment"

export default class WorkSystemPlugin extends BasePlugin {
  async initialize() {
    await super.initialize()
    this.registerCommand("work", this.handleWork, "Inicia un trabajo o lista los trabajos disponibles.", false, [
      "trabajar",
    ])
    this.registerCommand("jobinfo", this.handleJobInfo, "Muestra información detallada sobre un trabajo específico.")
    this.registerCommand("cancelwork", this.handleCancelWork, "Cancela tu trabajo actual (puede tener penalizaciones).")

    this.cronJob = setInterval(() => this.processCompletedWorks(), 60 * 1000)
    console.log("🔌 WorkSystemPlugin cargado y cron job iniciado.")
  }

  async handleWork(message, args, userId, userName) {
    const jobCommand = args[0] ? args[0].toLowerCase() : null

    if (!jobCommand) {
      return this.listAvailableJobs(message, userId)
    }

    const activeWork = this.db.get("SELECT * FROM active_works WHERE user_id = ?", [userId])
    if (activeWork) {
      const timeLeft = moment(activeWork.end_time).diff(moment(), "minutes")
      return message.reply(
        `⏰ *Ya estás trabajando como ${activeWork.job_name}!*\n\n` +
          `🕐 _Terminas en:_ *${timeLeft} minutos*\n` +
          `💰 _Ganarás:_ \`${activeWork.salary} ravecoins\``,
      )
    }

    const job = this.db.get("SELECT * FROM jobs WHERE command = ?", [jobCommand])
    if (!job) {
      return message.reply(`❌ Trabajo \`${jobCommand}\` no encontrado. Usa \`!work\` para ver la lista.`)
    }

    const user = this.db.get("SELECT level FROM users WHERE id = ?", [userId])
    if (!user) {
      console.error(`User not found in handleWork: ${userId}`)
      return message.reply("❌ Error: Usuario no encontrado. Intenta enviar un mensaje primero para registrarte.")
    }

    if (user.level < job.level_required) {
      return message.reply(
        `🚫 *Nivel insuficiente para ${job.name}*\n\n` +
          `🏆 _Necesitas:_ *Nivel ${job.level_required}*\n` +
          `📊 _Tu nivel actual:_ *Nivel ${user.level}*`,
      )
    }

    const salary = Math.floor(Math.random() * (job.salary_max - job.salary_min + 1)) + job.salary_min
    const endTime = moment().add(job.duration, "minutes").toISOString()

    try {
      this.db.run("INSERT INTO active_works (user_id, job_name, salary, experience, end_time) VALUES (?, ?, ?, ?, ?)", [
        userId,
        job.name,
        salary,
        job.experience_reward,
        endTime,
      ])
      message.reply(
        `${job.emoji} *¡Comenzaste a trabajar como ${job.name}!* 🎉\n\n` +
          `💰 *Ganarás (en mano):* \`${salary} ravecoins\`\n` +
          `⭐ *Experiencia:* \`+${job.experience_reward} XP\`\n` +
          `⏰ *Duración:* \`${job.duration} minutos\`\n\n` +
          `🎯 _${job.description}_`,
      )
    } catch (error) {
      console.error(`Error starting work for ${userId} on job ${jobCommand}:`, error)
      message.reply("❌ Error al iniciar el trabajo. Inténtalo de nuevo.")
    }
  }

  async listAvailableJobs(message, userId) {
    const user = this.db.get("SELECT level FROM users WHERE id = ?", [userId])
    if (!user) {
      console.error(`User not found in listAvailableJobs: ${userId}`)
      return message.reply("❌ Error: Usuario no encontrado. Intenta enviar un mensaje primero para registrarte.")
    }

    const jobs = this.db.all("SELECT * FROM jobs ORDER BY level_required ASC")
    if (!jobs || jobs.length === 0) {
      return message.reply("🛠️ No hay trabajos configurados en el sistema actualmente.")
    }
    let response = "💼 *TRABAJOS DISPONIBLES EN RAVEHUB*\n\n"
    jobs.forEach((job) => {
      const meetsLevel = user.level >= job.level_required
      response += `${job.emoji} *${job.name}* ${meetsLevel ? "✅" : `🔒 _(Nivel ${job.level_required})_`}\n`
      response += `  - Comando: \`!work ${job.command}\`\n`
      response += `  - Salario: \`$${job.salary_min}-${job.salary_max}\` | XP: \`${job.experience_reward}\`\n`
      response += `  - Duración: \`${job.duration} min\`\n\n`
    })
    response += "💡 _Usa `!work <comando>` para empezar un trabajo._"
    message.reply(response)
  }

  async handleJobInfo(message, args) {
    const jobCommand = args[0] ? args[0].toLowerCase() : null
    if (!jobCommand) {
      return message.reply("Por favor, especifica el comando del trabajo. Ej: `!jobinfo dj`")
    }
    const job = this.db.get("SELECT * FROM jobs WHERE command = ?", [jobCommand])
    if (!job) {
      return message.reply(`❌ No se encontró información para el trabajo con comando \`${jobCommand}\`.`)
    }
    let response = `${job.emoji} *Detalles del Trabajo: ${job.name}*\n\n`
    response += `*Comando:* \`!work ${job.command}\`\n`
    response += `*Descripción:* _${job.description}_\n`
    response += `*Salario Estimado (en mano):* \`$${job.salary_min} - $${job.salary_max} ravecoins\`\n`
    response += `*Experiencia Ganada:* \`${job.experience_reward} XP\`\n`
    response += `*Duración:* \`${job.duration} minutos\`\n`
    response += `*Nivel Requerido:* \`Nivel ${job.level_required}\`\n`
    message.reply(response)
  }

  async handleCancelWork(message, args, userId) {
    const activeWork = this.db.get("SELECT * FROM active_works WHERE user_id = ?", [userId])
    if (!activeWork) {
      return message.reply("🤔 No estás trabajando actualmente.")
    }

    try {
      this.db.run("DELETE FROM active_works WHERE user_id = ?", [userId])
      message.reply(
        `🗑️ Has cancelado tu trabajo como *${activeWork.job_name}*.\n_No recibirás pago ni XP por el tiempo trabajado._`,
      )
    } catch (error) {
      console.error(`Error cancelling work for ${userId}:`, error)
      message.reply("❌ Error al cancelar el trabajo.")
    }
  }

  async processCompletedWorks() {
    const completedWorks = this.db.all("SELECT * FROM active_works WHERE end_time <= datetime('now', 'localtime')")
    if (completedWorks.length === 0) return

    console.log(`🔄 Procesando ${completedWorks.length} trabajos completados...`)
    for (const work of completedWorks) {
      const processWorkTransaction = this.db.transaction(() => {
        const user = this.db.get("SELECT id, name, experience, level FROM users WHERE id = ?", [work.user_id])
        if (!user) {
          console.warn(`User ${work.user_id} not found for completed work ${work.id}. Deleting active_work entry.`)
          this.db.run("DELETE FROM active_works WHERE id = ?", [work.id]) // Clean up orphan work
          return null // Skip this work
        }

        this.db.run("UPDATE users SET ravecoins = ravecoins + ?, experience = experience + ? WHERE id = ?", [
          work.salary,
          work.experience,
          user.id,
        ])

        const newExperience = user.experience + work.experience
        const newLevel = Math.floor(newExperience / 100) + 1
        let levelUpMessage = ""

        if (newLevel > user.level) {
          this.db.run("UPDATE users SET level = ? WHERE id = ?", [newLevel, user.id])
          levelUpMessage = `🎉 *¡Felicidades, ${user.name}!* Has subido al *Nivel ${newLevel}*!`
          console.log(`🎉 ${user.name} (${user.id}) subió al Nivel ${newLevel}`)
        }

        this.db.run(
          "INSERT INTO work_history (user_id, job_name, salary_earned, experience_gained) VALUES (?, ?, ?, ?)",
          [user.id, work.job_name, work.salary, work.experience],
        )
        this.db.run("DELETE FROM active_works WHERE id = ?", [work.id])
        return { user, work, levelUpMessage } // Return data for messaging
      })

      try {
        const result = processWorkTransaction()
        if (result) {
          const { user, work: completedWork, levelUpMessage } = result
          const chat = await this.client.getChatById(`${user.id}@c.us`)
          if (chat) {
            let completionMessage = `💰 ¡Trabajo completado: *${completedWork.job_name}*!\nHas ganado \`${completedWork.salary} ravecoins\` (en mano) y \`${completedWork.experience} XP\`.`
            completionMessage += `\n_Puedes usar \`!deposit\` para guardarlos en el banco._`
            if (levelUpMessage) completionMessage += `\n\n${levelUpMessage}`
            await chat.sendMessage(completionMessage)
          }
          console.log(
            `✅ Trabajo completado: ${completedWork.job_name} por ${user.name} (${user.id}) - Ganó ${completedWork.salary} ravecoins, ${completedWork.experience} XP.`,
          )
        }
      } catch (error) {
        // The transaction should have rolled back automatically on error
        console.error(`Error procesando trabajo completado para ${work.user_id} (ID: ${work.id}):`, error)
        // Optionally, notify admin or try to handle specific errors
      }
    }
  }

  async shutdown() {
    await super.shutdown()
    if (this.cronJob) clearInterval(this.cronJob)
    console.log("🔌 WorkSystemPlugin cron job detenido.")
  }
}
