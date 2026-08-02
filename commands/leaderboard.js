const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('../utils/levelManager');

const MEDALS = ['🥇', '🥈', '🥉'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Muestra el top 10 de niveles del servidor'),

  async execute(interaction) {
    await interaction.deferReply();
    const top = getLeaderboard();

    if (top.length === 0) {
      return interaction.editReply({ content: '🍩 Aún nadie ha ganado XP. ¡Empieza a chatear!' });
    }

    const lines = await Promise.all(top.map(async (entry, i) => {
      const medal = MEDALS[i] || `**${i + 1}.**`;
      let name = `<@${entry.id}>`;
      try {
        const member = await interaction.guild.members.fetch(entry.id).catch(() => null);
        if (member) name = member.displayName;
      } catch {}
      return `${medal} **${name}** — Nivel ${entry.level} *(${entry.xp} XP)*`;
    }));

    const embed = new EmbedBuilder()
      .setColor(0xFF9EBB)
      .setTitle('🍩 Top 10 — Leaderboard de Niveles')
      .setDescription(lines.join('\n'))
      .setFooter({ text: 'SickerBot 🍩 • Sigue chateando para subir de nivel' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
