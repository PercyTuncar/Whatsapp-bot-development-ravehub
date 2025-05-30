# 🎵 Ravehub Bot - WhatsApp Bot para Comunidad de Música Electrónica

<div align="center">

![Ravehub Bot](https://img.shields.io/badge/Ravehub-Bot-purple?style=for-the-badge&logo=whatsapp)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Bot de WhatsApp para la comunidad Ravehub - Una ciudad virtual de música electrónica**

[Características](#características) • [Instalación](#instalación) • [Comandos](#comandos) • [Despliegue](#despliegue-en-aws-ec2)

</div>

## 🌟 Características

- 🎧 **Sistema de Trabajos Virtuales** - DJ, Seguridad, Promotor, Dealer
- 💰 **Economía Virtual** - Gana monedas Ravehub trabajando
- 📈 **Sistema de Niveles** - Sube de nivel para ganar más dinero
- 🏆 **Rankings y Reputación** - Compite con otros miembros
- 🎵 **Temática de Música Electrónica** - Mensajes y trabajos temáticos
- 🇪🇸 **Completamente en Español** - Interfaz y mensajes en español
- ⚡ **Basado en Baileys** - Tecnología moderna de WhatsApp
- 🔄 **Auto-reconexión** - Mantiene la conexión estable
- 📊 **Base de Datos** - SQLite/PostgreSQL para persistencia

## 🚀 Instalación Rápida

### Prerrequisitos

- Node.js 20.x o superior
- Git
- WhatsApp (para escanear QR)

### 1. Clonar el Repositorio

\`\`\`bash
git clone https://github.com/PercyTuncar/Whatsapp-bot-development-ravehub.git ravehub-bot
cd ravehub-bot
\`\`\`

### 2. Instalar Dependencias

\`\`\`bash
# Usando npm
npm install

# O usando yarn (recomendado)
yarn install
\`\`\`

### 3. Configurar Variables de Entorno

\`\`\`bash
cp config.env.example config.env
\`\`\`

Edita el archivo `config.env` con tus configuraciones:

\`\`\`env
SESSION_ID="ravehub_session_unique"
PREFIX="!"
STICKER_PACKNAME="🎵,Ravehub"
ALWAYS_ONLINE=true
BOT_LANG=es
LANGUAG=es
SUDO=tu_numero_sin_espacios
TZ=America/Mexico_City
WORK_COOLDOWN=3600000
\`\`\`

### 4. Iniciar el Bot

\`\`\`bash
# Desarrollo
npm start

# O con PM2 (recomendado para producción)
pm2 start . --name ravehub
\`\`\`

### 5. Escanear Código QR

El bot mostrará un código QR en la consola. Escanéalo con WhatsApp para vincular el bot.

## 🏙️ Despliegue en AWS EC2

### Paso 1: Crear Instancia EC2

1. **Lanza una nueva instancia EC2**
   - AMI: Ubuntu Server 22.04 LTS
   - Tipo de instancia: t2.micro (suficiente para el bot)
   - Almacenamiento: 8 GB (por defecto)
   - Grupo de seguridad: Permitir SSH (puerto 22)

2. **Conectarse a la instancia**
   \`\`\`bash
   ssh -i tu-clave.pem ubuntu@tu-ip-publica-ec2
   \`\`\`

### Paso 2: Preparar el Servidor

\`\`\`bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias del sistema
sudo apt install git ffmpeg curl -y
\`\`\`

### Paso 3: Instalar Node.js

\`\`\`bash
# Instalar Node.js 20.x (recomendado)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Verificar instalación
node --version
npm --version
\`\`\`

### Paso 4: Instalar Herramientas de Gestión

\`\`\`bash
# Instalar Yarn (recomendado)
sudo npm install -g yarn

# Instalar PM2 para gestión de procesos
yarn global add pm2
\`\`\`

### Paso 5: Clonar y Configurar el Bot

\`\`\`bash
# Clonar el repositorio
git clone https://github.com/PercyTuncar/Whatsapp-bot-development-ravehub.git ravehub-bot
cd ravehub-bot

# Instalar dependencias
yarn install
\`\`\`

### Paso 6: Configurar Variables de Entorno

\`\`\`bash
# Copiar archivo de configuración
cp config.env.example config.env

# Editar configuración
nano config.env
\`\`\`

**Configuración recomendada para AWS:**

\`\`\`env
SESSION_ID="ravehub_aws_session"
VPS="true"
AUTO_UPDATE="true"
PREFIX="!"
STICKER_PACKNAME="🎵,Ravehub"
ALWAYS_ONLINE=true
RMBG_KEY=null
LANGUAG=es
BOT_LANG=es
WARN_LIMIT=3
FORCE_LOGOUT=false
BRAINSHOP=159501,6pq8dPiYt7PdqHz3
MAX_UPLOAD=200
REJECT_CALL=true
SUDO=tu_numero_completo_sin_espacios
TZ=America/Mexico_City
AUTO_STATUS_VIEW=true
SEND_READ=true
AJOIN=false
DISABLE_START_MESSAGE=false
PERSONAL_MESSAGE=null
WORK_COOLDOWN=3600000
\`\`\`

### Paso 7: Iniciar el Bot

\`\`\`bash
# Iniciar con PM2 y mostrar logs
pm2 start . --name ravehub --attach --time

# El código QR aparecerá en la consola
# Escanéalo con WhatsApp para vincular el bot
\`\`\`

### Paso 8: Configurar Inicio Automático

\`\`\`bash
# Configurar PM2 para iniciar automáticamente después de reiniciar
pm2 startup

# Guardar la configuración actual
pm2 save
\`\`\`

## 🛠️ Comandos de Gestión

### Comandos PM2

\`\`\`bash
# Ver estado de los procesos
pm2 status

# Ver logs en tiempo real
pm2 logs ravehub

# Reiniciar el bot
pm2 restart ravehub

# Detener el bot
pm2 stop ravehub

# Eliminar el proceso
pm2 delete ravehub

# Monitorear recursos
pm2 monit
\`\`\`

### Comandos de Mantenimiento

\`\`\`bash
# Actualizar el bot
cd ravehub-bot
git pull origin main
yarn install
pm2 restart ravehub

# Ver logs del sistema
sudo journalctl -u pm2-ubuntu

# Verificar uso de recursos
htop
\`\`\`

## 🎮 Comandos del Bot

### 💼 Economía

- `!work` - Ver trabajos disponibles
- `!work dj` - Trabajar como DJ (🎧)
- `!work security` - Trabajar en seguridad (🛡️)
- `!work promoter` - Trabajar como promotor (📢)
- `!work dealer` - Trabajar en el mercado negro (💊)
- `!balance` - Ver tu balance y estadísticas
- `!top` - Ver ranking de usuarios

### ℹ️ Información

- `!ravehub` - Información sobre la comunidad
- `!info` - Estadísticas del bot
- `!help` - Lista de comandos
- `!menu` - Menú organizado por categorías

## 💰 Sistema de Trabajos

### 🎧 DJ
- **Salario:** 200-500 monedas
- **Descripción:** Mezcla música electrónica en eventos
- **Mensajes temáticos:** Sets de techno, house, trance, etc.

### 🛡️ Seguridad
- **Salario:** 120-300 monedas
- **Descripción:** Mantén el orden en eventos
- **Mensajes temáticos:** Control de acceso, zona VIP, etc.

### 📢 Promotor
- **Salario:** 250-600 monedas
- **Descripción:** Organiza y promociona fiestas
- **Mensajes temáticos:** Eventos sold out, DJs internacionales, etc.

### 💊 Dealer
- **Salario:** 300-800 monedas
- **Descripción:** Mercado underground
- **Mensajes temáticos:** Productos premium, clientes VIP, etc.

## 🔧 Configuración Avanzada

### Variables de Entorno Importantes

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `SESSION_ID` | ID único de la sesión | `ravehub_session` |
| `PREFIX` | Prefijo de comandos | `!` |
| `WORK_COOLDOWN` | Tiempo entre trabajos (ms) | `3600000` (1 hora) |
| `SUDO` | Número de administrador | - |
| `LANGUAG` | Idioma del bot | `es` |
| `TZ` | Zona horaria | `America/Mexico_City` |

### Base de Datos

El bot usa SQLite por defecto. Para PostgreSQL:

\`\`\`env
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/database
\`\`\`

## 🚨 Solución de Problemas

### El bot no se conecta

1. Verificar que Node.js sea versión 20.x
2. Eliminar la carpeta `sessions` y volver a escanear QR
3. Verificar configuración de red/firewall

### Error de dependencias

\`\`\`bash
# Limpiar caché e instalar de nuevo
rm -rf node_modules yarn.lock
yarn install
\`\`\`

### El bot se desconecta frecuentemente

1. Verificar conexión a internet estable
2. Usar PM2 para auto-reinicio
3. Configurar `ALWAYS_ONLINE=true`

### Problemas de memoria

\`\`\`bash
# Aumentar límite de memoria para Node.js
pm2 start . --name ravehub --node-args="--max-old-space-size=1024"
\`\`\`

## 📝 Logs y Monitoreo

### Ver logs en tiempo real

\`\`\`bash
# Logs de PM2
pm2 logs ravehub --lines 100

# Logs del sistema
tail -f /var/log/syslog | grep ravehub
\`\`\`

### Monitoreo de recursos

\`\`\`bash
# Monitor de PM2
pm2 monit

# Uso de CPU y memoria
htop
\`\`\`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [Baileys](https://github.com/WhiskeySockets/Baileys) - Librería de WhatsApp
- [Levanter](https://github.com/lyfe00011/levanter) - Inspiración y estructura base
- Comunidad Ravehub - Por la inspiración y feedback

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de [Solución de Problemas](#-solución-de-problemas)
2. Abre un [Issue](https://github.com/PercyTuncar/Whatsapp-bot-development-ravehub/issues)
3. Únete a nuestro grupo de WhatsApp de soporte

---

<div align="center">

**🎵 Hecho con ❤️ para la comunidad Ravehub 🎵**

[⬆ Volver arriba](#-ravehub-bot---whatsapp-bot-para-comunidad-de-música-electrónica)

</div>
