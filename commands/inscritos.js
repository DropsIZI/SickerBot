const { SlashCommandBuilder, EmbedBuilder, MessageFlags} = require('discord.js');
const { inscritos, nombreRango, iconoConfirmacion, TIERS, valorDe } = require('../utils/coliseo');
const torneo = require('../utils/coliseoTorneo');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inscritos')
    .setDescription('Muestra quién está apuntado al Coliseo del Abismo'),

  async execute(interaction) {
    const lista = inscritos();

    if (!lista.length) {
      return interaction.reply({
        content: '📋 Todavía no hay nadie inscrito en el Coliseo.',
        flags: MessageFlags.Ephemeral,
      });
    }

    // De mayor a menor elo
    const ordenados = [...lista].sort((a, b) => valorDe(b) - valorDe(a));

    const filas = ordenados.map((i, n) =>
      `\`${String(n + 1).padStart(2)}\` ${iconoConfirmacion(i.confirmado)} ${nombreRango(i)} · **${i.riotId}** · <@${i.userId}>`
    );

    // Cuantos hay de cada tier, para ver el nivel general del torneo
    const porTier = new Map();
    for (const i of lista) porTier.set(i.tier, (porTier.get(i.tier) || 0) + 1);
    const reparto = [...porTier.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([t, n]) => `${TIERS[t].emoji} ${TIERS[t].nombre} ×${n}`)
      .join('  ·  ');

    const embed = new EmbedBuilder()
      .setColor(0x0F2027)
      .setTitle(`⚔️  Inscritos en el Coliseo — ${lista.length}`)
      .setDescription(filas.join('\n').slice(0, 3800))
      .addFields({ name: 'Reparto por rango', value: reparto.slice(0, 1024) })
      .setFooter({ text: 'Coliseo del Abismo ⚔️ · ✅ confirmado · ⏳ pendiente · ❌ no asiste' });

    const actual = torneo.estado();
    if (actual && !actual.campeon) {
      embed.addFields({
        name: '🎮 Torneo en curso',
        value: `${actual.nombreRonda} · quedan **${actual.jugadoresRonda}** en juego`,
      });
    } else if (actual?.campeon) {
      embed.addFields({
        name: '👑 Último campeón',
        value: `<@${actual.campeon.userId}> \`${actual.campeon.riotId}\``,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
