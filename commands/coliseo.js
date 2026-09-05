const {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} = require('discord.js');
const {
  inscritos, borrarInscritos, desinscribir, marcarPendientes,
  nombreRango, iconoConfirmacion, BANS_MAX,
} = require('../utils/coliseo');
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
      .setName('quitar')
      .setDescription('Saca a alguien puntual de la lista de inscritos')
      .addStringOption(o => o
        .setName('riotid')
        .setDescription('Riot ID del inscrito (empieza a escribir para buscar)')
        .setRequired(true)
        .setAutocomplete(true)))
    .addSubcommand(s => s
      .setName('confirmar')
      .setDescription('Manda un DM a los inscritos para que confirmen asistencia'))
    .addSubcommand(s => s
      .setName('reiniciar')
      .setDescription('Borra todas las inscripciones'))
    .addSubcommand(s => s
      .setName('cancelar')
      .setDescription('Descarta el torneo en curso sin tocar las inscripciones')),

  async autocomplete(interaction) {
    const foco = interaction.options.getFocused().toLowerCase();
    const opciones = inscritos()
      .filter(i => i.riotId.toLowerCase().includes(foco))
      .slice(0, 25)
      .map(i => ({ name: `${i.riotId} · ${nombreRango(i)}`.slice(0, 100), value: i.riotId }));
    await interaction.respond(opciones);
  },

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
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('coliseo:desinscribir')
            .setLabel('Desinscribirme')
            .setEmoji('❌')
            .setStyle(ButtonStyle.Secondary)
        )],
      });
      return interaction.reply({ content: '✅ Panel de inscripciones publicado.', flags: MessageFlags.Ephemeral });
    }

    if (sub === 'sorteo') {
      const embed = new EmbedBuilder()
        .setColor(0x8B0000)
        .setDescription(
          '## 🎲 Sorteo de duelos\n\n' +
          'Pulsa el botón para emparejar al azar a los inscritos.\n\n' +
          '> Se mostrará la diferencia de rango de cada duelo y cuántos\n' +
          '> campeones podrá vetar el jugador de menor elo.\n' +
          '> ✅ Si ya se pidió confirmación, solo entran quienes confirmaron.\n' +
          '> 🎟️ Si son impares, uno pasa sin jugar (se turna cada ronda).'
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
      return interaction.reply({ content: '✅ Panel de sorteo publicado.', flags: MessageFlags.Ephemeral });
    }

    if (sub === 'lista') {
      const lista = inscritos();
      if (!lista.length) return interaction.reply({ content: 'Todavía no hay nadie inscrito.', flags: MessageFlags.Ephemeral });

      const texto = lista
        .slice()
        .sort((a, b) => (b.tier * 4 + b.division) - (a.tier * 4 + a.division))
        .map((i, n) => `\`${String(n + 1).padStart(2)}\` ${iconoConfirmacion(i.confirmado)} <@${i.userId}> · **${i.riotId}** · ${nombreRango(i)}`)
        .join('\n');

      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x0F2027)
          .setTitle(`⚔️ Inscritos (${lista.length})`)
          .setDescription(texto.slice(0, 4000))],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (sub === 'quitar') {
      const riotid = interaction.options.getString('riotid');
      const match = inscritos().find(i => i.riotId.toLowerCase() === riotid.toLowerCase());
      if (!match) {
        return interaction.reply({ content: `No encontré a nadie inscrito con el Riot ID **${riotid}**.`, flags: MessageFlags.Ephemeral });
      }
      await desinscribir(match.userId);
      return interaction.reply({ content: `✅ Saqué a **${match.riotId}** (<@${match.userId}>) de la lista de inscritos.`, flags: MessageFlags.Ephemeral });
    }

    if (sub === 'confirmar') {
      const pendientes = inscritos().filter(i => i.confirmado !== true);
      if (!pendientes.length) {
        return interaction.reply({ content: 'Todos los inscritos ya confirmaron su asistencia.', flags: MessageFlags.Ephemeral });
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const enviados = [];
      const fallidos = [];

      for (const i of pendientes) {
        try {
          const usuario = await interaction.client.users.fetch(i.userId);
          await usuario.send({
            embeds: [new EmbedBuilder()
              .setColor(0x0F2027)
              .setTitle('⚔️ Confirma tu asistencia al Coliseo del Abismo')
              .setDescription(`Estás inscrito como **${i.riotId}**.\n\n¿Vas a poder jugar? Confirma abajo.`)],
            components: [new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('coliseo:confirmar:si').setLabel('Sí, confirmo').setEmoji('✅').setStyle(ButtonStyle.Success),
              new ButtonBuilder().setCustomId('coliseo:confirmar:no').setLabel('No podré ir').setEmoji('❌').setStyle(ButtonStyle.Danger),
            )],
          });
          enviados.push(i.userId);
        } catch {
          fallidos.push(i);
        }
      }

      if (enviados.length) await marcarPendientes(enviados);

      let resumen = `✅ DM enviado a **${enviados.length}** inscrito(s).`;
      if (fallidos.length) {
        resumen += `\n⚠️ No pude escribirle a **${fallidos.length}**: ${fallidos.map(f => f.riotId).join(', ')}`;
      }
      return interaction.editReply(resumen);
    }

    if (sub === 'reiniciar') {
      const cuantos = inscritos().length;
      await borrarInscritos();
      await torneo.cancelar();
      return interaction.reply({
        content: `✅ Borradas **${cuantos}** inscripciones y el torneo en curso.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    if (sub === 'cancelar') {
      const actual = torneo.estado();
      if (!actual) return interaction.reply({ content: 'No hay ningún torneo en curso.', flags: MessageFlags.Ephemeral });
      await torneo.cancelar();
      return interaction.reply({
        content: `✅ Torneo descartado (iba por ${actual.nombreRonda}). Las inscripciones se mantienen.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
