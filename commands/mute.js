const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { generateModCard } = require('../utils/modCard');

const DURACIONES = {
  '60':    { label: '1 minuto',   ms: 60_000 },
  '300':   { label: '5 minutos',  ms: 300_000 },
  '600':   { label: '10 minutos', ms: 600_000 },
  '3600':  { label: '1 hora',     ms: 3_600_000 },
  '86400': { label: '1 día',      ms: 86_400_000 },
  '604800':{ label: '7 días',     ms: 604_800_000 },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Silencia a un usuario temporalmente')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('usuario').setDescription('Usuario a silenciar').setRequired(true))
    .addStringOption(o =>
      o.setName('duracion')
        .setDescription('¿Cuánto tiempo?')
        .setRequired(true)
        .addChoices(
          { name: '1 minuto',   value: '60' },
          { name: '5 minutos',  value: '300' },
          { name: '10 minutos', value: '600' },
          { name: '1 hora',     value: '3600' },
          { name: '1 día',      value: '86400' },
          { name: '7 días',     value: '604800' },
        )
    )
    .addStringOption(o => o.setName('razon').setDescription('Razón del silencio').setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();
    const target = interaction.options.getMember('usuario');
    const durKey = interaction.options.getString('duracion');
    const razon = interaction.options.getString('razon') || 'Sin razón especificada';
    const dur = DURACIONES[durKey];

    if (!target) return interaction.editReply({ content: '❌ Usuario no encontrado.' });
    if (!target.moderatable) return interaction.editReply({ content: '❌ No puedo silenciar a este usuario.' });
    if (target.id === interaction.user.id) return interaction.editReply({ content: '❌ No puedes silenciarte a ti mismo.' });

    try {
      const buffer = await generateModCard(target, 'mute');
      const attachment = new AttachmentBuilder(buffer, { name: 'mute.png' });

      const embed = new EmbedBuilder()
        .setColor(0xFF9EBB)
        .setDescription(`🔇 **¡Esa rosca se está portando mal!** ${target} ha sido **silenciado** por **${dur.label}**.\n> **Razón:** ${razon}\n> **Moderador:** ${interaction.user}`)
        .setImage('attachment://mute.png')
        .setTimestamp();

      await target.timeout(dur.ms, `${razon} | Moderador: ${interaction.user.tag}`);
      await interaction.editReply({ embeds: [embed], files: [attachment] });

      await logModAction(interaction, '🔇 MUTE', target, razon, dur.label, 0xFF9EBB);
    } catch (err) {
      console.error('[mute]', err);
      await interaction.editReply({ content: '❌ Error al silenciar al usuario.' });
    }
  },
};

async function logModAction(interaction, action, target, razon, duracion, color) {
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
        { name: 'Duración', value: duracion, inline: true },
        { name: 'Razón', value: razon },
      )
      .setTimestamp();
    await logChannel.send({ embeds: [embed] });
  } catch {}
}
