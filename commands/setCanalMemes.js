const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { loadConfig, saveConfig } = require('../utils/levelManager');
const { FUENTES } = require('../utils/redditWatcher');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-canal-memes')
    .setDescription('Define dónde se publican los memes de Reddit automáticamente')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(o =>
      o.setName('canal')
        .setDescription('Canal de destino (deja vacío para desactivar)')
        .addChannelTypes(ChannelType.GuildText)
    ),

  async execute(interaction) {
    const canal = interaction.options.getChannel('canal');
    const config = loadConfig();

    await saveConfig({ ...config, memesChannel: canal ? canal.id : null });

    await interaction.reply({
      content: canal
        ? `✅ Publicaré **2 memes cada 30 minutos** en ${canal} (unos 96 al día).\n` +
          `Fuentes: ${FUENTES.map(f => '`r/' + f + '`').join(', ')}`
        : '✅ Memes automáticos desactivados. `/meme` sigue funcionando.',
      ephemeral: true,
    });
  },
};
