#!/bin/bash

echo "🚀 Iniciando RaveHub Bot (Plugin System)..."

# Navegar al directorio del script si es necesario
# DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# cd "$DIR"

# Crear directorio de logs si no existe
mkdir -p logs

# Verificar Node.js
if ! command -v node &> /dev/null
then
  echo "❌ Node.js no está instalado. Por favor, instálalo."
  exit 1
fi
echo "✅ Node.js encontrado: $(node --version)"

# Verificar PM2
if ! command -v pm2 &> /dev/null
then
  echo "ℹ️ PM2 no está instalado globalmente. Se recomienda para producción: npm install -g pm2"
  echo "ℹ️ Iniciando directamente con Node.js por ahora (esto NO es para producción 24/7)..."
  NODE_ENV=production node src/index.js
else
  echo "✅ PM2 encontrado: $(pm2 --version)"
  # Detener instancias previas con el mismo nombre para evitar conflictos
  pm2 delete ravehub-plugin-bot 2>/dev/null || true
  
  # Iniciar con PM2 usando el archivo de configuración y especificando el entorno de producción
  echo "🔄 Iniciando/Reiniciando con PM2 usando ecosystem.config.cjs para el entorno de PRODUCCIÓN..."
  pm2 start ecosystem.config.cjs --env production

  echo ""
  echo "✅ Bot iniciado con PM2!"
  echo "📊 Para ver el estado: pm2 status"
  echo "📝 Para ver los logs: pm2 logs ravehub-plugin-bot"
  echo "🛑 Para detener: pm2 stop ravehub-plugin-bot"
  echo "🔄 Para reiniciar: pm2 restart ravehub-plugin-bot"
  echo "🔄 Para recargar (actualizaciones de código sin downtime): pm2 reload ravehub-plugin-bot"
  echo "💾 Para guardar la lista de procesos de PM2 (para que se reinicien con el servidor): pm2 save"
fi
