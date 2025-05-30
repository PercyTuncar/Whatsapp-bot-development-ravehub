const { bot } = require("../lib/")

bot(
  {
    pattern: "ravehub ?(.*)",
    desc: "Información sobre la comunidad Ravehub",
    type: "info",
  },
  async (message, match, ctx) => {
    const raveInfo = `🎵 *BIENVENIDO A RAVEHUB* 🎵

🌟 *¿Qué es Ravehub?*
Ravehub es una comunidad virtual dedicada a los amantes de la música electrónica. Aquí puedes trabajar, ganar dinero virtual y ser parte de la escena underground.

💼 *Sistema de Trabajos:*
• DJ - Mezcla música en eventos
• Seguridad - Mantén el orden
• Promotor - Organiza fiestas épicas  
• Dealer - Mercado underground

💰 *Economía Virtual:*
Gana monedas trabajando y sube de nivel para obtener mejores salarios.

🎶 *Únete a la revolución electrónica!*

Usa !help para ver todos los comandos disponibles.`

    await message.send(raveInfo)
  },
)
