const { bot, work, jobs, lang } = require("../lib/")

bot(
  {
    pattern: "work ?(.*)",
    desc: lang.plugins.work.desc,
    type: "economy",
  },
  async (message, match, ctx) => {
    const jid = message.key.participant || message.key.remoteJid

    if (!match) {
      const jobList = Object.entries(jobs)
        .map(([id, job]) => {
          return `${job.emoji} !work ${id} - *${job.name}*\n   ${job.description}`
        })
        .join("\n\n")

      return await message.send(
        `🏙️ *Trabajos en Ravehub*\n\n${jobList}\n\n💡 *Tip:* Cada trabajo tiene diferentes salarios y puedes subir de nivel trabajando.\n⏰ *Cooldown:* 1 hora entre trabajos`,
      )
    }

    const jobType = match.toLowerCase().trim()
    const result = await work(jid, jobType)

    await message.send(result.message)
  },
)
