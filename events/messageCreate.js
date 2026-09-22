const { addXP, isOnCooldown, setCooldown, getLevelUpMessage, loadConfig } = require('../utils/levelManager');
const { construirLectura, interpretar } = require('../utils/tarotLectura');

// El prefijo tira las cartas en cualquier canal, sin la restriccion de
// tarotChannel que sí aplica a /tarot. Cada tirada sube entre una y tres
// imagenes, asi que se limita por usuario para que no se pueda spamear.
const PREFIJO_TAROT = '!tarot';
const ESPERA_TAROT = 30_000;
const ultimaTirada = new Map();

async function tirarTarot(message, texto) {
  const ahora = Date.now();
  const previa = ultimaTirada.get(message.author.id);
  if (previa && ahora - previa < ESPERA_TAROT) {
    const quedan = Math.ceil((ESPERA_TAROT - (ahora - previa)) / 1000);
    const aviso = await message
      .reply(`🔮 Las cartas necesitan reposar. Vuelve en **${quedan}s**.`)
      .catch(() => null);
    if (aviso) setTimeout(() => aviso.delete().catch(() => {}), 5000);
    return;
  }
  ultimaTirada.set(message.author.id, ahora);

  const { tipo, pregunta } = interpretar(texto.slice(PREFIJO_TAROT.length));

  try {
    await message.reply({
      ...construirLectura({ tipo, pregunta, usuario: message.author }),
      allowedMentions: { repliedUser: false, parse: [] },
    });
  } catch (err) {
    console.error('[!tarot]', err);
  }
}

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    // Va antes del cooldown de XP: si no, quien acabara de escribir no podria
    // tirar las cartas hasta que se le pasara el enfriamiento de niveles
    const texto = message.content.trimStart();
    if (texto.toLowerCase().startsWith(PREFIJO_TAROT)) {
      const sigue = texto.charAt(PREFIJO_TAROT.length);
      // Evita que !tarotazo u otra palabra que empiece igual dispare la tirada
      if (!sigue || sigue === ' ') await tirarTarot(message, texto);
    }

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
