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
      jobInfo = jobs[userInfo.workType].name
    }

    const balanceText = `*💰 Balance de Ravehub*\n\n👤 *Usuario:* @${jidToNum(jid)}\n💵 *Saldo:* ${userInfo.balance} monedas\n👷‍♂️ *Trabajo actual:* ${jobInfo}\n⭐ *Nivel:* ${userInfo.workLevel}\n📊 *Trabajos realizados:* ${userInfo.totalWorked}`

    await message.send(balanceText, {
      contextInfo: { mentionedJid: [jid] },
    })
  },
)
