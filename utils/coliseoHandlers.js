const {
  EmbedBuilder, ModalBuilder, TextInputBuilder,
  TextInputStyle, ActionRowBuilder, PermissionFlagsBits,
} = require('discord.js');
const {
  parsearRango, nombreRango, inscritos, inscribir, sortear, TIERS,
} = require('./coliseo');

// Boton "Inscribirme" -> abre el formulario
async function abrirFormulario(interaction) {
  const previo = inscritos().find(i => i.userId === interaction.user.id);

  const modal = new ModalBuilder()
    .setCustomId('coliseo:form')
    .setTitle('Inscripción · Coliseo del Abismo');

  const riotId = new TextInputBuilder()
    .setCustomId('riotid')
    .setLabel('Tu Riot ID (nombre + etiqueta)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ejemplo: Rosquita#LAN')
    .setMaxLength(40)
    .setRequired(true);

  const rango = new TextInputBuilder()
    .setCustomId('rango')
    .setLabel('Tu rango actual')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ejemplo: Oro 2, Platino IV, Maestro')
    .setMaxLength(30)
    .setRequired(true);

  if (previo) {
    riotId.setValue(previo.riotId);
    rango.setValue(nombreRango(previo).replace(/^\S+\s/, ''));
  }

  modal.addComponents(
    new ActionRowBuilder().addComponents(riotId),
    new ActionRowBuilder().addComponents(rango),
  );

  await interaction.showModal(modal);
}

// Envio del formulario -> valida y guarda
async function guardarInscripcion(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const riotId = interaction.fields.getTextInputValue('riotid').trim();
  const textoRango = interaction.fields.getTextInputValue('rango').trim();

  if (!riotId.includes('#')) {
    return interaction.editReply(
      '❌ El Riot ID necesita la etiqueta después de `#`, como `Rosquita#LAN`.\n' +
      'La encuentras en tu perfil del cliente de LoL, junto a tu nombre.'
    );
  }

  const rango = parsearRango(textoRango);
  if (!rango) {
    return interaction.editReply(
      `❌ No reconocí el rango **${textoRango}**.\n` +
      'Escríbelo como `Oro 2`, `Platino IV` o `Diamante 1`.\n' +
      `Válidos: ${TIERS.map(t => t.nombre).join(', ')}.`
    );
  }

  const total = await inscribir({
    userId: interaction.user.id,
    nombre: interaction.user.username,
    riotId,
    tier: rango.tier,
    division: rango.division,
    fecha: Date.now(),
  });

  return interaction.editReply(
    `✅ ¡Inscrito!\n\n` +
    `> **Riot ID:** ${riotId}\n` +
    `> **Rango:** ${nombreRango(rango)}\n\n` +
    `Sois **${total}** en el Coliseo. Si te equivocaste, vuelve a pulsar el botón.`
  );
}

// Boton "Sortear" -> empareja y publica
async function ejecutarSorteo(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ Solo los administradores pueden sortear.', ephemeral: true });
  }

  await interaction.deferReply();

  const lista = inscritos();
  if (lista.length < 2) {
    return interaction.editReply('❌ Hacen falta al menos **2** inscritos para sortear.');
  }

  const { duelos, descansa } = sortear(lista);

  const bloques = duelos.map((d, n) => {
    const rangoA = nombreRango(d.a);
    const rangoB = nombreRango(d.b);
    const ventaja = d.tiers === 0
      ? 'Mismo tier · duelo parejo'
      : `**${d.tiers}** tier${d.tiers > 1 ? 's' : ''} de diferencia`;

    return `**Duelo ${n + 1}**\n` +
      `> <@${d.a.userId}> \`${d.a.riotId}\` · ${rangoA}\n` +
      `> ⚔️ **vs**\n` +
      `> <@${d.b.userId}> \`${d.b.riotId}\` · ${rangoB}\n` +
      `> ${ventaja}\n` +
      `> 🚫 <@${d.menor.userId}> puede vetar **${d.bans}** campeón${d.bans > 1 ? 'es' : ''}`;
  });

  const embed = new EmbedBuilder()
    .setColor(0x8B0000)
    .setTitle('⚔️  Enfrentamientos del Coliseo')
    .setDescription(bloques.join('\n\n').slice(0, 4000))
    .setFooter({ text: `${duelos.length} duelo(s) · ${lista.length} inscritos` })
    .setTimestamp();

  if (descansa) {
    embed.addFields({
      name: '🎟️ Pasa sin jugar',
      value: `<@${descansa.userId}> \`${descansa.riotId}\` · ${nombreRango(descansa)}`,
    });
  }

  return interaction.editReply({ embeds: [embed] });
}

module.exports = { abrirFormulario, guardarInscripcion, ejecutarSorteo };
