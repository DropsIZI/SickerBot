const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { generateModCard } = require('../utils/modCard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Quita el silencio a un usuario')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('usuario').setDescription('Usuario a des-silenciar').setRequired(true))
    .addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();
    const target = interaction.options.getMember('usuario');
    const razon = interaction.options.getString('razon') || 'Sin razón especificada';

    if (!target) return interaction.editReply({ content: '❌ Usuario no encontrado.' });
    if (!target.isCommunicationDisabled()) return interaction.editReply({ content: '❌ Este usuario no está silenciado.' });

    try {
      const buffer = await generateModCard(target, 'unmute');
      const attachment = new AttachmentBuilder(buffer, { name: 'unmute.png' });

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setDescription(`🔊 **¡La rosca puede hablar de nuevo!** ${target} ha sido **des-silenciado**.\n> **Moderador:** ${interaction.user}`)
        .setImage('attachment://unmute.png')
        .setTimestamp();

      await target.timeout(null, `${razon} | Moderador: ${interaction.user.tag}`);
      await interaction.editReply({ embeds: [embed], files: [attachment] });
    } catch (err) {
      console.error('[unmute]', err);
      await interaction.editReply({ content: '❌ Error al des-silenciar al usuario.' });
    }
  },
};
