#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}"
echo "🎵═══════════════════════════════════════🎵"
echo "🎧        RAVEHUB BOT INSTALLER        🎧"
echo "🎵═══════════════════════════════════════🎵"
echo -e "${NC}"

# Función para mostrar mensajes
show_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

show_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar si es Ubuntu/Debian
if ! command -v apt &> /dev/null; then
    show_error "Este script solo funciona en sistemas basados en Ubuntu/Debian"
    exit 1
fi

# Actualizar sistema
show_message "Actualizando el sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
show_message "Instalando dependencias del sistema..."
sudo apt install git ffmpeg curl -y

# Verificar si Node.js ya está instalado
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        show_message "Node.js ya está instalado ($(node --version))"
    else
        show_warning "Node.js versión antigua detectada. Actualizando..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install nodejs -y
    fi
else
    show_message "Instalando Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install nodejs -y
fi

# Verificar instalación de Node.js
if ! command -v node &> /dev/null; then
    show_error "Error al instalar Node.js"
    exit 1
fi

show_message "Node.js $(node --version) instalado correctamente"

# Instalar Yarn y PM2
show_message "Instalando Yarn y PM2..."
sudo npm install -g yarn
yarn global add pm2

# Clonar repositorio
show_message "Clonando repositorio de Ravehub..."
if [ -d "ravehub" ]; then
    show_warning "El directorio 'ravehub' ya existe. Eliminando..."
    rm -rf ravehub
fi

git clone https://github.com/PercyTuncar/Whatsapp-bot-development-ravehub.git ravehub
cd ravehub

# Instalar dependencias del proyecto
show_message "Instalando dependencias del proyecto..."
yarn install

# Crear archivo de configuración
show_message "Creando archivo de configuración..."
if [ ! -f "config.env" ]; then
    cp config.env.example config.env
    show_message "Archivo config.env creado desde config.env.example"
else
    show_warning "El archivo config.env ya existe"
fi

# Mostrar instrucciones finales
echo -e "${BLUE}"
echo "🎉 ¡Instalación completada!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Edita el archivo config.env con tus configuraciones:"
echo "   nano config.env"
echo ""
echo "2. Configura al menos estas variables importantes:"
echo "   - SESSION_ID=tu_session_id_unico"
echo "   - SUDO=tu_numero_completo"
echo "   - PREFIX=! (o el prefijo que prefieras)"
echo ""
echo "3. Inicia el bot:"
echo "   pm2 start . --name ravehub --attach --time"
echo ""
echo "4. Para ver logs:"
echo "   pm2 logs ravehub"
echo ""
echo "5. Para detener el bot:"
echo "   pm2 stop ravehub"
echo -e "${NC}"

echo -e "${PURPLE}"
echo "🎵═══════════════════════════════════════🎵"
echo "🎧     ¡RAVEHUB BOT LISTO PARA USAR!   🎧"
echo "🎵═══════════════════════════════════════🎵"
echo -e "${NC}"
