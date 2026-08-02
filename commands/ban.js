const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { generateModCard } = require('../utils/modCard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banea a un usuario del servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o => o.setName('usuario').setDescription('Usuario a banear').setRequired(true))
    .addStringOption(o => o.setName('razon').setDescription('Razón del ban').setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();
    const target = interaction.options.getMember('usuario');
    const razon = interaction.options.getString('razon') || 'Sin razón especificada';

    if (!target) return interaction.editReply({ content: '❌ Usuario no encontrado.' });
    if (!target.bannable) return interaction.editReply({ content: '❌ No puedo banear a este usuario.' });
    if (target.id === interaction.user.id) return interaction.editReply({ content: '❌ No puedes banearte a ti mismo.' });

    try {
      const buffer = await generateModCard(target, 'ban');
      const attachment = new AttachmentBuilder(buffer, { name: 'ban.png' });

      const embed = new EmbedBuilder()
        .setColor(0xFF4444)
        .setDescription(`🔨 **¡Fuera del horno!** ${target} ha sido **baneado permanentemente**.\n> **Razón:** ${razon}\n> **Moderador:** ${interaction.user}`)
        .setImage('attachment://ban.png')
        .setTimestamp();

      await target.ban({ reason: `${razon} | Moderador: ${interaction.user.tag}` });
      await interaction.editReply({ embeds: [embed], files: [attachment] });

      await logModAction(interaction, '🔨 BAN', target, razon, 0xFF4444);
    } catch (err) {
      console.error('[ban]', err);
      await interaction.editReply({ content: '❌ Error al banear al usuario.' });
    }
  },
};

async function logModAction(interaction, action, target, razon, color) {
  const logChannelId = process.env.MOD_LOG_CHANNEL_ID;
  if (!logChannelId) return;
  try {
    const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
    if (!logChannel) return;
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(action)
      .addFields(
        { name: 'Usuario', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
        { name: 'Razón', value: razon },
      )
      .setTimestamp();
    await logChannel.send({ embeds: [embed] });
  } catch {}
}
