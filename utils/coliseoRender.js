const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const { nombreRango } = require('./coliseo');

// Un mensaje por duelo en vez de todos juntos: con 16 duelos no cabrian los
// botones en un solo mensaje, que admite 25 como mucho.
function mensajeDuelo(duelo, torneo) {
  const ventaja = duelo.tiers === 0
    ? 'Mismo tier · duelo parejo'
    : `**${duelo.tiers}** tier${duelo.tiers > 1 ? 's' : ''} de diferencia`;

  const menor = duelo.menor === duelo.a.userId ? duelo.a : duelo.b;

  const titulo = duelo.tipo === 'final'
    ? '🏆 Duelo por el título'
    : duelo.tipo === 'tercero'
      ? '🥉 Duelo por el 3er puesto'
      : `${torneo.nombreRonda} · Duelo ${duelo.id.split('d')[1]}`;

  const embed = new EmbedBuilder()
    .setColor(duelo.ganador ? 0x2ECC71 : duelo.tipo === 'final' ? 0xFFD700 : 0x8B0000)
    .setTitle(`${duelo.ganador ? '✅' : '⚔️'}  ${titulo}`)
    .setDescription(
      `<@${duelo.a.userId}>\n\`${duelo.a.riotId}\` · ${nombreRango(duelo.a)}\n\n` +
      `**⚔️ vs**\n\n` +
      `<@${duelo.b.userId}>\n\`${duelo.b.riotId}\` · ${nombreRango(duelo.b)}\n\n` +
      `> ${ventaja}\n` +
      `> 🚫 <@${menor.userId}> vetea **${duelo.bans}** campeón${duelo.bans > 1 ? 'es' : ''}`
    );

  if (duelo.ganador) {
    const g = duelo.ganador === duelo.a.userId ? duelo.a : duelo.b;
    embed.addFields({ name: '🏅 Ganador', value: `<@${g.userId}> \`${g.riotId}\`` });
    return { embeds: [embed], components: [] };
  }

  const fila = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`coliseo:win:${duelo.id}:${duelo.a.userId}`)
      .setLabel(`Ganó ${duelo.a.riotId}`.slice(0, 80))
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`coliseo:win:${duelo.id}:${duelo.b.userId}`)
      .setLabel(`Ganó ${duelo.b.riotId}`.slice(0, 80))
      .setStyle(ButtonStyle.Success),
  );

  return { embeds: [embed], components: [fila] };
}

function cabeceraRonda(torneo) {
  const pendientes = torneo.duelos.filter(d => !d.ganador).length;

  const embed = new EmbedBuilder()
    .setColor(0x0F2027)
    .setTitle(`${torneo.nombreRonda}`)
    .setDescription(
      `**${torneo.jugadoresRonda}** jugadores en esta ronda · ` +
      `**${torneo.duelos.length}** duelo${torneo.duelos.length > 1 ? 's' : ''}\n` +
      (pendientes
        ? `Quedan **${pendientes}** por resolver. El anfitrión marca el ganador de cada uno.`
        : 'Ronda completa.')
    )
    .setFooter({ text: `Coliseo del Abismo · ${torneo.totalInicial} inscritos al inicio` });

  if (torneo.pasaDirecto) {
    embed.addFields({
      name: '🎟️ Pasa sin jugar',
      value: `<@${torneo.pasaDirecto.userId}> \`${torneo.pasaDirecto.riotId}\``,
    });
  }

  return embed;
}

const linea = (medalla, j) =>
  `${medalla} <@${j.userId}>\n\`${j.riotId}\` · ${nombreRango(j)}`;

function anuncioPodio(torneo) {
  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('👑  ¡CAMPEÓN DEL COLISEO!')
    .setDescription(
      `# <@${torneo.campeon.userId}>\n` +
      `\`${torneo.campeon.riotId}\` · ${nombreRango(torneo.campeon)}\n\n` +
      `Se impuso entre **${torneo.totalInicial}** participantes ` +
      `tras **${torneo.ronda}** ronda${torneo.ronda > 1 ? 's' : ''}.`
    )
    .setFooter({ text: 'Coliseo del Abismo ⚔️' })
    .setTimestamp();

  const podio = [linea('🥇', torneo.campeon)];
  if (torneo.subcampeon) podio.push(linea('🥈', torneo.subcampeon));
  if (torneo.tercero) podio.push(linea('🥉', torneo.tercero));

  if (podio.length > 1) {
    embed.addFields({ name: '🏅 Podio', value: podio.join('\n\n') });
  }

  return embed;
}

module.exports = { mensajeDuelo, cabeceraRonda, anuncioPodio };
