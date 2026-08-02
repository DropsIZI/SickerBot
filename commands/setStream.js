const { SlashCommandBuilder } = require('discord.js');
const { streamLinks } = require('../utils/streamStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-stream')
    .setDescription('Guarda el link de tu canal de stream')
    .addStringOption(o =>
      o.setName('plataforma')
        .setDescription('Plataforma donde streameas')
        .setRequired(true)
        .addChoices(
          { name: 'TikTok',  value: 'TikTok' },
          { name: 'Kick',    value: 'Kick' },
          { name: 'Twitch',  value: 'Twitch' },
          { name: 'YouTube', value: 'YouTube' },
        )
    )
    .addStringOption(o =>
      o.setName('link').setDescription('Link de tu canal').setRequired(true)
    ),

  async execute(interaction) {
    const streamerRoleId = process.env.STREAMER_ROLE_ID;
    if (streamerRoleId && !interaction.member.roles.cache.has(streamerRoleId)) {
      return interaction.reply({ content: '❌ Necesitas el rol de Streamer para usar este comando.', ephemeral: true });
    }

    const plataforma = interaction.options.getString('plataforma');
    const link = interaction.options.getString('link');

    if (!streamLinks.has(interaction.user.id)) streamLinks.set(interaction.user.id, new Map());
    streamLinks.get(interaction.user.id).set(plataforma, link);

    const todos = [...streamLinks.get(interaction.user.id).entries()]
      .map(([p, l]) => `**${p}:** ${l}`).join('\n');

    await interaction.reply({
      content: `✅ Link de **${plataforma}** guardado.\n\n📋 Tus canales:\n${todos}`,
      ephemeral: true,
    });
  },
};
