const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags} = require('discord.js');
const { loadConfig, saveConfig } = require('../utils/levelManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-canal-clips')
    .setDescription('Define el canal donde se publicarán los clips')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(o =>
      o.setName('canal')
        .setDescription('Canal de destino (deja vacío para desactivar)')
        .addChannelTypes(ChannelType.GuildText)
    ),

  async execute(interaction) {
    const canal = interaction.options.getChannel('canal');
    const config = loadConfig();

    await saveConfig({ ...config, clipsChannel: canal ? canal.id : null });

    await interaction.reply({
      content: canal
        ? `✅ Los clips se publicarán en ${canal}.\nCualquiera puede compartir uno con \`/clip\`.`
        : '✅ Desactivado. `/clip` publicará en el canal donde se use.',
      flags: MessageFlags.Ephemeral,
    });
  },
};
