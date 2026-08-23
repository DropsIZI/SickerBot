const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags} = require('discord.js');
const { REGLAS, SANCIONES } = require('../utils/reglas');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reglas')
    .setDescription('Publica las reglas del servidor con formato')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addAttachmentOption(o =>
      o.setName('banner').setDescription('Imagen de cabecera para las reglas')
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const banner = interaction.options.getAttachment('banner');
    if (banner && !banner.contentType?.startsWith('image/')) {
      return interaction.editReply('❌ El banner tiene que ser una imagen.');
    }
    if (banner) await interaction.channel.send({ files: [banner.url] });

    const principal = new EmbedBuilder()
      .setColor(0xFF85A1)
      .setTitle('✨  SIGUE LAS REGLAS  ✨')
      .setDescription(
        `Bienvenid@ a la comunidad de **Sick** 🍩\n` +
        `Para que esto siga siendo un lugar agradable, lee esto antes de participar.\n` +
        `─────────────────────────`
      )
      .addFields(REGLAS.map((r, i) => ({
        name: `${r.emoji}  ${i + 1}. ${r.titulo}`,
        value: r.texto,
      })));

    const sanciones = new EmbedBuilder()
      .setColor(0xC2556E)
      .setTitle('💠  SISTEMA DE SANCIONES')
      .setDescription(
        SANCIONES.join('\n') +
        '\n\n> *La sanción puede variar según la gravedad de la falta.*'
      );

    const cierre = new EmbedBuilder()
      .setColor(0xFFC8DD)
      .setTitle('🌈  ¡Disfruta la comunidad Sicker!')
      .setDescription(
        'Participa, habla con la gente, juega, comparte memes ' +
        'y ayuda a mantener el servidor vivo 🎀'
      )
      .setFooter({ text: 'SickerBot 🍩 • Comunidad Rosquita' })
      .setTimestamp();

    await interaction.channel.send({ embeds: [principal, sanciones, cierre] });

    await interaction.editReply(
      '✅ Reglas publicadas.\n' +
      'Para cambiarlas, edita `utils/reglas.js` y vuelve a lanzar el comando.'
    );
  },
};
