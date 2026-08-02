const { SlashCommandBuilder } = require('discord.js');
const { marcarOffline, enVivoAhora } = require('../utils/liveStatus');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fin-stream')
    .setDescription('Marca que terminaste el stream y devuelve el canal a su estado normal'),

  async execute(interaction) {
    const streamerRoleId = process.env.STREAMER_ROLE_ID;
    if (streamerRoleId && !interaction.member.roles.cache.has(streamerRoleId)) {
      return interaction.reply({ content: '❌ Necesitas el rol de Streamer para usar este comando.', ephemeral: true });
    }

    if (!enVivoAhora.has(interaction.user.id)) {
      return interaction.reply({ content: 'ℹ️ No constabas como en vivo, no hay nada que cerrar.', ephemeral: true });
    }

    await marcarOffline(interaction.guild, interaction.user.id);

    await interaction.reply({
      content: '✅ Stream cerrado. ¡Gracias por transmitir! 🍩',
      ephemeral: true,
    });
  },
};
