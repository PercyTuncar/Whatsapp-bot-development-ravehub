// src/plugins/robbery-system/index.js
import { BasePlugin } from "../base-plugin.js"
import moment from "moment"

const ROB_COOLDOWN_MINUTES = 15
const userRobberyCooldowns = new Map()

export default class RobberySystemPlugin extends BasePlugin {
  async initialize() {
    await super.initialize()
    this.registerCommand("rob", this.handleRob, "Intenta robar ravecoins a otro usuario. Uso: !rob <@usuario>")
    console.log("🔌 RobberySystemPlugin cargado.")
  }

  async handleRob(message, args, userId, userName) {
    const lastRobAttempt = userRobberyCooldowns.get(userId)
    if (lastRobAttempt && moment().diff(moment(lastRobAttempt), "minutes") < ROB_COOLDOWN_MINUTES) {
      const timeLeft = ROB_COOLDOWN_MINUTES - moment().diff(moment(lastRobAttempt), "minutes")
      return message.reply(`⏳ Debes esperar *${timeLeft} minuto(s)* más antes de intentar otro robo.`)
    }

    const mentionedUsers = await message.getMentions()
    if (!mentionedUsers || mentionedUsers.length === 0) {
      return message.reply("Debes mencionar a un usuario para robar. Uso: `!rob <@usuario>`")
    }
    const targetContact = mentionedUsers[0]
    const targetUserId = targetContact.id.user
    const targetUserName = targetContact.pushname || targetContact.name || targetUserId

    if (targetUserId === userId) {
      return message.reply("❌ No puedes robarte a ti mismo, ¡listillo!")
    }

    const robber = this.db.get("SELECT id, name, level, ravecoins, reputation FROM users WHERE id = ?", [userId])
    const target = this.db.get("SELECT id, name, level, ravecoins, reputation FROM users WHERE id = ?", [targetUserId])

    if (!robber) return message.reply("❌ Error: Tu usuario no fue encontrado.")
    if (!target) return message.reply(`❌ Usuario *${targetUserName}* no encontrado en el sistema.`)

    if (target.ravecoins < 50) {
      userRobberyCooldowns.set(userId, moment().valueOf())
      return message.reply(
        `😅 *${target.name}* parece estar en la quiebra (menos de \`50 ravecoins\`). No vale la pena el riesgo.`,
      )
    }

    userRobberyCooldowns.set(userId, moment().valueOf())

    let successChance = 0.3 + (robber.level - target.level) * 0.05 + (robber.reputation - target.reputation) * 0.001
    successChance = Math.max(0.1, Math.min(0.8, successChance))

    const isSuccessful = Math.random() < successChance

    if (isSuccessful) {
      const maxStealPercentage = 0.25
      const stolenAmount = Math.min(
        Math.floor(target.ravecoins * (Math.random() * maxStealPercentage + 0.05)),
        robber.level * 100,
      )

      if (stolenAmount <= 0) {
        return message.reply(
          `😅 *${target.name}* no tenía suficiente para que el robo fuera significativo. Mejor suerte la próxima vez.`,
        )
      }

      const robberySuccessTransaction = this.db.transaction(() => {
        this.db.run("UPDATE users SET ravecoins = ravecoins - ? WHERE id = ?", [stolenAmount, targetUserId]) // Target loses cash
        this.db.run(
          "UPDATE users SET ravecoins = ravecoins + ?, total_stolen = total_stolen + ?, reputation = reputation - 5 WHERE id = ?",
          [stolenAmount, stolenAmount, userId],
        ) // Robber gains cash, total_stolen, loses rep
        this.db.run("UPDATE users SET times_robbed = times_robbed + 1, reputation = reputation + 2 WHERE id = ?", [
          targetUserId,
        ]) // Target gets robbed count, gains some rep

        // Bank transaction for victim (loss)
        this.db.run(
          "INSERT INTO bank_transactions (from_user, to_user, amount, type, description) VALUES (?, ?, ?, ?, ?)",
          [targetUserId, null, stolenAmount, "robbery_victim", `Robado por ${robber.name}`],
        )
        // Bank transaction for robber (gain) - could be seen as income
        this.db.run(
          "INSERT INTO bank_transactions (from_user, to_user, amount, type, description) VALUES (?, ?, ?, ?, ?)",
          [null, userId, stolenAmount, "robbery_success", `Robo a ${target.name}`],
        )

        this.db.run(
          "INSERT INTO system_events (event_type, user_id, target_id, amount, description) VALUES (?, ?, ?, ?, ?)",
          ["robbery_success", userId, targetUserId, stolenAmount, `Robo exitoso de ${robber.name} a ${target.name}`],
        )
      })

      try {
        robberySuccessTransaction()
        message.reply(
          `💰 *¡ROBO EXITOSO!* Le robaste \`${stolenAmount} ravecoins\` a *${target.name}*.\n_Tu reputación ha bajado un poco._`,
        )
        const targetChat = await targetContact.getChat()
        if (targetChat) {
          targetChat.sendMessage(`🚨 *¡Te han robado!* ${robber.name} te quitó \`${stolenAmount} ravecoins\`.`)
        }
      } catch (error) {
        console.error(`Error processing successful robbery from ${userId} to ${targetUserId}:`, error)
        message.reply("❌ Error crítico durante el robo. El admin ha sido notificado.")
      }
    } else {
      const finePercentage = 0.1
      const fineAmount = Math.min(Math.floor(robber.ravecoins * finePercentage), 200)
      let replyMessage = `🚨 *¡ROBO FALLIDO!* ${target.name} se defendió o la seguridad te atrapó.`

      const robberyFailedTransaction = this.db.transaction(() => {
        this.db.run("UPDATE users SET reputation = reputation - 10 WHERE id = ?", [userId]) // Robber loses more rep for failure
        if (fineAmount > 0) {
          this.db.run("UPDATE users SET ravecoins = ravecoins - ? WHERE id = ?", [fineAmount, userId])
          this.db.run(
            "INSERT INTO bank_transactions (from_user, to_user, amount, type, description) VALUES (?, ?, ?, ?, ?)",
            [userId, null, fineAmount, "fine", `Multa por intento de robo fallido a ${target.name}`],
          )
          this.db.run(
            "INSERT INTO system_events (event_type, user_id, target_id, amount, description) VALUES (?, ?, ?, ?, ?)",
            [
              "robbery_failed",
              userId,
              targetUserId,
              fineAmount,
              `Intento de robo fallido de ${robber.name} a ${target.name}, multado con ${fineAmount}`,
            ],
          )
        } else {
          this.db.run(
            "INSERT INTO system_events (event_type, user_id, target_id, amount, description) VALUES (?, ?, ?, ?, ?)",
            [
              "robbery_failed",
              userId,
              targetUserId,
              0,
              `Intento de robo fallido de ${robber.name} a ${target.name}, sin multa`,
            ],
          )
        }
      })

      try {
        robberyFailedTransaction()
        if (fineAmount > 0) {
          replyMessage += `\n💸 Has sido multado con \`${fineAmount} ravecoins\` y tu reputación ha caído.`
        } else {
          replyMessage +=
            "\n_Tu reputación ha caído. Por suerte para ti, no tenías suficiente para una multa significativa._"
        }
      } catch (error) {
        console.error(`Error processing failed robbery for ${userId} targeting ${targetUserId}:`, error)
        replyMessage += "\n⚠️ _No se pudo aplicar la penalización debido a un error del sistema._"
      }
      message.reply(replyMessage)
    }
  }
}
