const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { loadConfig, saveConfig } = require('../utils/levelManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-canal-tarot')
    .setDescription('Limita /tarot a un solo canal')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(o =>
      o.setName('canal')
        .setDescription('Canal del tarot (deja vacío para permitirlo en todos)')
        .addChannelTypes(ChannelType.GuildText)
    ),

  async execute(interaction) {
    const canal = interaction.options.getChannel('canal');
    const config = loadConfig();

    await saveConfig({ ...config, tarotChannel: canal ? canal.id : null });

    await interaction.reply({
      content: canal
        ? `✅ El tarot solo funcionará en ${canal} 🔮`
        : '✅ El tarot se puede usar en cualquier canal.',
      ephemeral: true,
    });
  },
};
