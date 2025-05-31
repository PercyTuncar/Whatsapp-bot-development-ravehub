// src/plugins/bank-system/index.js
import { BasePlugin } from "../base-plugin.js"
import moment from "moment"

export default class BankSystemPlugin extends BasePlugin {
  async initialize() {
    await super.initialize()
    this.registerCommand("balance", this.handleBalance, "Muestra tu balance de ravecoins y banco.", false, ["bal"])
    this.registerCommand(
      "deposit",
      this.handleDeposit,
      "Deposita ravecoins (de tu mano) en tu cuenta bancaria. Uso: !deposit <cantidad|all>",
    )
    this.registerCommand(
      "withdraw",
      this.handleWithdraw,
      "Retira ravecoins de tu cuenta bancaria (a tu mano). Uso: !withdraw <cantidad|all>",
    )
    this.registerCommand(
      "transfer",
      this.handleTransfer,
      "Transfiere ravecoins de tu banco a otro usuario. Uso: !transfer <@usuario> <cantidad>",
    )
    this.registerCommand(
      "gift",
      this.handleGift,
      "Regala ravecoins de tu mano a otro usuario. Uso: !gift <@usuario> <cantidad>",
    )
    this.registerCommand("loan", this.handleLoan, "Solicita un préstamo al banco. Uso: !loan <cantidad>")
    this.registerCommand("payloan", this.handlePayLoan, "Paga tu préstamo actual. Uso: !payloan <cantidad|all>")
    this.registerCommand(
      "transactions",
      this.handleTransactions,
      "Muestra tus últimas transacciones bancarias.",
      false,
      ["tx"],
    )
    console.log("🔌 BankSystemPlugin cargado.")
  }

  async handleBalance(message, args, userId) {
    const user = this.db.get("SELECT name, ravecoins, bank_balance, level, experience FROM users WHERE id = ?", [
      userId,
    ])
    if (!user) return message.reply("❌ Error: Usuario no encontrado.")

    const activeWork = this.db.get("SELECT job_name, end_time FROM active_works WHERE user_id = ?", [userId])
    let workStatus = "😴 _No estás trabajando actualmente._"
    if (activeWork) {
      const timeLeft = moment(activeWork.end_time).fromNow(true)
      workStatus = `💼 _Trabajando como ${activeWork.job_name} (termina en ${timeLeft})._`
    }

    const loan = this.db.get(
      "SELECT amount_to_repay, due_date FROM loans WHERE borrower_id = ? AND status = 'active'",
      [userId],
    )
    let loanStatus = "✅ _No tienes préstamos activos._"
    if (loan) {
      const due = moment(loan.due_date).format("DD/MM/YYYY")
      loanStatus = `🏦 _Préstamo activo de \`${loan.amount_to_repay} ravecoins\` (total a pagar). Vence el ${due}._`
    }

    message.reply(
      `🪙 *Balance de ${user.name}*\n\n` +
        `💰 *En mano:* \`${user.ravecoins} ravecoins\`\n` +
        `🏛️ *En banco:* \`${user.bank_balance} ravecoins\`\n` +
        `------------------------------\n` +
        `🏆 *Nivel:* \`${user.level}\` (XP: \`${user.experience}\`)\n` +
        `${workStatus}\n` +
        `${loanStatus}`,
    )
  }

  async handleDeposit(message, args, userId) {
    const amountArg = args[0]
    if (!amountArg) return message.reply("Uso: `!deposit <cantidad|all>`\n_Deposita dinero de tu mano al banco._")

    const user = this.db.get("SELECT ravecoins, bank_balance FROM users WHERE id = ?", [userId])
    if (!user) return message.reply("❌ Error: Usuario no encontrado.")

    let amountToDeposit
    if (amountArg.toLowerCase() === "all") {
      amountToDeposit = user.ravecoins
    } else {
      amountToDeposit = Number.parseInt(amountArg)
      if (isNaN(amountToDeposit) || amountToDeposit <= 0) {
        return message.reply("❌ Cantidad inválida. Debe ser un número positivo.")
      }
    }

    if (amountToDeposit === 0) return message.reply("🤷 No tienes ravecoins en mano para depositar.")
    if (user.ravecoins < amountToDeposit) {
      return message.reply(`❌ No tienes suficientes ravecoins en mano. Tienes \`${user.ravecoins}\`.`)
    }

    const depositTransaction = this.db.transaction(() => {
      this.db.run("UPDATE users SET ravecoins = ravecoins - ?, bank_balance = bank_balance + ? WHERE id = ?", [
        amountToDeposit,
        amountToDeposit,
        userId,
      ])
      this.db.run(
        "INSERT INTO bank_transactions (from_user, to_user, amount, type, description) VALUES (?, ?, ?, ?, ?)",
        [userId, userId, amountToDeposit, "deposit", "Depósito en banco desde mano"],
      )
      return { newBankBalance: user.bank_balance + amountToDeposit, newRavecoins: user.ravecoins - amountToDeposit }
    })

    try {
      const result = depositTransaction()
      message.reply(
        `✅ Depositaste \`${amountToDeposit} ravecoins\` en tu cuenta bancaria.\n` +
          `🏦 _Nuevo saldo en banco:_ \`${result.newBankBalance} ravecoins\`\n` +
          `💰 _Dinero en mano restante:_ \`${result.newRavecoins} ravecoins\``,
      )
    } catch (error) {
      console.error(`Error depositing for ${userId}:`, error)
      message.reply("❌ Error al procesar el depósito.")
    }
  }

  async handleWithdraw(message, args, userId) {
    const amountArg = args[0]
    if (!amountArg) return message.reply("Uso: `!withdraw <cantidad|all>`\n_Retira dinero del banco a tu mano._")

    const user = this.db.get("SELECT ravecoins, bank_balance FROM users WHERE id = ?", [userId])
    if (!user) return message.reply("❌ Error: Usuario no encontrado.")

    let amountToWithdraw
    if (amountArg.toLowerCase() === "all") {
      amountToWithdraw = user.bank_balance
    } else {
      amountToWithdraw = Number.parseInt(amountArg)
      if (isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
        return message.reply("❌ Cantidad inválida. Debe ser un número positivo.")
      }
    }

    if (amountToWithdraw === 0) return message.reply("🤷 No tienes ravecoins en el banco para retirar.")
    if (user.bank_balance < amountToWithdraw) {
      return message.reply(`❌ Fondos insuficientes en el banco. Tienes \`${user.bank_balance}\`.`)
    }

    const withdrawTransaction = this.db.transaction(() => {
      this.db.run("UPDATE users SET ravecoins = ravecoins + ?, bank_balance = bank_balance - ? WHERE id = ?", [
        amountToWithdraw,
        amountToWithdraw,
        userId,
      ])
      this.db.run(
        "INSERT INTO bank_transactions (from_user, to_user, amount, type, description) VALUES (?, ?, ?, ?, ?)",
        [userId, userId, amountToWithdraw, "withdraw", "Retiro del banco a mano"],
      )
      return { newRavecoins: user.ravecoins + amountToWithdraw, newBankBalance: user.bank_balance - amountToWithdraw }
    })

    try {
      const result = withdrawTransaction()
      message.reply(
        `✅ Retiraste \`${amountToWithdraw} ravecoins\` del banco.\n` +
          `💰 _Nuevo saldo en mano:_ \`${result.newRavecoins} ravecoins\`\n` +
          `🏦 _Dinero en banco restante:_ \`${result.newBankBalance} ravecoins\``,
      )
    } catch (error) {
      console.error(`Error withdrawing for ${userId}:`, error)
      message.reply("❌ Error al procesar el retiro.")
    }
  }

  async handleTransfer(message, args, userId) {
    if (args.length < 2) return message.reply("Uso: `!transfer <@usuario> <cantidad>`\n_Transfiere desde tu banco._")

    const mentionedUser = await message.getMentions()
    if (!mentionedUser || mentionedUser.length === 0)
      return message.reply("Debes mencionar a un usuario para transferir.")
    const targetContact = mentionedUser[0]
    const targetUserId = targetContact.id.user
    const targetUserName = targetContact.pushname || targetContact.name || targetUserId

    const amount = Number.parseInt(args[args.length - 1])
    if (isNaN(amount) || amount <= 0) return message.reply("❌ Cantidad inválida.")
    if (targetUserId === userId) return message.reply("❌ No puedes transferirte dinero a ti mismo.")

    const sender = this.db.get("SELECT bank_balance FROM users WHERE id = ?", [userId])
    const receiver = this.db.get("SELECT id, name FROM users WHERE id = ?", [targetUserId])

    if (!sender) return message.reply("❌ Error: Tu usuario no fue encontrado.")
    if (!receiver) return message.reply(`❌ Usuario *${targetUserName}* no encontrado en el sistema.`)
    if (sender.bank_balance < amount)
      return message.reply(`❌ Fondos insuficientes en tu banco. Tienes \`${sender.bank_balance}\`.`)

    const transferTransaction = this.db.transaction(() => {
      this.db.run("UPDATE users SET bank_balance = bank_balance - ? WHERE id = ?", [amount, userId])
      this.db.run("UPDATE users SET bank_balance = bank_balance + ? WHERE id = ?", [amount, targetUserId])
      this.db.run(
        "INSERT INTO bank_transactions (from_user, to_user, amount, type, description) VALUES (?, ?, ?, ?, ?)",
        [userId, targetUserId, amount, "transfer", `Transferencia bancaria a ${receiver.name}`],
      )
    })

    try {
      transferTransaction()
      message.reply(`✅ Transferiste \`${amount} ravecoins\` (de banco a banco) a *${receiver.name}*.`)
      const targetChat = await targetContact.getChat()
      if (targetChat) {
        const senderContact = await message.getContact()
        targetChat.sendMessage(
          `📬 Recibiste una transferencia bancaria de \`${amount} ravecoins\` de *${senderContact.pushname || senderContact.name}*!\n_El dinero ha sido añadido a tu cuenta bancaria._`,
        )
      }
    } catch (error) {
      console.error(`Error transferring from ${userId} to ${targetUserId}:`, error)
      message.reply("❌ Error al procesar la transferencia.")
    }
  }

  async handleGift(message, args, userId) {
    if (args.length < 2) return message.reply("Uso: `!gift <@usuario> <cantidad>`\n_Regala dinero de tu mano._")

    const mentionedUser = await message.getMentions()
    if (!mentionedUser || mentionedUser.length === 0) return message.reply("Debes mencionar a un usuario para regalar.")
    const targetContact = mentionedUser[0]
    const targetUserId = targetContact.id.user
    const targetUserName = targetContact.pushname || targetContact.name || targetUserId

    const amount = Number.parseInt(args[args.length - 1])
    if (isNaN(amount) || amount <= 0) return message.reply("❌ Cantidad inválida.")
    if (targetUserId === userId) return message.reply("❌ No puedes regalarte dinero a ti mismo.")

    const sender = this.db.get("SELECT ravecoins FROM users WHERE id = ?", [userId])
    const receiver = this.db.get("SELECT id, name FROM users WHERE id = ?", [targetUserId])

    if (!sender) return message.reply("❌ Error: Tu usuario no fue encontrado.")
    if (!receiver) return message.reply(`❌ Usuario *${targetUserName}* no encontrado en el sistema.`)
    if (sender.ravecoins < amount)
      return message.reply(`❌ No tienes suficientes ravecoins en mano. Tienes \`${sender.ravecoins}\`.`)

    const giftTransaction = this.db.transaction(() => {
      this.db.run("UPDATE users SET ravecoins = ravecoins - ? WHERE id = ?", [amount, userId])
      this.db.run("UPDATE users SET ravecoins = ravecoins + ? WHERE id = ?", [amount, targetUserId])
      this.db.run(
        "INSERT INTO bank_transactions (from_user, to_user, amount, type, description) VALUES (?, ?, ?, ?, ?)",
        [userId, targetUserId, amount, "gift", `Regalo en mano a ${receiver.name}`],
      )
    })

    try {
      giftTransaction()
      message.reply(`🎁 Regalaste \`${amount} ravecoins\` (de mano a mano) a *${receiver.name}*.`)
      const targetChat = await targetContact.getChat()
      if (targetChat) {
        const senderContact = await message.getContact()
        targetChat.sendMessage(
          `💝 Recibiste un regalo de \`${amount} ravecoins\` de *${senderContact.pushname || senderContact.name}*!\n_El dinero ha sido añadido a tu mano._`,
        )
      }
    } catch (error) {
      console.error(`Error gifting from ${userId} to ${targetUserId}:`, error)
      message.reply("❌ Error al procesar el regalo.")
    }
  }

  async handleLoan(message, args, userId) {
    const amount = Number.parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return message.reply("Uso: `!loan <cantidad>`")

    const user = this.db.get("SELECT level FROM users WHERE id = ?", [userId])
    if (!user) return message.reply("❌ Error: Usuario no encontrado.")

    const existingLoan = this.db.get("SELECT id FROM loans WHERE borrower_id = ? AND status = 'active'", [userId])
    if (existingLoan) return message.reply("❌ Ya tienes un préstamo activo. Paga el actual antes de solicitar otro.")

    const maxLoanAmount = user.level * 1000
    if (amount > maxLoanAmount) {
      return message.reply(`❌ El monto máximo de préstamo para tu nivel es \`${maxLoanAmount} ravecoins\`.`)
    }

    const interestRate = 0.1
    const daysToRepay = 7
    const dueDate = moment().add(daysToRepay, "days").toISOString()
    const amountToRepay = Math.floor(amount * (1 + interestRate))

    const loanTransaction = this.db.transaction(() => {
      this.db.run(
        "INSERT INTO loans (borrower_id, amount, interest_rate, amount_to_repay, due_date, status) VALUES (?, ?, ?, ?, ?, 'active')",
        [userId, amount, interestRate, amountToRepay, dueDate],
      )
      this.db.run("UPDATE users SET ravecoins = ravecoins + ? WHERE id = ?", [amount, userId])
      this.db.run(
        "INSERT INTO bank_transactions (from_user, to_user, amount, type, description) VALUES (?, ?, ?, ?, ?)",
        [null, userId, amount, "loan", `Préstamo del banco por ${amount} (a mano)`],
      )
    })

    try {
      loanTransaction()
      message.reply(
        `🏦 *Préstamo Aprobado*\n\n` +
          `💰 *Recibiste (en mano):* \`${amount} ravecoins\`\n` +
          `📈 *Interés:* \`${interestRate * 100}%\`\n` +
          `💸 *Total a pagar:* \`${amountToRepay} ravecoins\`\n` +
          `📅 *Vencimiento:* ${moment(dueDate).format("DD/MM/YYYY")} (_${daysToRepay} días_)\n\n` +
          `_Usa \`!payloan <cantidad|all>\` para pagar (desde tu dinero en mano)._`,
      )
    } catch (error) {
      console.error(`Error processing loan for ${userId}:`, error)
      message.reply("❌ Error al procesar el préstamo.")
    }
  }

  async handlePayLoan(message, args, userId) {
    const loan = this.db.get(
      "SELECT id, amount, amount_to_repay FROM loans WHERE borrower_id = ? AND status = 'active'",
      [userId],
    )
    if (!loan) return message.reply("🤷 No tienes préstamos activos para pagar.")

    const user = this.db.get("SELECT ravecoins FROM users WHERE id = ?", [userId])
    if (!user) return message.reply("❌ Error: Usuario no encontrado.")

    const amountToRepayInFull = loan.amount_to_repay
    const paymentAmountArg = args[0]
    let paymentAmount

    if (!paymentAmountArg || paymentAmountArg.toLowerCase() === "all") {
      paymentAmount = amountToRepayInFull
    } else {
      paymentAmount = Number.parseInt(paymentAmountArg)
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        return message.reply("❌ Cantidad de pago inválida.")
      }
      // For simplicity, require full payment or 'all'. Partial payments would need more complex loan tracking.
      if (paymentAmount !== amountToRepayInFull) {
        return message.reply(
          `ℹ️ Debes pagar el préstamo en su totalidad (\`${amountToRepayInFull} ravecoins\`). Usa \`!payloan ${amountToRepayInFull}\` o \`!payloan all\`.`,
        )
      }
    }

    if (user.ravecoins < paymentAmount) {
      return message.reply(
        `❌ No tienes suficientes ravecoins en mano para pagar \`${paymentAmount}\`. Tienes \`${user.ravecoins}\`.`,
      )
    }

    const payLoanTransaction = this.db.transaction(() => {
      this.db.run("UPDATE users SET ravecoins = ravecoins - ? WHERE id = ?", [paymentAmount, userId])
      this.db.run("UPDATE loans SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE id = ?", [loan.id])
      this.db.run(
        "INSERT INTO bank_transactions (from_user, to_user, amount, type, description) VALUES (?, ?, ?, ?, ?)",
        [userId, null, paymentAmount, "loan_repayment", `Pago completo de préstamo (desde mano)`],
      )
    })

    try {
      payLoanTransaction()
      message.reply(
        `✅ *¡Préstamo pagado completamente!* Pagaste \`${paymentAmount} ravecoins\` desde tu dinero en mano.`,
      )
    } catch (error) {
      console.error(`Error paying loan for ${userId}, loan ID ${loan.id}:`, error)
      message.reply("❌ Error al procesar el pago del préstamo.")
    }
  }

  async handleTransactions(message, args, userId) {
    const limit = 5
    const transactions = this.db.all(
      `SELECT type, amount, description, datetime(created_at, 'localtime') as time 
       FROM bank_transactions 
       WHERE from_user = ? OR to_user = ? 
       ORDER BY created_at DESC LIMIT ?`,
      [userId, userId, limit],
    )

    if (transactions.length === 0) {
      return message.reply("📜 No tienes transacciones recientes.")
    }

    let response = "📜 *Últimas Transacciones Bancarias*\n\n"
    transactions.forEach((tx) => {
      const formattedTime = moment(tx.time).format("DD/MM HH:mm")
      response += `* \`[${formattedTime}]\` *${tx.type.toUpperCase()}*: \`${tx.amount} ravecoins\`\n`
      response += `   _> ${tx.description || "N/A"}_\n`
    })
    message.reply(response)
  }
}
