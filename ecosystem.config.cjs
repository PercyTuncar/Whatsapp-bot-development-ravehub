// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "ravehub-plugin-bot", // Nuevo nombre para evitar conflictos
      script: "src/index.js",
      instances: 1,
      autorestart: true,
      watch: false, // Deshabilitar watch para producción, manejar actualizaciones con git pull y pm2 reload
      max_memory_restart: "512M", // Ajustar según sea necesario
      min_uptime: "30s", // Tiempo mínimo que la app debe estar online para considerarse estable
      max_restarts: 10,    // Número máximo de reinicios antes de marcar como errónea
      restart_delay: 5000, // Delay entre reinicios en ms
      cron_restart: "0 4 * * *", // Reinicio diario a las 4:00 AM UTC
      env: { // Usado si no se especifica --env o si NODE_ENV no está seteado externamente
        NODE_ENV: "development", 
      },
      env_production: { // Usado con pm2 start ecosystem.config.js --env production
        NODE_ENV: "production",
        // PORT, ADMIN_NUMBER, etc., deben ser configurados en el .env o variables de entorno del servidor
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log", // PM2 combina out y error aquí si merge_logs es true
      time: true, // Prefijar logs con timestamp
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      kill_timeout: 10000, // Tiempo para esperar antes de enviar SIGKILL si SIGINT falla
      wait_ready: true, // Esperar la señal process.send('ready') antes de considerar la app como iniciada
      listen_timeout: 15000, // Tiempo para esperar la señal 'listening' del servidor HTTP
      shutdown_with_message: true, // Enviar un mensaje de apagado
      node_args: [
        "--experimental-modules", // Si usas ES modules y necesitas flags específicos
        // "--max-old-space-size=400" // Ejemplo de argumento para Node
      ],
      ignore_watch: [ // Ignorar estos directorios/archivos si watch está habilitado
        "node_modules",
        "logs",
        ".wwebjs_auth",
        "ravehub.db",
        "ravehub.db-journal",
        "ravehub.db-wal",
        "ravehub.db-shm",
        "public"
      ],
    },
  ],
};
