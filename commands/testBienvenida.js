const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { generateWelcomeCard } = require('../utils/welcomeCard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test-bienvenida')
    .setDescription('Previsualiza la tarjeta de bienvenida sin que entre nadie')
    .addUserOption(o =>
      o.setName('usuario').setDescription('De quién simular la bienvenida (por defecto tú)')
    )
    .addBooleanOption(o =>
      o.setName('publicar')
        .setDescription('Enviarla al canal de bienvenida de verdad (por defecto no)')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Generar el canvas y descargar el avatar tarda más de 3s a veces
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getUser('usuario') || interaction.user;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.editReply('❌ Ese usuario no está en el servidor.');
    }

    let buffer;
    try {
      buffer = await generateWelcomeCard(member);
    } catch (err) {
      console.error('[test-bienvenida]', err);
      return interaction.editReply(`❌ Error generando la tarjeta: \`${err.message}\``);
    }

    const attachment = new AttachmentBuilder(buffer, { name: 'bienvenida.png' });

    if (interaction.options.getBoolean('publicar')) {
      const channelId = process.env.WELCOME_CHANNEL_ID;
      if (!channelId) return interaction.editReply('❌ WELCOME_CHANNEL_ID no está configurado.');

      const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.editReply('❌ No encuentro el canal de bienvenida.');

      await channel.send({
        content: `¡Hola ${member}! Bienvenid@ al servidor de **Sick** 🍩🎀`,
        files: [attachment],
      });
      return interaction.editReply(`✅ Enviada a ${channel}.`);
    }

    const bgOk = require('fs').existsSync(require('path').join(__dirname, '../assets/welcome-bg.png'));
    await interaction.editReply({
      content: `🎀 Vista previa (solo la ves tú).\n` +
        `Fondo: ${bgOk ? '`assets/welcome-bg.png`' : '⚠️ degradado rosa (falta `assets/welcome-bg.png`)'}\n` +
        `Usa \`publicar:True\` para mandarla al canal de verdad.`,
      files: [attachment],
    });
  },
};
