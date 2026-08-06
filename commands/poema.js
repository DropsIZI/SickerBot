const {
  SlashCommandBuilder, ModalBuilder, TextInputBuilder,
  TextInputStyle, ActionRowBuilder,
} = require('discord.js');
const { loadConfig } = require('../utils/levelManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poema')
    .setDescription('Comparte un poema en el canal de poemas')
    .addBooleanOption(o =>
      o.setName('anonimo').setDescription('Publicarlo sin revelar quién lo escribió')
    ),

  async execute(interaction) {
    const canalPoemas = loadConfig().poemasChannel;
    if (canalPoemas && interaction.channelId !== canalPoemas) {
      return interaction.reply({
        content: `❌ Los poemas se publican en <#${canalPoemas}> ✍️`,
        ephemeral: true,
      });
    }

    const anonimo = interaction.options.getBoolean('anonimo') === true;

    // Un formulario en lugar de opciones sueltas: es la unica forma de
    // escribir varias lineas en Discord
    const modal = new ModalBuilder()
      .setCustomId('modal-poema:' + (anonimo ? 'anon' : 'firmado'))
      .setTitle('Escribe tu poema');

    const titulo = new TextInputBuilder()
      .setCustomId('titulo')
      .setLabel('Título')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setPlaceholder('Un título para tu poema')
      .setRequired(true);

    const texto = new TextInputBuilder()
      .setCustomId('texto')
      .setLabel('Poema')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(3800)
      .setPlaceholder('Escribe aquí. Los saltos de línea se respetan.')
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(titulo),
      new ActionRowBuilder().addComponents(texto),
    );

    await interaction.showModal(modal);
  },
};
