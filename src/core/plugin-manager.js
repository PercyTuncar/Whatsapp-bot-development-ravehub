// src/core/plugin-manager.js
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class PluginManager {
  constructor(context) {
    this.plugins = []
    this.context = context // { client, db, app, config, eventEmitter }
    this.commands = new Map() // Global command registry: commandName -> pluginInstance
    this.helpRegistry = [] // { command, description, pluginName }
  }

  async loadPlugins(pluginsDirectory = path.join(__dirname, "..", "plugins")) {
    console.log(`📂 Loading plugins from: ${pluginsDirectory}`)
    const pluginFolders = fs
      .readdirSync(pluginsDirectory, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    for (const folderName of pluginFolders) {
      if (folderName === "base-plugin.js") continue // Skip base class file if it's in the root

      const pluginPath = path.join(pluginsDirectory, folderName, "index.js")
      if (fs.existsSync(pluginPath)) {
        try {
          const { default: PluginClass } = await import(pluginPath)
          if (typeof PluginClass === "function") {
            const pluginInstance = new PluginClass(this, this.context)
            await pluginInstance.initialize()
            pluginInstance.registerRoutes() // Allow plugin to register its Express routes
            this.plugins.push(pluginInstance)
            this.registerPluginCommands(pluginInstance)
            console.log(`✅ Plugin "${pluginInstance.constructor.name}" loaded successfully.`)
          } else {
            console.warn(`⚠️ No default export or not a class in ${pluginPath}`)
          }
        } catch (error) {
          console.error(`❌ Error loading plugin from ${pluginPath}:`, error)
        }
      } else {
        console.warn(`⚠️ No index.js found in plugin folder: ${folderName}`)
      }
    }
    this.buildHelpRegistry()
  }

  registerPluginCommands(pluginInstance) {
    const pluginCommands = pluginInstance.getCommands()
    pluginCommands.forEach((cmdData, cmdName) => {
      if (this.commands.has(cmdName)) {
        const existingPlugin = this.commands.get(cmdName).constructor.name
        console.warn(
          `🚨 Command "!${cmdName}" conflict: Already registered by "${existingPlugin}". Overwritten by "${pluginInstance.constructor.name}".`,
        )
      }
      this.commands.set(cmdName, pluginInstance)
    })
  }

  buildHelpRegistry() {
    this.helpRegistry = []
    for (const plugin of this.plugins) {
      plugin.getCommands().forEach((cmdData, cmdName) => {
        // Avoid adding aliases to the main help registry to prevent clutter,
        // unless they are explicitly marked as primary commands or handled differently.
        // For now, only add the primary command name.
        if (
          !cmdData.aliases ||
          !cmdData.aliases.includes(cmdName) ||
          cmdName === Array.from(plugin.getCommands().keys()).find((key) => plugin.getCommands().get(key) === cmdData)
        ) {
          this.helpRegistry.push({
            command: `!${cmdName}`,
            description: cmdData.description || "No description available.",
            pluginName: plugin.constructor.name,
            adminOnly: cmdData.adminOnly || false,
          })
        }
      })
    }
    // Sort help by command name
    this.helpRegistry.sort((a, b) => a.command.localeCompare(b.command))
  }

  getHelpMessages() {
    return this.helpRegistry
  }

  async handleMessage(message) {
    const messageBody = message.body.trim()
    if (!messageBody.startsWith("!")) return // Only process commands

    const [commandWithPrefix, ...args] = messageBody.split(" ")
    const command = commandWithPrefix.substring(1).toLowerCase()

    const contact = await message.getContact()
    const userId = contact.id.user
    const userName = contact.pushname || contact.name || userId

    // Ensure user exists in DB
    try {
      this.context.db.run(`INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)`, [userId, userName])
      this.context.db.run(`UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?`, [userId])
    } catch (dbError) {
      console.error(`Failed to register/update user ${userId} (${userName}):`, dbError)
      // Decide if you want to reply to the user about a DB error or just log it.
    }

    const userRecord = this.context.db.get("SELECT is_admin FROM users WHERE id = ?", [userId])

    if (!userRecord) {
      // This case should ideally not happen if the INSERT OR IGNORE worked and the subsequent SELECT is valid.
      // It might indicate a more severe DB issue or an unexpected state.
      console.error(
        `CRITICAL: User record for ${userId} (${userName}) not found in DB after attempting creation/update. Aborting command processing for this message.`,
      )
      await message.reply(
        "❌ Ocurrió un error crítico al procesar tu información. Por favor, contacta al *administrador*.",
      )
      return // Stop further processing for this message
    }

    const isAdmin = Boolean(userRecord.is_admin)

    const pluginInstance = this.commands.get(command)
    if (pluginInstance) {
      await pluginInstance.handleMessage(message, command, args, userId, userName, isAdmin)
    } else {
      // Optional: reply if command is not found
      // await message.reply(`❓ Comando \`!${command}\` no reconocido. Escribe \`!help\` para ver los comandos disponibles.`);
    }
  }

  async shutdownPlugins() {
    for (const plugin of this.plugins) {
      if (typeof plugin.shutdown === "function") {
        await plugin.shutdown()
      }
    }
    console.log("🔌 All plugins shut down.")
  }
}
