// src/core/server.js
import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class WebServer {
  constructor(port, context) {
    // context: { client, db, config, pluginManager, whatsAppBot }
    this.port = port
    this.context = context
    this.app = express()
    this.server = null

    this.app.use(cors())
    this.app.use(express.json())
    // Serve static files from a 'public' directory if you have one
    this.app.use(express.static(path.join(__dirname, "..", "..", "public")))

    this.setupCoreRoutes()
  }

  setupCoreRoutes() {
    this.app.get("/", (req, res) => {
      res.json({
        message: "RaveHub WhatsApp Bot (Plugin System) está funcionando!",
        status: this.context.whatsAppBot.getClientStatus(),
        timestamp: new Date().toISOString(),
      })
    })

    this.app.get("/qr", (req, res) => {
      const qrDataUrl = this.context.whatsAppBot.getQrCodeDataUrl()
      if (qrDataUrl) {
        res.send(`
      <html>
        <head><title>WhatsApp QR Code</title></head>
        <body style="display:flex; justify-content:center; align-items:center; height:100vh; margin:0; flex-direction: column; background-color: #f0f0f0; font-family: Arial, sans-serif;">
          <div style="background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <h2 style="text-align: center;">Escanea este código QR con WhatsApp</h2>
            <img src="${qrDataUrl}" alt="QR Code" style="display: block; margin: 0 auto; max-width: 300px; height: auto;"/>
            <p style="text-align: center; margin-top: 15px;">Actualiza si no funciona o revisa la consola del bot.</p>
          </div>
        </body>
      </html>
    `)
      } else if (this.context.whatsAppBot.isReady) {
        res.send(
          "<p style='font-family: Arial, sans-serif; text-align: center; margin-top: 20px;'>✅ Bot conectado. No se necesita QR.</p>",
        )
      } else {
        res.send(
          "<p style='font-family: Arial, sans-serif; text-align: center; margin-top: 20px;'>⏳ Esperando código QR... Actualiza la página en unos segundos o revisa la consola del bot.</p>",
        )
      }
    })

    this.app.get("/api/health", (req, res) => {
      res.json({
        status: "healthy",
        botStatus: this.context.whatsAppBot.getClientStatus(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      })
    })

    // A simple dashboard route (can be expanded by plugins)
    this.app.get("/dashboard", (req, res) => {
      const botStatus = this.context.whatsAppBot.getClientStatus()
      let statusMessage = "Desconectado. Esperando QR..."
      if (botStatus.isReady) {
        statusMessage = "Conectado y Listo!"
      } else if (botStatus.qrCodeAvailable) {
        statusMessage = 'Esperando escaneo de QR. <a href="/qr">Ver QR</a>'
      }

      // Basic stats from DB
      let totalUsers = 0
      let activeWorks = 0
      try {
        totalUsers = this.context.db.get("SELECT COUNT(*) as count FROM users")?.count || 0
        activeWorks = this.context.db.get("SELECT COUNT(*) as count FROM active_works")?.count || 0
      } catch (e) {
        console.error("Error fetching dashboard stats:", e)
      }

      res.send(`
        <html>
            <head>
                <title>RaveHub Bot Dashboard</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style> 
                  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f4f6f8; color: #333; } 
                  h1 { color: #2c3e50; text-align: center; margin-bottom: 30px;}
                  .card { background-color: white; border: 1px solid #d1d9e6; padding: 20px; margin-bottom:15px; border-radius:8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); } 
                  .card strong { color: #3498db; }
                  a { color: #3498db; text-decoration: none; }
                  a:hover { text-decoration: underline; }
                  .footer { text-align: center; margin-top: 30px; font-size: 0.9em; color: #7f8c8d; }
                </style>
            </head>
            <body>
                <h1>RaveHub Bot Dashboard</h1>
                <div class="card"><strong>Estado del Bot:</strong> ${statusMessage}</div>
                <div class="card"><strong>Usuarios Totales:</strong> ${totalUsers}</div>
                <div class="card"><strong>Trabajos Activos:</strong> ${activeWorks}</div>
                <div class="card"><strong>Plugins Cargados:</strong> ${this.context.pluginManager.plugins.map((p) => p.constructor.name).join(", ")}</div>
                <p style="text-align:center;"><a href="/api/health">Ver Health API</a></p>
                <div class="footer">
                  <p>Esta página se actualiza automáticamente cada 30 segundos.</p>
                </div>
                <script>setTimeout(() => location.reload(), 30000);</script>
            </body>
        </html>
    `)
    })
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app
        .listen(this.port, "0.0.0.0", () => {
          console.log(`🌐 Servidor web iniciado en http://localhost:${this.port}`)
          console.log(`🔗 Dashboard disponible en http://<tu-ip>:${this.port}/dashboard`)
          console.log(`🔗 QR (si es necesario) en http://<tu-ip>:${this.port}/qr`)
          resolve(this.server)
        })
        .on("error", (err) => {
          console.error("❌ Error al iniciar servidor web:", err)
          reject(err)
        })
    })
  }

  async stop() {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) {
            console.error("❌ Error al detener el servidor web:", err)
            return reject(err)
          }
          console.log("🛑 Servidor web detenido.")
          resolve()
        })
      } else {
        resolve()
      }
    })
  }
}
