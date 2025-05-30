const { getUser, updateBalance, setLastWork, canWork, upgradeWorkLevel } = require("./database")
const { WORK_COOLDOWN } = require("../config")

// Configuración de trabajos de Ravehub
const jobs = {
  dj: {
    name: "DJ",
    minPay: 150,
    maxPay: 400,
    description: "Mezclas música electrónica en eventos y fiestas",
    messages: [
      "¡Tu set de techno ha sido increíble! La pista no dejaba de vibrar con tus beats.",
      "Has mezclado house y trance perfectamente. El promotor te ha dado una propina extra.",
      "Tu sesión de música electrónica ha sido un éxito. Tu nombre suena fuerte en Ravehub.",
      "Has cerrado la noche con un set épico. Los ravers no paraban de bailar.",
      "Tu mezcla de bass y dubstep ha roto la pista. ¡Eres una leyenda!",
    ],
  },
  security: {
    name: "Seguridad",
    minPay: 100,
    maxPay: 250,
    description: "Mantienes el orden en los eventos de música electrónica",
    messages: [
      "Has mantenido la seguridad en la zona VIP durante todo el festival.",
      "Evitaste problemas en la entrada principal. El evento transcurrió sin incidentes.",
      "Tu presencia ha mantenido el orden en el área de DJ booth.",
      "Has controlado perfectamente el acceso backstage durante el evento.",
      "Gracias a ti, todos pudieron disfrutar de la música sin problemas.",
    ],
  },
  promoter: {
    name: "Promotor",
    minPay: 200,
    maxPay: 500,
    description: "Promocionas fiestas y eventos de música electrónica",
    messages: [
      "¡Tu evento de música electrónica fue sold out! Increíble promoción.",
      "Has conseguido traer a un DJ internacional famoso. El evento fue épico.",
      "Tu campaña en redes sociales atrajo a miles de ravers nuevos.",
      "El festival que promocionaste batió récords de asistencia.",
      "Tu red de contactos ha hecho posible el mejor lineup del año.",
    ],
  },
  dealer: {
    name: "Dealer",
    minPay: 250,
    maxPay: 600,
    description: "Vendes productos especiales en el mercado underground",
    messages: [
      "Has vendido toda tu mercancía premium en tiempo récord.",
      "Un cliente VIP te pagó extra por tu discreción y calidad.",
      "Tu reputación en el underground sigue creciendo.",
      "Has expandido tu red de contactos en la escena electrónica.",
      "Tus productos son los más buscados en los afterparties.",
    ],
  },
}

const work = async (jid, jobType) => {
  if (!jobs[jobType]) {
    return {
      success: false,
      message:
        "❌ Ese trabajo no existe en Ravehub.\n\n*Trabajos disponibles:*\n• !work dj\n• !work security\n• !work promoter\n• !work dealer",
    }
  }

  const canUserWork = await canWork(jid, WORK_COOLDOWN)
  if (!canUserWork) {
    const user = await getUser(jid)
    const timeLeft = WORK_COOLDOWN - (new Date() - user.lastWork)
    const minutesLeft = Math.ceil(timeLeft / 60000)

    return {
      success: false,
      message: `⏳ Debes esperar ${minutesLeft} minutos antes de volver a trabajar en Ravehub.`,
    }
  }

  const job = jobs[jobType]
  const user = await getUser(jid)
  const levelMultiplier = 1 + (user.workLevel - 1) * 0.15

  const basePay = Math.floor(Math.random() * (job.maxPay - job.minPay + 1)) + job.minPay
  const finalPay = Math.floor(basePay * levelMultiplier)

  await updateBalance(jid, finalPay)
  await setLastWork(jid, jobType)

  const message = job.messages[Math.floor(Math.random() * job.messages.length)]

  let levelUpMessage = ""
  if (Math.random() < 0.1) {
    await upgradeWorkLevel(jid)
    levelUpMessage = "\n\n🌟 ¡Has subido de nivel en este trabajo! Ahora ganarás más dinero."
  }

  return {
    success: true,
    message: `💼 *${job.name} - Ravehub*\n\n${message}\n\n💰 Has ganado ${finalPay} monedas Ravehub.${levelUpMessage}`,
  }
}

const getBalance = async (jid) => {
  const user = await getUser(jid)
  return {
    balance: user.balance,
    workLevel: user.workLevel,
    workType: user.workType,
    totalWorked: user.totalWorked,
  }
}

module.exports = {
  work,
  getBalance,
  jobs,
}
