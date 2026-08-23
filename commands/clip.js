const { SlashCommandBuilder, EmbedBuilder, MessageFlags} = require('discord.js');
const { loadConfig } = require('../utils/levelManager');

// Kick no expone los clips en su API (la oficial no los cubre y la interna
// responde 403 tras Cloudflare), asi que no hay forma de publicarlos solos.
// Este comando es el atajo: se pega el enlace y el bot lo deja con formato.
const PLATAFORMAS = [
  { dominio: 'kick.com', nombre: 'Kick', color: 0x53FC18 },
  { dominio: 'tiktok.com', nombre: 'TikTok', color: 0x00F2EA },
  { dominio: 'twitch.tv', nombre: 'Twitch', color: 0x9146FF },
  { dominio: 'youtube.com', nombre: 'YouTube', color: 0xFF0000 },
  { dominio: 'youtu.be', nombre: 'YouTube', color: 0xFF0000 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clip')
    .setDescription('Comparte un clip en el canal de clips')
    .addStringOption(o =>
      o.setName('url').setDescription('Enlace del clip').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('descripcion').setDescription('De qué va el momento')
    ),

  async execute(interaction) {
    const url = interaction.options.getString('url').trim();
    const descripcion = interaction.options.getString('descripcion');

    let host;
    try { host = new URL(url).hostname.replace(/^www\./, ''); }
    catch { return interaction.reply({ content: '❌ Eso no parece un enlace válido.', flags: MessageFlags.Ephemeral }); }

    const plataforma = PLATAFORMAS.find(p => host === p.dominio || host.endsWith(`.${p.dominio}`));
    if (!plataforma) {
      return interaction.reply({
        content: '❌ Solo acepto enlaces de Kick, TikTok, Twitch o YouTube.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const canalId = loadConfig().clipsChannel;
    const destino = canalId
      ? await interaction.guild.channels.fetch(canalId).catch(() => null)
      : interaction.channel;

    if (!destino) {
      return interaction.reply({
        content: '❌ El canal de clips ya no existe. Configúralo con `/set-canal-clips`.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(plataforma.color)
      .setTitle(`🎬  Nuevo clip de ${plataforma.nombre}`)
      .setDescription((descripcion ? `> ${descripcion}\n\n` : '') + url)
      .setFooter({ text: `Compartido por ${interaction.user.username} 🍩` })
      .setTimestamp();

    // El enlace va tambien fuera del embed para que Discord genere su
    // previsualizacion reproducible
    await destino.send({ content: url, embeds: [embed] });

    await interaction.reply({
      content: destino.id === interaction.channelId ? '✅ ¡Clip publicado!' : `✅ ¡Publicado en ${destino}!`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
