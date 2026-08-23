const {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} = require('discord.js');
const { REDES, textoHorario } = require('../utils/redes');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('redes')
    .setDescription('Publica las redes de Sick con botones')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addAttachmentOption(o =>
      o.setName('banner').setDescription('Imagen de cabecera')
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!REDES.length) {
      return interaction.editReply('❌ No hay redes configuradas en `utils/redes.js`.');
    }

    const banner = interaction.options.getAttachment('banner');
    if (banner && !banner.contentType?.startsWith('image/')) {
      return interaction.editReply('❌ El banner tiene que ser una imagen.');
    }

    const embed = new EmbedBuilder()
      .setColor(0xFF85A1)
      .setDescription(
        '## 🩷 Mis Redes OwO\n\n' +
        'Sígueme en todas para no perderte nada 🍩\n' +
        'Los directos los aviso por aquí en cuanto empiezan ✨'
      )
      .addFields({ name: '🕐 Horario de directos', value: textoHorario() })
      .setFooter({ text: 'SickerBot 🍩 • Comunidad Rosquita' });

    if (banner) embed.setImage(banner.url);

    // Los botones de enlace no necesitan manejador: Discord abre la URL
    const filas = [];
    for (let i = 0; i < REDES.length; i += 5) {
      filas.push(new ActionRowBuilder().addComponents(
        REDES.slice(i, i + 5).map(r =>
          new ButtonBuilder()
            .setLabel(r.nombre)
            .setEmoji(r.emoji)
            .setStyle(ButtonStyle.Link)
            .setURL(r.url)
        )
      ));
    }

    await interaction.channel.send({ embeds: [embed], components: filas });

    await interaction.editReply(
      `✅ Publicado con **${REDES.length}** red(es).\n` +
      'Para añadir más, edita `utils/redes.js` y vuelve a lanzar el comando.'
    );
  },
};
