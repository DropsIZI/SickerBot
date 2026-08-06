const { SlashCommandBuilder } = require('discord.js');
const { unoNuevo } = require('../utils/redditWatcher');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Trae un meme de Reddit al momento'),

  async execute(interaction) {
    await interaction.deferReply();

    let post;
    try {
      post = await unoNuevo();
    } catch (err) {
      console.error('[meme]', err);
      return interaction.editReply('❌ Reddit no responde ahora mismo. Prueba en un rato.');
    }

    if (!post) return interaction.editReply('❌ No encontré ninguno nuevo. Prueba de nuevo en un rato.');

    const { mensajeDe } = require('../utils/redditWatcher');
    await interaction.editReply(mensajeDe(post));
  },
};
