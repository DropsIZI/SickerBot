const {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder,
  ActionRowBuilder, StringSelectMenuBuilder, MessageFlags} = require('discord.js');
const { GRUPOS, nombreRol } = require('../utils/autoroles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoroles')
    .setDescription('Crea los roles y publica los menús para que cada quien elija')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addAttachmentOption(o =>
      o.setName('banner')
        .setDescription('Imagen de cabecera que se publica encima de los menús')
    )
    .addStringOption(o =>
      o.setName('seccion')
        .setDescription('Solo una sección (por defecto se publican todas)')
        .addChoices(
          { name: 'Países', value: 'paises' },
          { name: 'Género', value: 'genero' },
          { name: 'Edad', value: 'edad' },
          { name: 'Personalidad', value: 'personalidad' },
          { name: 'Juegos', value: 'juegos' },
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const guild = interaction.guild;
    await guild.roles.fetch();

    const soloUna = interaction.options.getString('seccion');
    const ids = soloUna ? [soloUna] : Object.keys(GRUPOS);

    // Cabecera con la imagen, antes de los desplegables
    const banner = interaction.options.getAttachment('banner');
    if (banner) {
      if (!banner.contentType?.startsWith('image/')) {
        return interaction.editReply('❌ El banner tiene que ser una imagen.');
      }
      await interaction.channel.send({ files: [banner.url] });
    }

    let creados = 0;
    const resumen = [];

    for (const grupoId of ids) {
      const grupo = GRUPOS[grupoId];

      for (const opcion of grupo.opciones) {
        const nombre = nombreRol(grupoId, opcion);
        if (guild.roles.cache.some(r => r.name === nombre)) continue;
        // Sin color ni permisos: solo sirven para identificarse
        const rol = await guild.roles.create({
          name: nombre,
          mentionable: false,
          reason: 'Autoroles',
        }).catch(err => { console.error('[autoroles] ' + nombre + ':', err.message); return null; });
        if (rol) creados++;
      }

      const embed = new EmbedBuilder()
        .setColor(grupo.color)
        .setTitle(grupo.titulo)
        .setDescription(
          `${grupo.descripcion}\n\n` +
          (grupo.unico
            ? '> Solo puedes elegir **uno**. Si cambias, te quito el anterior.\n'
            : '> Puedes marcar **varios** a la vez.\n') +
          '> Para quitártelos, abre el menú y deselecciona.'
        )
        .setFooter({ text: 'SickerBot 🍩 • Comunidad Rosquita' });

      const menu = new StringSelectMenuBuilder()
        .setCustomId('autorol:' + grupoId)
        .setPlaceholder(grupo.placeholder)
        .setMinValues(0)
        .setMaxValues(grupo.unico ? 1 : grupo.opciones.length)
        .addOptions(grupo.opciones.map(o => ({
          label: o.nombre, value: o.nombre, emoji: o.emoji,
        })));

      await interaction.channel.send({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(menu)],
      });

      resumen.push(`• ${grupo.titulo.replace(/\s+/g, ' ')} — ${grupo.opciones.length} opciones`);
    }

    await interaction.editReply(
      `✅ **Publicado.**\n${resumen.join('\n')}\n\n` +
      `Roles creados ahora: **${creados}** (los existentes se respetaron).\n\n` +
      `⚠️ Arrastra el rol del bot **por encima** de todos estos, o no podrá asignarlos.`
    );
  },
};
