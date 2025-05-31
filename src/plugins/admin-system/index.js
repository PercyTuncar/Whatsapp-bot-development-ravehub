// src/plugins/admin-system/index.js
import { BasePlugin } from "../base-plugin.js"

export default class AdminSystemPlugin extends BasePlugin {
  async initialize() {
    await super.initialize()
    this.registerCommand(
      "setadmin",
      this.handleSetAdmin,
      "Otorga/revoca permisos de admin. Uso: !setadmin <@usuario> <true|false>",
      true,
    )
    this.registerCommand("listusers", this.handleListUsers, "Lista todos los usuarios registrados.", true)
    this.registerCommand(
      "givecoins",
      this.handleGiveCoins,
      "Da ravecoins (en mano) a un usuario. Uso: !givecoins <@usuario> <cantidad>",
      true,
    )
    this.registerCommand(
      "takecoins",
      this.handleTakeCoins,
      "Quita ravecoins (en mano) a un usuario. Uso: !takecoins <@usuario> <cantidad>",
      true,
    )
    this.registerCommand(
      "setlevel",
      this.handleSetLevel,
      "Establece el nivel de un usuario. Uso: !setlevel <@usuario> <nivel>",
      true,
    )
    this.registerCommand("banuser", this.handleBanUser, "Simula banear a un usuario. Uso: !banuser <@usuario>", true)
    this.registerCommand(
      "sysmsg",
      this.handleSystemMessage,
      "Envía un mensaje a todos los usuarios activos. Uso: !sysmsg <mensaje>",
      true,
    )
    console.log("🔌 AdminSystemPlugin cargado.")
  }

  async handleSetAdmin(message, args) {
    const userId = message.author // Declare userId variable
    const userName = message.author.name || message.author.pushname || message.author.id.user // Declare userName variable

    if (args.length < 2) return message.reply("Uso: `!setadmin <@usuario> <true|false>`")
    const mentionedUsers = await message.getMentions()
    if (!mentionedUsers || mentionedUsers.length === 0) return message.reply("Debes mencionar a un usuario.")
    const targetContact = mentionedUsers[0]
    const targetUserId = targetContact.id.user
    const targetUserName = targetContact.pushname || targetContact.name || targetUserId
    const isAdminFlag = args[args.length - 1].toLowerCase() === "true" ? 1 : 0

    try {
      const targetUser = this.db.get("SELECT id FROM users WHERE id = ?", [targetUserId])
      if (!targetUser) return message.reply(`❌ Usuario *${targetUserName}* no encontrado en el sistema.`)

      this.db.run("UPDATE users SET is_admin = ? WHERE id = ?", [isAdminFlag, targetUserId])
      this.db.run("INSERT INTO system_events (event_type, user_id, target_id, description) VALUES (?, ?, ?, ?)", [
        "admin_action",
        userId,
        targetUserId,
        `Admin status for ${targetUserName} set to ${isAdminFlag}`,
      ])
      message.reply(
        `✅ Permisos de administrador ${isAdminFlag ? "*otorgados a*" : "*revocados de*"} *${targetUserName}*.`,
      )
    } catch (error) {
      console.error(`Error setting admin for ${targetUserId} by ${userId}:`, error)
      message.reply("❌ Error al actualizar los permisos de administrador.")
    }
  }

  async handleListUsers(message) {
    try {
      const users = this.db.all(
        "SELECT id, name, ravecoins, bank_balance, level, is_admin FROM users ORDER BY level DESC, ravecoins DESC LIMIT 20",
      )
      if (users.length === 0) return message.reply("No hay usuarios registrados.")
      let response = "👥 *Usuarios Registrados (Top 20)*\n\n"
      users.forEach((u) => {
        response += `* ${u.name}* (\`${u.id.substring(0, 6)}...\`)\n`
        response += `   - En Mano: \`${u.ravecoins}\` | Banco: \`${u.bank_balance}\`\n`
        response += `   - Nivel: \`${u.level}\` ${u.is_admin ? "👑 _(Admin)_" : ""}\n`
      })
      message.reply(response)
    } catch (error) {
      console.error("Error listing users:", error)
      message.reply("❌ Error al listar usuarios.")
    }
  }

  async handleGiveCoins(message, args) {
    const userId = message.author // Declare userId variable
    const userName = message.author.name || message.author.pushname || message.author.id.user // Declare userName variable

    if (args.length < 2) return message.reply("Uso: `!givecoins <@usuario> <cantidad>`")
    const mentionedUsers = await message.getMentions()
    if (!mentionedUsers || mentionedUsers.length === 0) return message.reply("Debes mencionar a un usuario.")
    const targetContact = mentionedUsers[0]
    const targetUserId = targetContact.id.user
    const targetUserName = targetContact.pushname || targetContact.name || targetUserId
    const amount = Number.parseInt(args[args.length - 1])
    if (isNaN(amount) || amount <= 0) return message.reply("❌ Cantidad inválida.")

    const giveCoinsTransaction = this.db.transaction(() => {
      const targetUser = this.db.get("SELECT id FROM users WHERE id = ?", [targetUserId])
      if (!targetUser) throw new Error(`User ${targetUserName} not found`)

      this.db.run("UPDATE users SET ravecoins = ravecoins + ? WHERE id = ?", [amount, targetUserId])
      this.db.run(
        "INSERT INTO bank_transactions (from_user, to_user, amount, type, description) VALUES (?, ?, ?, ?, ?)",
        [null, targetUserId, amount, "admin_gift", `Admin otorgó ${amount} ravecoins (en mano)`],
      )
      this.db.run(
        "INSERT INTO system_events (event_type, user_id, target_id, amount, description) VALUES (?, ?, ?, ?, ?)",
        ["admin_action", userId, targetUserId, amount, `Admin ${userName} gave ${amount} coins to ${targetUserName}`],
      )
    })

    try {
      giveCoinsTransaction()
      message.reply(`✅ \`${amount} ravecoins\` otorgados a *${targetUserName}* (en mano).`)
      const targetChat = await targetContact.getChat()
      if (targetChat) {
        targetChat.sendMessage(`🎉 ¡El Admin te ha otorgado \`${amount} ravecoins\` (en mano)!`)
      }
    } catch (error) {
      console.error(`Error giving coins to ${targetUserId} by ${userId}:`, error)
      if (error.message.includes("not found")) return message.reply(`❌ Usuario *${targetUserName}* no encontrado.`)
      message.reply("❌ Error al otorgar ravecoins.")
    }
  }

  async handleTakeCoins(message, args) {
    const userId = message.author // Declare userId variable
    const userName = message.author.name || message.author.pushname || message.author.id.user // Declare userName variable

    if (args.length < 2) return message.reply("Uso: `!takecoins <@usuario> <cantidad>`")
    const mentionedUsers = await message.getMentions()
    if (!mentionedUsers || mentionedUsers.length === 0) return message.reply("Debes mencionar a un usuario.")
    const targetContact = mentionedUsers[0]
    const targetUserId = targetContact.id.user
    const targetUserName = targetContact.pushname || targetContact.name || targetUserId
    const amount = Number.parseInt(args[args.length - 1])
    if (isNaN(amount) || amount <= 0) return message.reply("❌ Cantidad inválida.")

    const takeCoinsTransaction = this.db.transaction(() => {
      const targetUser = this.db.get("SELECT ravecoins FROM users WHERE id = ?", [targetUserId])
      if (!targetUser) throw new Error(`User ${targetUserName} not found`)

      const finalAmount = Math.min(amount, targetUser.ravecoins)
      this.db.run("UPDATE users SET ravecoins = ravecoins - ? WHERE id = ?", [finalAmount, targetUserId])
      this.db.run(
        "INSERT INTO bank_transactions (from_user, to_user, amount, type, description) VALUES (?, ?, ?, ?, ?)",
        [targetUserId, null, finalAmount, "admin_confiscate", `Admin confiscó ${finalAmount} ravecoins (de mano)`],
      )
      this.db.run(
        "INSERT INTO system_events (event_type, user_id, target_id, amount, description) VALUES (?, ?, ?, ?, ?)",
        [
          "admin_action",
          userId,
          targetUserId,
          finalAmount,
          `Admin ${userName} took ${finalAmount} coins from ${targetUserName}`,
        ],
      )
      return finalAmount
    })

    try {
      const finalAmount = takeCoinsTransaction()
      message.reply(`✅ \`${finalAmount} ravecoins\` confiscados de *${targetUserName}* (de su dinero en mano).`)
      const targetChat = await targetContact.getChat()
      if (targetChat) {
        targetChat.sendMessage(`⚠️ ¡El Admin te ha confiscado \`${finalAmount} ravecoins\` de tu dinero en mano!`)
      }
    } catch (error) {
      console.error(`Error taking coins from ${targetUserId} by ${userId}:`, error)
      if (error.message.includes("not found")) return message.reply(`❌ Usuario *${targetUserName}* no encontrado.`)
      message.reply("❌ Error al confiscar ravecoins.")
    }
  }

  async handleSetLevel(message, args) {
    const userId = message.author // Declare userId variable
    const userName = message.author.name || message.author.pushname || message.author.id.user // Declare userName variable

    if (args.length < 2) return message.reply("Uso: `!setlevel <@usuario> <nivel>`")
    const mentionedUsers = await message.getMentions()
    if (!mentionedUsers || mentionedUsers.length === 0) return message.reply("Debes mencionar a un usuario.")
    const targetContact = mentionedUsers[0]
    const targetUserId = targetContact.id.user
    const targetUserName = targetContact.pushname || targetContact.name || targetUserId
    const level = Number.parseInt(args[args.length - 1])
    if (isNaN(level) || level < 1) return message.reply("❌ Nivel inválido. Debe ser 1 o mayor.")
    const experience = (level - 1) * 100

    const setLevelTransaction = this.db.transaction(() => {
      const targetUser = this.db.get("SELECT id FROM users WHERE id = ?", [targetUserId])
      if (!targetUser) throw new Error(`User ${targetUserName} not found`)

      this.db.run("UPDATE users SET level = ?, experience = ? WHERE id = ?", [level, experience, targetUserId])
      this.db.run(
        "INSERT INTO system_events (event_type, user_id, target_id, amount, description) VALUES (?, ?, ?, ?, ?)",
        ["admin_action", userId, targetUserId, level, `Admin ${userName} set level of ${targetUserName} to ${level}`],
      )
    })

    try {
      setLevelTransaction()
      message.reply(`✅ Nivel de *${targetUserName}* establecido a \`${level}\` (XP ajustado a \`${experience}\`).`)
      const targetChat = await targetContact.getChat()
      if (targetChat) {
        targetChat.sendMessage(`✨ ¡El Admin ha ajustado tu nivel a \`${level}\`!`)
      }
    } catch (error) {
      console.error(`Error setting level for ${targetUserId} by ${userId}:`, error)
      if (error.message.includes("not found")) return message.reply(`❌ Usuario *${targetUserName}* no encontrado.`)
      message.reply("❌ Error al establecer el nivel.")
    }
  }

  async handleBanUser(message, args) {
    const userId = message.author // Declare userId variable
    const userName = message.author.name || message.author.pushname || message.author.id.user // Declare userName variable

    if (args.length < 1) return message.reply("Uso: `!banuser <@usuario>`")
    const mentionedUsers = await message.getMentions()
    if (!mentionedUsers || mentionedUsers.length === 0) return message.reply("Debes mencionar a un usuario.")
    const targetContact = mentionedUsers[0]
    const targetUserId = targetContact.id.user
    const targetUserName = targetContact.pushname || targetContact.name || targetUserId

    const banUserTransaction = this.db.transaction(() => {
      const targetUser = this.db.get("SELECT id FROM users WHERE id = ?", [targetUserId])
      if (!targetUser) throw new Error(`User ${targetUserName} not found`)

      this.db.run("UPDATE users SET reputation = 0, ravecoins = 0, bank_balance = 0, is_admin = 0 WHERE id = ?", [
        targetUserId,
      ]) // Also revokes admin
      this.db.run("DELETE FROM active_works WHERE user_id = ?", [targetUserId])
      this.db.run("DELETE FROM loans WHERE borrower_id = ? AND status = 'active'", [targetUserId]) // Cancel active loans
      this.db.run("INSERT INTO system_events (event_type, user_id, target_id, description) VALUES (?, ?, ?, ?)", [
        "admin_action",
        userId,
        targetUserId,
        `Admin ${userName} banned ${targetUserName}`,
      ])
    })

    try {
      banUserTransaction()
      message.reply(
        `🚫 Usuario *${targetUserName}* ha sido ~baneado~ (reputación y fondos a \`0\`, trabajo y préstamos cancelados, admin revocado).`,
      )
      const targetChat = await targetContact.getChat()
      if (targetChat) {
        targetChat.sendMessage(`🛑 *Has sido baneado del sistema RaveHub por un administrador.*`)
      }
    } catch (error) {
      console.error(`Error banning ${targetUserId} by ${userId}:`, error)
      if (error.message.includes("not found")) return message.reply(`❌ Usuario *${targetUserName}* no encontrado.`)
      message.reply("❌ Error al banear al usuario.")
    }
  }

  async handleSystemMessage(message, args) {
    const userId = message.author // Declare userId variable
    const userName = message.author.name || message.author.pushname || message.author.id.user // Declare userName variable

    const systemMessage = args.join(" ")
    if (!systemMessage) return message.reply("Uso: `!sysmsg <mensaje>`")

    try {
      const chats = await this.client.getChats()
      let count = 0
      await message.reply(`📢 _Enviando mensaje del sistema a los usuarios..._`)
      for (const chat of chats) {
        if (!chat.isGroup && chat.id.server === "c.us") {
          try {
            // Check if user exists in DB to avoid messaging non-users or banned users if desired
            // const userExists = this.db.get("SELECT id FROM users WHERE id = ?", [chat.id.user]);
            // if (!userExists) continue;

            await chat.sendMessage(`🔔 *Mensaje del Sistema RaveHub:*\n\n> ${systemMessage}`)
            count++
            await new Promise((resolve) => setTimeout(resolve, 250)) // Slightly increased delay
          } catch (e) {
            console.warn(`Failed to send sysmsg to ${chat.id._serialized}: ${e.message}`)
          }
        }
      }
      this.db.run("INSERT INTO system_events (event_type, user_id, description) VALUES (?, ?, ?)", [
        "admin_action",
        userId,
        `Admin ${userName} sent system message: ${systemMessage}`,
      ])
      await message.reply(`✅ Mensaje del sistema enviado a \`${count}\` usuarios.`)
    } catch (error) {
      console.error(`Error sending system message by ${userId}:`, error)
      message.reply("❌ Error al enviar el mensaje del sistema.")
    }
  }
}
