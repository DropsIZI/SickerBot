const { ActivityType, EmbedBuilder } = require('discord.js');
const { streamLinks } = require('../utils/streamStore');
const { marcarEnVivo, marcarOffline } = require('../utils/liveStatus');

// userId -> timestamp del último aviso, para no repetir si la presencia parpadea
const ultimoAviso = new Map();
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutos

const getStreaming = presence =>
  presence?.activities?.find(a => a.type === ActivityType.Streaming) || null;

module.exports = {
  name: 'presenceUpdate',
  async execute(oldPresence, newPresence, client) {
    if (!newPresence?.guild) return;

    const antes = getStreaming(oldPresence);
    const ahora = getStreaming(newPresence);

    // Nada cambió respecto al stream
    if ((antes && ahora) || (!antes && !ahora)) return;

    const member = newPresence.member
      || await newPresence.guild.members.fetch(newPresence.userId).catch(() => null);
    if (!member || member.user.bot) return;

    const streamerRoleId = process.env.STREAMER_ROLE_ID;
    if (streamerRoleId && !member.roles.cache.has(streamerRoleId)) return;

    // El stream TERMINÓ → devolver el canal/categoría a "sin stream"
    if (antes && !ahora) {
      await marcarOffline(newPresence.guild, member.id);
      return;
    }

    // El stream ARRANCÓ
    await marcarEnVivo(newPresence.guild, member.id);

    const streamChannelId = process.env.STREAM_CHANNEL_ID;
    if (!streamChannelId) return;

    const previo = ultimoAviso.get(member.id);
    if (previo && Date.now() - previo < COOLDOWN_MS) return;
    ultimoAviso.set(member.id, Date.now());

    const channel = await newPresence.guild.channels.fetch(streamChannelId).catch(() => null);
    if (!channel) return;

    const titulo = ahora.details || ahora.name || 'Stream en vivo';
    const categoria = ahora.state;

    // Link que reporta Discord (Twitch/YouTube) + los guardados con /set-stream
    const links = streamLinks.get(member.id);
    const extras = links && links.size
      ? [...links.entries()].map(([p, l]) => `> 🔗 **${p}:** ${l}`).join('\n')
      : null;

    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('🔴  ¡STREAM EN VIVO! 🍩')
      .setDescription(
        `### ${member.displayName} está transmitiendo ahora 🎀\n\n` +
        `> 📺 **${titulo}**\n` +
        (categoria ? `> 🎮 ${categoria}\n` : '') +
        (ahora.url ? `\n> ▶️ ${ahora.url}\n` : '') +
        (extras ? `\n${extras}` : '')
      )
      .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 }))
      .setFooter({ text: 'SickerBot 🍩 • ¡No te lo pierdas!' })
      .setTimestamp();

    if (ahora.url) embed.setURL(ahora.url);

    const pingRoleId = process.env.PING_ROLE_ID;
    await channel.send({
      content: `🔴 ${pingRoleId ? `<@&${pingRoleId}>` : ''} ¡**${member.displayName}** está en vivo!`,
      embeds: [embed],
    }).catch(err => console.error('[presenceUpdate] no se pudo anunciar:', err.message));
  },
};
