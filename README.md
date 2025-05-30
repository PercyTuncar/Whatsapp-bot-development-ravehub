# 🎵 Ravehub Bot - WhatsApp Bot para Comunidad de Música Electrónica

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-20.x-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/WhatsApp-Bot-25D366.svg" alt="WhatsApp">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/Status-Active-success.svg" alt="Status">
</div>

## 🌟 Descripción

Ravehub Bot es un bot de WhatsApp diseñado específicamente para la comunidad de música electrónica. Crea una ciudad virtual donde los usuarios pueden trabajar, ganar dinero virtual y participar en la escena underground de la música electrónica.

## ✨ Características

- 🎧 **Sistema de Trabajos**: DJ, Seguridad, Promotor, Dealer
- 💰 **Economía Virtual**: Gana monedas Ravehub trabajando
- 📈 **Sistema de Niveles**: Sube de nivel para ganar más dinero
- 🏆 **Rankings**: Compite con otros usuarios
- ⏰ **Cooldowns**: Sistema de horarios realistas
- 🎵 **Temática Electrónica**: Mensajes y experiencia inmersiva
- 🇪🇸 **Completamente en Español**

## 🚀 Despliegue Rápido en AWS EC2

### Opción 1: Script de Instalación Automática

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/PercyTuncar/Whatsapp-bot-development-ravehub/main/install.sh | bash
\`\`\`

### Opción 2: Instalación Manual

#### 1️⃣ Preparar el Sistema

\`\`\`bash
# Actualizar sistema e instalar dependencias
sudo apt update && sudo apt upgrade -y
sudo apt install git ffmpeg curl -y
\`\`\`

#### 2️⃣ Instalar Node.js (Versión 20.x Recomendada)

\`\`\`bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
\`\`\`

#### 3️⃣ Instalar Yarn y PM2

\`\`\`bash
sudo npm install -g yarn
yarn global add pm2
\`\`\`

#### 4️⃣ Clonar el Repositorio

\`\`\`bash
git clone https://github.com/PercyTuncar/Whatsapp-bot-development-ravehub.git ravehub-bot
cd ravehub-bot
yarn install
\`\`\`

#### 5️⃣ Configurar Variables de Entorno

Crea un archivo `config.env` y agrega las siguientes líneas:

\`\`\`env
SESSION_ID=ravehub_session_unique
PREFIX=!
STICKER_PACKNAME=🎵,Ravehub
ALWAYS_ONLINE=true
RMBG_KEY=null
LANGUAG=es
BOT_LANG=es
WARN_LIMIT=3
FORCE_LOGOUT=false
BRAINSHOP=159501,6pq8dPiYt7PdqHz3
MAX_UPLOAD=200
REJECT_CALL=true
SUDO=tu_numero_sin_espacios
TZ=America/Mexico_City
VPS=true
AUTO_STATUS_VIEW=true
SEND_READ=true
AJOIN=false
DISABLE_START_MESSAGE=false
PERSONAL_MESSAGE=null
WORK_COOLDOWN=3600000
\`\`\`

#### 6️⃣ Iniciar el Bot

\`\`\`bash
# Iniciar el bot con PM2
pm2 start . --name ravehub --attach --time
\`\`\`

El código QR aparecerá en la consola. Escanéalo con WhatsApp para vincular el bot.

#### 7️⃣ Comandos de Gestión

\`\`\`bash
# Detener el bot
pm2 stop ravehub

# Reiniciar el bot
pm2 restart ravehub

# Ver logs
pm2 logs ravehub

# Ver estado
pm2 status

# Configurar inicio automático
pm2 startup
pm2 save
\`\`\`

## 🎮 Comandos Disponibles

### 💼 Economía
- `!work` - Ver trabajos disponibles
- `!work dj` - Trabajar como DJ (200-500 monedas)
- `!work security` - Trabajar en seguridad (120-300 monedas)
- `!work promoter` - Trabajar como promotor (250-600 monedas)
- `!work dealer` - Trabajar en el mercado negro (300-800 monedas)
- `!balance` - Ver tu balance y estadísticas
- `!top` - Ver ranking de usuarios

### ℹ️ Información
- `!ravehub` - Información sobre la comunidad
- `!info` - Estadísticas del bot
- `!help` - Lista de comandos
- `!menu` - Menú organizado por categorías

## 🏗️ Estructura del Proyecto

\`\`\`
ravehub-bot/
├── config.js              # Configuración principal
├── config.env.example     # Ejemplo de variables de entorno
├── index.js               # Punto de entrada
├── package.json           # Dependencias
├── lib/                   # Librerías principales
│   ├── client.js          # Cliente de WhatsApp
│   ├── database.js        # Gestión de base de datos
│   ├── economy.js         # Sistema económico
│   ├── plugins.js         # Cargador de plugins
│   └── utils.js           # Utilidades
├── lang/                  # Archivos de idioma
│   └── es.json           # Español
├── plugins/               # Plugins del bot
│   ├── _menu.js          # Sistema de menús
│   ├── work.js           # Sistema de trabajos
│   ├── balance.js        # Balance de usuarios
│   ├── ravehub.js        # Información de Ravehub
│   └── leaderboard.js    # Rankings
└── sessions/             # Sesiones de WhatsApp (auto-generado)
\`\`\`

## 🔧 Configuración Avanzada

### Variables de Entorno Importantes

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `SESSION_ID` | ID único de la sesión | `ravehub_session_unique` |
| `PREFIX` | Prefijo de comandos | `!` |
| `WORK_COOLDOWN` | Tiempo entre trabajos (ms) | `3600000` (1 hora) |
| `SUDO` | Número de administrador | - |
| `LANGUAG` | Idioma del bot | `es` |
| `VPS` | Modo VPS | `true` |

### Personalización de Trabajos

Edita `lib/economy.js` para modificar:
- Salarios de trabajos
- Mensajes de trabajos
- Probabilidades de subir de nivel
- Cooldowns personalizados

## 🐛 Solución de Problemas

### El bot no se conecta
1. Verifica que el `SESSION_ID` sea único
2. Elimina la carpeta `sessions/` y vuelve a escanear el QR
3. Revisa los logs con `pm2 logs ravehub`

### Error de base de datos
1. Verifica permisos de escritura en el directorio
2. Elimina `database.db` para recrear la base de datos
3. Asegúrate de que SQLite esté instalado

### El QR no aparece
1. Verifica que el puerto 22 esté abierto en AWS
2. Usa `pm2 logs ravehub` para ver el QR en los logs
3. Reinicia el bot con `pm2 restart ravehub`

## 📊 Monitoreo

### Ver estadísticas del bot
\`\`\`bash
# Estado de PM2
pm2 status

# Uso de recursos
pm2 monit

# Logs en tiempo real
pm2 logs ravehub --lines 50
\`\`\`

### Backup de la base de datos
\`\`\`bash
# Crear backup
cp database.db database_backup_$(date +%Y%m%d).db

# Restaurar backup
cp database_backup_YYYYMMDD.db database.db
pm2 restart ravehub
\`\`\`

## 🔄 Actualizaciones

\`\`\`bash
# Detener el bot
pm2 stop ravehub

# Actualizar código
git pull origin main
yarn install

# Reiniciar el bot
pm2 start ravehub
\`\`\`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🎵 Créditos

- **Desarrollado para**: Comunidad Ravehub
- **Basado en**: [Levanter](https://github.com/lyfe00011/levanter)
- **Tecnologías**: Node.js, Baileys, Sequelize, PM2

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/PercyTuncar/Whatsapp-bot-development-ravehub/issues)
- **Documentación**: [Wiki](https://github.com/PercyTuncar/Whatsapp-bot-development-ravehub/wiki)

---

<div align="center">
  <p>🎵 Hecho con ❤️ para la comunidad de música electrónica 🎵</p>
  <p><strong>¡Únete a la revolución electrónica en Ravehub!</strong></p>
</div>
