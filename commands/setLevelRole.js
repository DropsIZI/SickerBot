const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags} = require('discord.js');
const { loadConfig, saveConfig } = require('../utils/levelManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-level-role')
    .setDescription('Asigna un rol que se dará automáticamente al llegar a un nivel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption(o =>
      o.setName('nivel').setDescription('Nivel requerido').setRequired(true).setMinValue(1)
    )
    .addRoleOption(o =>
      o.setName('rol').setDescription('Rol a asignar (deja vacío para quitar)').setRequired(false)
    ),

  async execute(interaction) {
    const nivel = interaction.options.getInteger('nivel');
    const rol = interaction.options.getRole('rol');

    const config = loadConfig();
    if (!config.levelRoles) config.levelRoles = {};

    if (rol) {
      config.levelRoles[nivel] = rol.id;
      saveConfig(config);
      await interaction.reply({
        content: `✅ Al llegar al **nivel ${nivel}** se asignará el rol **${rol.name}** automáticamente.`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      delete config.levelRoles[nivel];
      saveConfig(config);
      await interaction.reply({
        content: `✅ Se quitó el rol configurado para el **nivel ${nivel}**.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
