# 🎵 Ravehub Bot - WhatsApp Bot para Comunidad de Música Electrónica

<div align="center">
<<<<<<< HEAD
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
=======

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
>>>>>>> 23afb8d (Primer commit)

\`\`\`bash
git clone https://github.com/PercyTuncar/Whatsapp-bot-development-ravehub.git ravehub-bot
cd ravehub-bot
<<<<<<< HEAD
yarn install
\`\`\`

#### 5️⃣ Configurar Variables de Entorno

Crea un archivo `config.env` y agrega las siguientes líneas:

\`\`\`env
SESSION_ID=ravehub_session_unique
PREFIX=!
STICKER_PACKNAME=🎵,Ravehub
=======
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
>>>>>>> 23afb8d (Primer commit)
ALWAYS_ONLINE=true
RMBG_KEY=null
LANGUAG=es
BOT_LANG=es
WARN_LIMIT=3
FORCE_LOGOUT=false
BRAINSHOP=159501,6pq8dPiYt7PdqHz3
MAX_UPLOAD=200
REJECT_CALL=true
<<<<<<< HEAD
SUDO=tu_numero_sin_espacios
TZ=America/Mexico_City
VPS=true
=======
SUDO=tu_numero_completo_sin_espacios
TZ=America/Mexico_City
>>>>>>> 23afb8d (Primer commit)
AUTO_STATUS_VIEW=true
SEND_READ=true
AJOIN=false
DISABLE_START_MESSAGE=false
PERSONAL_MESSAGE=null
WORK_COOLDOWN=3600000
\`\`\`

<<<<<<< HEAD
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
=======
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
>>>>>>> 23afb8d (Primer commit)

# Reiniciar el bot
pm2 restart ravehub

<<<<<<< HEAD
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
=======
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
>>>>>>> 23afb8d (Primer commit)
- `!balance` - Ver tu balance y estadísticas
- `!top` - Ver ranking de usuarios

### ℹ️ Información
<<<<<<< HEAD
=======

>>>>>>> 23afb8d (Primer commit)
- `!ravehub` - Información sobre la comunidad
- `!info` - Estadísticas del bot
- `!help` - Lista de comandos
- `!menu` - Menú organizado por categorías

<<<<<<< HEAD
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
=======
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
>>>>>>> 23afb8d (Primer commit)

## 🔧 Configuración Avanzada

### Variables de Entorno Importantes

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
<<<<<<< HEAD
| `SESSION_ID` | ID único de la sesión | `ravehub_session_unique` |
=======
| `SESSION_ID` | ID único de la sesión | `ravehub_session` |
>>>>>>> 23afb8d (Primer commit)
| `PREFIX` | Prefijo de comandos | `!` |
| `WORK_COOLDOWN` | Tiempo entre trabajos (ms) | `3600000` (1 hora) |
| `SUDO` | Número de administrador | - |
| `LANGUAG` | Idioma del bot | `es` |
<<<<<<< HEAD
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
=======
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
>>>>>>> 23afb8d (Primer commit)
\`\`\`

## 🤝 Contribuir

1. Fork el proyecto
<<<<<<< HEAD
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
=======
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
>>>>>>> 23afb8d (Primer commit)

---

<div align="center">
<<<<<<< HEAD
  <p>🎵 Hecho con ❤️ para la comunidad de música electrónica 🎵</p>
  <p><strong>¡Únete a la revolución electrónica en Ravehub!</strong></p>
=======

**🎵 Hecho con ❤️ para la comunidad Ravehub 🎵**

[⬆ Volver arriba](#-ravehub-bot---whatsapp-bot-para-comunidad-de-música-electrónica)

>>>>>>> 23afb8d (Primer commit)
</div>
