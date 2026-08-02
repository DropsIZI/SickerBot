const { AttachmentBuilder } = require('discord.js');
const { generateWelcomeCard } = require('../utils/welcomeCard');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    try {
      const channelId = process.env.WELCOME_CHANNEL_ID;
      if (!channelId) return;

      const channel = await member.guild.channels.fetch(channelId).catch(() => null);
      if (!channel) return;

      const buffer = await generateWelcomeCard(member);
      const attachment = new AttachmentBuilder(buffer, { name: 'bienvenida.png' });

      await channel.send({
        content: `¡Hola ${member}! Bienvenid@ al servidor de **Sick** 🍩🎀`,
        files: [attachment],
      });
    } catch (err) {
      console.error('[guildMemberAdd]', err);
    }
  },
};
