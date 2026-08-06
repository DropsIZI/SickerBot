const { SlashCommandBuilder } = require('discord.js');
const { unoNuevo } = require('../utils/redditWatcher');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Trae un meme de Reddit al momento'),

  async execute(interaction) {
    if (!process.env.REDDIT_CLIENT_ID) {
      return interaction.reply({
        content: '❌ Faltan las credenciales de Reddit. Un admin debe configurarlas.',
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    let post;
    try {
      post = await unoNuevo();
    } catch (err) {
      console.error('[meme]', err);
      return interaction.editReply('❌ Reddit no responde ahora mismo. Prueba en un rato.');
    }

    if (!post) return interaction.editReply('❌ No encontré ninguno nuevo. Prueba de nuevo en un rato.');

    const { embedDe } = require('../utils/redditWatcher');
    await interaction.editReply({ embeds: [embedDe(post)] });
  },
};
