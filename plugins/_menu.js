const { addSpace, textToStylist, getUptime, getRam, getDate, getPlatform, bot, lang } = require("../lib/")

bot(
  {
    pattern: "help ?(.*)",
    dontAddCommandList: true,
  },
  async (message, match, ctx) => {
    const sorted = ctx.commands
      .slice()
      .sort((a, b) => (a.pattern && b.pattern ? a.pattern.localeCompare(b.pattern) : 0))

    const [date, time] = getDate()

    const CMD_HELP = [
      lang.plugins.menu.help.format(
        ctx.PREFIX,
        message.pushName,
        time,
        date.toLocaleString("es", { weekday: "long" }),
        date.toLocaleDateString("es"),
        ctx.VERSION,
        ctx.pluginsCount,
        getRam(),
        getUptime("t"),
        getPlatform(),
      ),
      "╭────────────────",
    ]

    sorted.forEach((command, i) => {
      if (!command.dontAddCommandList && command.pattern !== undefined) {
        CMD_HELP.push(
          `│ ${i + 1} ${addSpace(i + 1, sorted.length)}${textToStylist(
            command.pattern.toString().toUpperCase(),
            "mono",
          )}`,
        )
      }
    })

    CMD_HELP.push("╰────────────────")

    return await message.send(CMD_HELP.join("\n"))
  },
)

bot(
  {
    pattern: "menu ?(.*)",
    dontAddCommandList: true,
  },
  async (message, match, ctx) => {
    const commands = {}

    ctx.commands.forEach((command) => {
      if (!command.dontAddCommandList && command.pattern !== undefined) {
        const cmdType = command.type.toLowerCase()
        if (!commands[cmdType]) commands[cmdType] = []

        const cmd = command.pattern.toString().trim()
        commands[cmdType].push(cmd)
      }
    })

    const sortedCommandKeys = Object.keys(commands).sort()

    const [date, time] = getDate()
    let msg = lang.plugins.menu.menu.format(
      ctx.PREFIX,
      message.pushName,
      time,
      date.toLocaleString("es", { weekday: "long" }),
      date.toLocaleDateString("es"),
      ctx.VERSION,
      ctx.pluginsCount,
      getRam(),
      getUptime("t"),
      getPlatform(),
    )

    msg += "\n"

    if (match && commands[match]) {
      msg += ` ╭─❏ ${textToStylist(match.toLowerCase(), "smallcaps")} ❏\n`
      commands[match]
        .sort((a, b) => a.localeCompare(b))
        .forEach((plugin) => {
          msg += ` │ ${textToStylist(plugin.toUpperCase(), "mono")}\n`
        })
      msg += ` ╰─────────────────`
      return await message.send(msg)
    }

    for (const command of sortedCommandKeys) {
      msg += ` ╭─❏ ${textToStylist(command.toLowerCase(), "smallcaps")} ❏\n`
      commands[command]
        .sort((a, b) => a.localeCompare(b))
        .forEach((plugin) => {
          msg += ` │ ${textToStylist(plugin.toUpperCase(), "mono")}\n`
        })
      msg += ` ╰─────────────────\n`
    }

    await message.send(msg.trim())
  },
)
