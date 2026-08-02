const { addXP, isOnCooldown, setCooldown, getLevelUpMessage, loadConfig } = require('../utils/levelManager');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    if (isOnCooldown(message.author.id)) return;
    setCooldown(message.author.id);

    const xpGain = Math.floor(Math.random() * 11) + 15; // 15-25 XP aleatorio
    const result = addXP(message.author.id, xpGain);

    if (!result.leveledUp) return;

    const config = loadConfig();
    const levelUpChannelId = config.levelUpChannel || process.env.LEVEL_UP_CHANNEL_ID;

    try {
      const channel = levelUpChannelId
        ? await client.channels.fetch(levelUpChannelId).catch(() => message.channel)
        : message.channel;

      await channel.send(getLevelUpMessage(message.author, result.level));
    } catch (err) {
      console.error('[levelUp send]', err);
    }

    // Asignar rol si está configurado para este nivel
    if (config.levelRoles?.[result.level]) {
      try {
        const role = await message.guild.roles.fetch(config.levelRoles[result.level]).catch(() => null);
        if (role) await message.member.roles.add(role).catch(console.error);
      } catch (err) {
        console.error('[levelRole]', err);
      }
    }
  },
};
