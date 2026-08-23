const { SlashCommandBuilder, MessageFlags} = require('discord.js');
const { marcarOffline, enVivoAhora } = require('../utils/liveStatus');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fin-stream')
    .setDescription('Marca que terminaste el stream y devuelve el canal a su estado normal'),

  async execute(interaction) {
    const streamerRoleId = process.env.STREAMER_ROLE_ID;
    if (!streamerRoleId) {
      return interaction.reply({ content: '⚠️ STREAMER_ROLE_ID no está configurado en el servidor.', flags: MessageFlags.Ephemeral });
    }
    if (!interaction.member.roles.cache.has(streamerRoleId)) {
      return interaction.reply({ content: '❌ Necesitas el rol de Streamer para usar este comando.', flags: MessageFlags.Ephemeral });
    }

    if (!enVivoAhora.has(interaction.user.id)) {
      return interaction.reply({ content: 'ℹ️ No constabas como en vivo, no hay nada que cerrar.', flags: MessageFlags.Ephemeral });
    }

    await marcarOffline(interaction.guild, interaction.user.id);

    await interaction.reply({
      content: '✅ Stream cerrado. ¡Gracias por transmitir! 🍩',
      flags: MessageFlags.Ephemeral,
    });
  },
};
