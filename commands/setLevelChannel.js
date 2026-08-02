const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { loadConfig, saveConfig } = require('../utils/levelManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-level-channel')
    .setDescription('Configura el canal donde se anuncian las subidas de nivel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(o =>
      o.setName('canal').setDescription('Canal para los anuncios de nivel').setRequired(true)
    ),

  async execute(interaction) {
    const canal = interaction.options.getChannel('canal');
    const config = loadConfig();
    config.levelUpChannel = canal.id;
    saveConfig(config);

    await interaction.reply({
      content: `✅ Las subidas de nivel se anunciarán en ${canal}.`,
      ephemeral: true,
    });
  },
};
