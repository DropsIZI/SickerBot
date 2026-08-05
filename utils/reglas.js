// Texto de las reglas. Editar aqui y volver a lanzar /reglas para actualizar.
const REGLAS = [
  {
    emoji: '🌐',
    titulo: 'Respeto ante todo',
    texto: 'Trata a todos con respeto. Nada de insultos, hostigamiento, discriminación ni toxicidad.\n' +
           'Se permiten bromas siempre que **ambas partes** estén de acuerdo.',
  },
  {
    emoji: '🔞',
    titulo: 'Contenido prohibido',
    texto: 'No se permite contenido NSFW, gore, virus, spam ni nada ilegal.\n' +
           'El incumplimiento puede causar **sanción inmediata**.',
  },
  {
    emoji: '📢',
    titulo: 'Publicidad',
    texto: 'Cero publicidad fuera del canal designado.\n' +
           'Incluye: otros servidores, redes personales, links de invitación, etc.',
  },
  {
    emoji: '🔇',
    titulo: 'Evita el spam',
    texto: 'No flood, no repetir mensajes, no @everyone innecesarios, ni sonidos molestos en llamada.',
  },
  {
    emoji: '🛡️',
    titulo: 'Privacidad de usuarios',
    texto: 'No compartas información personal de nadie.\n' +
           'Capturas, audios o mensajes privados sin permiso están prohibidos.',
  },
  {
    emoji: '🎙️',
    titulo: 'Voz y micrófono',
    texto: 'En canales de voz mantén un ambiente agradable.\n' +
           'No grites, no uses soundboards excesivamente y evita discusiones fuertes.',
  },
  {
    emoji: '🎭',
    titulo: 'Nombres e imágenes',
    texto: 'Evita nicks ofensivos o fotos de perfil que incumplan las normas del servidor o de Discord.',
  },
  {
    emoji: '👑',
    titulo: 'Respeto a los Mods',
    texto: 'Las decisiones del staff se respetan.\n' +
           'Si tienes un problema, abre ticket o contacta por privado de forma tranquila.',
  },
  {
    emoji: '⚠️',
    titulo: 'Sentido común',
    texto: 'Si algo no está escrito pero claramente va contra la convivencia, puede ser sancionado.',
  },
];

const SANCIONES = [
  '`1ª` → ⚠️ **Advertencia**',
  '`2ª` → 🔇 **Mute temporal**',
  '`3ª` → 👢 **Expulsión**',
  '`4ª` → 🔨 **Ban permanente**',
];

module.exports = { REGLAS, SANCIONES };
