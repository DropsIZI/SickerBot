const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLinks } = require('../utils/streamStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('en-vivo')
    .setDescription('Notifica que estás en stream en vivo')
    .addStringOption(o =>
      o.setName('titulo').setDescription('Título del stream').setRequired(true)
    ),

  async execute(interaction) {
    const streamerRoleId = process.env.STREAMER_ROLE_ID;
    if (streamerRoleId && !interaction.member.roles.cache.has(streamerRoleId)) {
      return interaction.reply({ content: '❌ Necesitas el rol de Streamer para usar este comando.', ephemeral: true });
    }

    const links = getLinks(interaction.user.id);
    if (links.size === 0) {
      return interaction.reply({ content: '❌ Primero configura tus links con `/set-stream`.', ephemeral: true });
    }

    const titulo = interaction.options.getString('titulo');
    const streamChannelId = process.env.STREAM_CHANNEL_ID;
    if (!streamChannelId) return interaction.reply({ content: '❌ STREAM_CHANNEL_ID no configurado.', ephemeral: true });

    const channel = await interaction.guild.channels.fetch(streamChannelId).catch(() => null);
    if (!channel) return interaction.reply({ content: '❌ Canal de streams no encontrado.', ephemeral: true });

    const linksText = [...links.entries()]
      .map(([p, l]) => `> 🔗 **${p}:** ${l}`).join('\n');

    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('🔴  ¡STREAM EN VIVO! 🍩')
      .setDescription(
        `### ${interaction.user.username} está transmitiendo ahora 🎀\n\n` +
        `> 📺 **${titulo}**\n\n` +
        `${linksText}`
      )
      .setThumbnail(interaction.user.displayAvatarURL({ extension: 'png', size: 256 }))
      .setFooter({ text: 'SickerBot 🍩 • ¡No te lo pierdas!' })
      .setTimestamp();

    const pingRoleId = process.env.PING_ROLE_ID;
    await channel.send({
      content: `🔴 ${pingRoleId ? `<@&${pingRoleId}>` : ''} ¡**${interaction.user.username}** está en vivo!`,
      embeds: [embed],
    });

    await interaction.reply({ content: '✅ ¡Notificación enviada! 🎉', ephemeral: true });
  },
};
