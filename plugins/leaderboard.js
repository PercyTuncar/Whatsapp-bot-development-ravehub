const { bot, RavehubUser, jidToNum } = require("../lib/")

bot(
  {
    pattern: "top ?(.*)",
    desc: "🏆 Muestra el ranking de usuarios de Ravehub",
    type: "economy",
  },
  async (message, match, ctx) => {
    try {
      const topUsers = await RavehubUser.findAll({
        order: [["balance", "DESC"]],
        limit: 10,
      })

      if (topUsers.length === 0) {
        return await message.send("📊 Aún no hay usuarios en el ranking de Ravehub.")
      }

      let leaderboard = "🏆 *TOP 10 RAVEHUB* 🏆\n\n"

      topUsers.forEach((user, index) => {
        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`
        leaderboard += `${medal} @${jidToNum(user.jid)}\n💰 ${user.balance} monedas | 🏆 ${user.reputation} rep\n\n`
      })

      const mentions = topUsers.map((user) => user.jid)

      await message.send(leaderboard, {
        contextInfo: { mentionedJid: mentions },
      })
    } catch (error) {
      await message.send("❌ Error al obtener el ranking.")
    }
  },
)
