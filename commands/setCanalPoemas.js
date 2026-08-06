const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { loadConfig, saveConfig } = require('../utils/levelManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-canal-poemas')
    .setDescription('Define el canal donde se publican los poemas')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(o =>
      o.setName('canal')
        .setDescription('Canal de destino (deja vacío para permitirlo en todos)')
        .addChannelTypes(ChannelType.GuildText)
    ),

  async execute(interaction) {
    const canal = interaction.options.getChannel('canal');
    const config = loadConfig();

    await saveConfig({ ...config, poemasChannel: canal ? canal.id : null });

    await interaction.reply({
      content: canal
        ? `✅ Los poemas se publicarán en ${canal} ✍️`
        : '✅ El comando `/poema` se podrá usar en cualquier canal.',
      ephemeral: true,
    });
  },
};
