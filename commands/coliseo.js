const {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const { inscritos, borrarInscritos, nombreRango, BANS_MAX } = require('../utils/coliseo');
const torneo = require('../utils/coliseoTorneo');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coliseo')
    .setDescription('Gestiona el Coliseo del Abismo')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s
      .setName('inscripciones')
      .setDescription('Publica aquí el panel para que se apunten'))
    .addSubcommand(s => s
      .setName('sorteo')
      .setDescription('Publica aquí el panel para sortear los duelos'))
    .addSubcommand(s => s
      .setName('lista')
      .setDescription('Muestra quién está inscrito'))
    .addSubcommand(s => s
      .setName('reiniciar')
      .setDescription('Borra todas las inscripciones'))
    .addSubcommand(s => s
      .setName('cancelar')
      .setDescription('Descarta el torneo en curso sin tocar las inscripciones')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'inscripciones') {
      const embed = new EmbedBuilder()
        .setColor(0x0F2027)
        .setDescription(
          '## ⚔️ Coliseo del Abismo\n\n' +
          'Apúntate al torneo dejando tu **Riot ID** y tu **rango actual**.\n\n' +
          '> 🏅 Los duelos se sortean al azar entre los inscritos.\n' +
          `> 🚫 Cuanto mayor sea la diferencia de rango, **más campeones podrá vetar el de menor elo** (hasta ${BANS_MAX}).\n` +
          '> ✏️ Si te vuelves a inscribir, se actualizan tus datos.'
        )
        .setFooter({ text: 'Coliseo del Abismo ⚔️' });

      await interaction.channel.send({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('coliseo:inscribir')
            .setLabel('Inscribirme')
            .setEmoji('⚔️')
            .setStyle(ButtonStyle.Primary)
        )],
      });
      return interaction.reply({ content: '✅ Panel de inscripciones publicado.', ephemeral: true });
    }

    if (sub === 'sorteo') {
      const embed = new EmbedBuilder()
        .setColor(0x8B0000)
        .setDescription(
          '## 🎲 Sorteo de duelos\n\n' +
          'Pulsa el botón para emparejar al azar a los inscritos.\n\n' +
          '> Se mostrará la diferencia de rango de cada duelo y cuántos\n' +
          '> campeones podrá vetar el jugador de menor elo.'
        )
        .setFooter({ text: 'Solo los administradores pueden sortear' });

      await interaction.channel.send({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('coliseo:sortear')
            .setLabel('Sortear enfrentamientos')
            .setEmoji('🎲')
            .setStyle(ButtonStyle.Danger)
        )],
      });
      return interaction.reply({ content: '✅ Panel de sorteo publicado.', ephemeral: true });
    }

    if (sub === 'lista') {
      const lista = inscritos();
      if (!lista.length) return interaction.reply({ content: 'Todavía no hay nadie inscrito.', ephemeral: true });

      const texto = lista
        .slice()
        .sort((a, b) => (b.tier * 4 + b.division) - (a.tier * 4 + a.division))
        .map((i, n) => `\`${String(n + 1).padStart(2)}\` <@${i.userId}> · **${i.riotId}** · ${nombreRango(i)}`)
        .join('\n');

      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x0F2027)
          .setTitle(`⚔️ Inscritos (${lista.length})`)
          .setDescription(texto.slice(0, 4000))],
        ephemeral: true,
      });
    }

    if (sub === 'reiniciar') {
      const cuantos = inscritos().length;
      await borrarInscritos();
      await torneo.cancelar();
      return interaction.reply({
        content: `✅ Borradas **${cuantos}** inscripciones y el torneo en curso.`,
        ephemeral: true,
      });
    }

    if (sub === 'cancelar') {
      const actual = torneo.estado();
      if (!actual) return interaction.reply({ content: 'No hay ningún torneo en curso.', ephemeral: true });
      await torneo.cancelar();
      return interaction.reply({
        content: `✅ Torneo descartado (iba por ${actual.nombreRonda}). Las inscripciones se mantienen.`,
        ephemeral: true,
      });
    }
  },
};
