const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { generateModCard } = require('../utils/modCard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa a un usuario del servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(o => o.setName('usuario').setDescription('Usuario a kickear').setRequired(true))
    .addStringOption(o => o.setName('razon').setDescription('Razón del kick').setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();
    const target = interaction.options.getMember('usuario');
    const razon = interaction.options.getString('razon') || 'Sin razón especificada';

    if (!target) return interaction.editReply({ content: '❌ Usuario no encontrado.' });
    if (!target.kickable) return interaction.editReply({ content: '❌ No puedo kickear a este usuario.' });
    if (target.id === interaction.user.id) return interaction.editReply({ content: '❌ No puedes kickearte a ti mismo.' });

    try {
      const buffer = await generateModCard(target, 'kick');
      const attachment = new AttachmentBuilder(buffer, { name: 'kick.png' });

      const embed = new EmbedBuilder()
        .setColor(0xFF8C00)
        .setDescription(`👢 **¡Esta rosca no era fresca!** ${target} ha sido **kickeado**.\n> **Razón:** ${razon}\n> **Moderador:** ${interaction.user}`)
        .setImage('attachment://kick.png')
        .setTimestamp();

      await target.kick(`${razon} | Moderador: ${interaction.user.tag}`);
      await interaction.editReply({ embeds: [embed], files: [attachment] });

      await logModAction(interaction, '👢 KICK', target, razon, 0xFF8C00);
    } catch (err) {
      console.error('[kick]', err);
      await interaction.editReply({ content: '❌ Error al kickear al usuario.' });
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
