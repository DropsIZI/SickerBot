const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, xpForLevel } = require('../utils/levelManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Muestra tu nivel y XP actual')
    .addUserOption(o => o.setName('usuario').setDescription('Ver el rango de otro usuario').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getMember('usuario') || interaction.member;
    const data = getUser(target.id);
    const needed = xpForLevel(data.level + 1);
    const progress = Math.min(20, Math.max(0, Math.floor((data.xp / needed) * 20)));
    const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);

    const embed = new EmbedBuilder()
      .setColor(0xFF9EBB)
      .setTitle(`🍩 Rango de ${target.displayName}`)
      .setThumbnail(target.user.displayAvatarURL({ extension: 'png', size: 256 }))
      .setDescription(
        `**Nivel ${data.level}** 🎀\n\n` +
        `\`${bar}\`\n` +
        `**${data.xp}** / **${needed}** XP para el nivel ${data.level + 1}`
      )
      .setFooter({ text: 'SickerBot 🍩 • Sistema de niveles' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
