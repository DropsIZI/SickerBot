const { addXP, isOnCooldown, setCooldown, getLevelUpMessage, loadConfig } = require('../utils/levelManager');
const tarot = require('../utils/tarotLectura');
const zodiaco = require('../utils/zodiaco');
const zodiacoRender = require('../utils/zodiacoRender');

// Comandos por prefijo. Funcionan en cualquier canal, a diferencia de /tarot,
// que respeta tarotChannel. Cada uno lleva su propia espera por usuario: el
// tarot sube entre una y tres imagenes por tirada, el zodiaco es solo texto.
const COMANDOS = [
  { prefijo: '!tarot', espera: 30_000, maneja: responderTarot, ocupado: '🔮 Las cartas necesitan reposar. Vuelve en **%s**.' },
  { prefijo: '!zodiaco', espera: 10_000, maneja: responderZodiaco, ocupado: '✦ Los astros van despacio. Vuelve en **%s**.' },
];

const ultimoUso = new Map();

function responderTarot(message, resto) {
  const { tipo, pregunta } = tarot.interpretar(resto);
  return {
    ...tarot.construirLectura({ tipo, pregunta, usuario: message.author }),
    allowedMentions: { repliedUser: false, parse: [] },
  };
}

function responderZodiaco(message, resto) {
  const r = zodiaco.interpretar(resto);

  const payload = r.tipo === 'signo'
    ? zodiacoRender.mensajeSigno(r.signo, { usuario: message.author, fecha: r.fecha })
    : r.tipo === 'mes' ? zodiacoRender.mensajeMes(r.mes, r.signos)
      : r.tipo === 'vacio' ? zodiacoRender.mensajeAyuda()
        : zodiacoRender.mensajeNoEntendido();

  return { ...payload, allowedMentions: { repliedUser: false, parse: [] } };
}

// Reconoce el prefijo solo si termina en espacio o en fin de mensaje, para que
// !tarotazo o !zodiacos sigan siendo mensajes normales
function detectar(texto) {
  const bajo = texto.toLowerCase();
  return COMANDOS.find(c => {
    if (!bajo.startsWith(c.prefijo)) return false;
    const sigue = texto.charAt(c.prefijo.length);
    return !sigue || sigue === ' ';
  }) || null;
}

async function atender(message, texto, comando) {
  const clave = `${comando.prefijo}:${message.author.id}`;
  const ahora = Date.now();
  const previa = ultimoUso.get(clave);

  if (previa && ahora - previa < comando.espera) {
    const quedan = `${Math.ceil((comando.espera - (ahora - previa)) / 1000)}s`;
    const aviso = await message.reply(comando.ocupado.replace('%s', quedan)).catch(() => null);
    if (aviso) setTimeout(() => aviso.delete().catch(() => {}), 5000);
    return;
  }
  ultimoUso.set(clave, ahora);

  try {
    await message.reply(comando.maneja(message, texto.slice(comando.prefijo.length)));
  } catch (err) {
    console.error(`[${comando.prefijo}]`, err);
  }
}

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    // Va antes del cooldown de XP: si no, quien acabara de escribir no podria
    // usar estos comandos hasta que se le pasara el enfriamiento de niveles
    const texto = message.content.trimStart();
    const comando = detectar(texto);
    if (comando) await atender(message, texto, comando);

    if (isOnCooldown(message.author.id)) return;
    setCooldown(message.author.id);

    const xpGain = Math.floor(Math.random() * 11) + 15; // 15-25 XP aleatorio
    const result = addXP(message.author.id, xpGain);

    if (!result.leveledUp) return;

    const config = loadConfig();
    const levelUpChannelId = config.levelUpChannel || process.env.LEVEL_UP_CHANNEL_ID;

    try {
      const channel = levelUpChannelId
        ? await client.channels.fetch(levelUpChannelId).catch(() => message.channel)
        : message.channel;

      await channel.send(getLevelUpMessage(message.author, result.level));
    } catch (err) {
      console.error('[levelUp send]', err);
    }

    // Asignar rol si está configurado para este nivel
    if (config.levelRoles?.[result.level]) {
      try {
        const role = await message.guild.roles.fetch(config.levelRoles[result.level]).catch(() => null);
        if (role) await message.member.roles.add(role).catch(console.error);
      } catch (err) {
        console.error('[levelRole]', err);
      }
    }
  },
};
