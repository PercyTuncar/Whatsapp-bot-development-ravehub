// src/plugins/base-plugin.js
export class BasePlugin {
  constructor(pluginManager, context) {
    this.pluginManager = pluginManager
    this.client = context.client
    this.db = context.db
    this.app = context.app // Express app instance
    this.config = context.config
    this.eventEmitter = context.eventEmitter
    this.commands = new Map() // Store commands: name -> { handler, description, adminOnly }
  }

  // Called when the plugin is loaded
  async initialize() {
    // To be implemented by subclasses
    console.log(`🔌 Plugin ${this.constructor.name} initialized.`)
  }

  // Register a command
  registerCommand(name, handler, description = "", adminOnly = false, aliases = []) {
    if (this.commands.has(name)) {
      console.warn(`⚠️ Command "${name}" is already registered in ${this.constructor.name}. Overwriting.`)
    }
    const commandData = { handler: handler.bind(this), description, adminOnly, aliases }
    this.commands.set(name, commandData)
    for (const alias of aliases) {
      if (this.commands.has(alias)) {
        console.warn(
          `⚠️ Alias "${alias}" for command "${name}" is already registered in ${this.constructor.name}. Overwriting.`,
        )
      }
      this.commands.set(alias, commandData)
    }
  }

  // Get all registered commands for this plugin
  getCommands() {
    return this.commands
  }

  // To be called by PluginManager to handle a message
  async handleMessage(message, command, args, userId, userName, isAdmin) {
    const cmdEntry = this.commands.get(command)
    if (cmdEntry) {
      if (cmdEntry.adminOnly && !isAdmin) {
        await message.reply("❌ Este comando es solo para *administradores*.")
        return true // Command recognized but not authorized
      }
      try {
        await cmdEntry.handler(message, args, userId, userName, isAdmin)
      } catch (error) {
        console.error(`Error executing command "${command}" in plugin ${this.constructor.name}:`, error)
        await message.reply(`❌ Ocurrió un error al ejecutar el comando \`!${command}\`.`)
      }
      return true // Command handled
    }
    return false // Command not handled by this plugin
  }

  // Register API routes
  registerRoutes() {
    // To be implemented by subclasses if they need to expose API endpoints
    // Example: this.app.get(`/api/${this.constructor.name.toLowerCase()}/status`, (req, res) => { ... });
  }

  // Called when the bot is shutting down
  async shutdown() {
    // To be implemented by subclasses for cleanup
    console.log(`🔌 Plugin ${this.constructor.name} shutting down.`)
  }
}
