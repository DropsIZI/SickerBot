const {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder,
  ActionRowBuilder, StringSelectMenuBuilder,
} = require('discord.js');
const { PAISES, nombreRol } = require('../utils/paises');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roles-paises')
    .setDescription('Crea los roles de país y publica el menú para elegirlos')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const guild = interaction.guild;
    await guild.roles.fetch();

    let creados = 0;
    for (const pais of PAISES) {
      const nombre = nombreRol(pais);
      if (guild.roles.cache.some(r => r.name === nombre)) continue;
      // Sin color y sin permisos: solo sirven para identificarse
      await guild.roles.create({
        name: nombre,
        mentionable: false,
        reason: 'Roles de país para el selector',
      }).catch(err => console.error('[roles-paises] ' + nombre + ':', err.message));
      creados++;
    }

    const embed = new EmbedBuilder()
      .setColor(0xFF85A1)
      .setTitle('🌎  ¿Desde dónde nos acompañas?')
      .setDescription(
        'Elige tu país en el menú de abajo y te lo pongo al instante 🍩\n\n' +
        '> Puedes cambiarlo cuando quieras.\n' +
        '> Para quitártelo, elige **Ninguno**.'
      )
      .setFooter({ text: 'SickerBot 🍩 • Comunidad Rosquita' });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('roles-pais')
      .setPlaceholder('🌎 Selecciona tu país…')
      .addOptions([
        ...PAISES.map(p => ({ label: p.nombre, value: p.nombre, emoji: p.emoji })),
        { label: 'Ninguno (quitar mi país)', value: '__ninguno__', emoji: '🚫' },
      ]);

    await interaction.channel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)],
    });

    await interaction.editReply(
      `✅ Menú publicado.\n` +
      `Roles creados ahora: **${creados}** (los que ya existían se respetaron).\n\n` +
      `⚠️ Recuerda arrastrar el rol del bot **por encima** de los roles de país, ` +
      `o no podrá asignarlos.`
    );
  },
};
