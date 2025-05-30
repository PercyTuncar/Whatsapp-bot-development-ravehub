const { bot, getBalance, jobs, jidToNum, lang } = require("../lib/")

bot(
  {
    pattern: "balance ?(.*)",
    desc: lang.plugins.balance.desc,
    type: "economy",
  },
  async (message, match, ctx) => {
    const jid = message.key.participant || message.key.remoteJid
    const userInfo = await getBalance(jid)

    let jobInfo = "Ninguno"
    if (userInfo.workType && jobs[userInfo.workType]) {
      const job = jobs[userInfo.workType]
      jobInfo = `${job.emoji} ${job.name}`
    }

    const balanceText = `*💰 Balance de Ravehub*\n\n👤 *Usuario:* @${jidToNum(jid)}\n💵 *Saldo:* ${userInfo.balance} monedas\n👷‍♂️ *Trabajo actual:* ${jobInfo}\n⭐ *Nivel:* ${userInfo.workLevel}\n📊 *Trabajos realizados:* ${userInfo.totalWorked}\n🏆 *Reputación:* ${userInfo.reputation}\n📅 *Miembro desde:* ${new Date(userInfo.joinDate).toLocaleDateString("es")}`

    await message.send(balanceText, {
      contextInfo: { mentionedJid: [jid] },
    })
  },
)
