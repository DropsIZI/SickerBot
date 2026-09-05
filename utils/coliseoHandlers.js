const {
  EmbedBuilder, ModalBuilder, TextInputBuilder,
  TextInputStyle, ActionRowBuilder, PermissionFlagsBits, MessageFlags} = require('discord.js');
const {
  parsearRango, nombreRango, inscritos, inscribir, desinscribir,
  marcarConfirmacion, TIERS,
} = require('./coliseo');
const torneo = require('./coliseoTorneo');
const { mensajeDuelo, cabeceraRonda, anuncioPodio } = require('./coliseoRender');

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
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

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

// Boton "Desinscribirme" -> se quita a si mismo de la lista
async function desinscribirse(interaction) {
  const estaba = inscritos().some(i => i.userId === interaction.user.id);
  if (!estaba) {
    return interaction.reply({ content: 'No estabas inscrito en el Coliseo.', flags: MessageFlags.Ephemeral });
  }

  await desinscribir(interaction.user.id);
  return interaction.reply({ content: '✅ Te saqué de la lista de inscritos. ¡Vuelve cuando quieras!', flags: MessageFlags.Ephemeral });
}

// Botones "Sí"/"No" del DM de confirmacion -> registra la respuesta
async function confirmarAsistencia(interaction, valor) {
  const yo = inscritos().find(i => i.userId === interaction.user.id);
  if (!yo) {
    return interaction.update({ content: 'Ya no estás en la lista de inscritos del Coliseo.', embeds: [], components: [] });
  }

  await marcarConfirmacion(interaction.user.id, valor);

  return interaction.update({
    content: valor
      ? '✅ ¡Gracias! Quedaste confirmado para el Coliseo del Abismo.'
      : '❌ Anotado, no cuentas para esta ronda. ¡Nos vemos en la próxima!',
    embeds: [],
    components: [],
  });
}

// Publica la cabecera de la ronda y un mensaje por duelo
async function publicarRonda(canal, torneo) {
  await canal.send({ embeds: [cabeceraRonda(torneo)] });
  for (const duelo of torneo.duelos) {
    await canal.send(mensajeDuelo(duelo, torneo));
  }
}

// Boton "Sortear" -> arranca el torneo
async function ejecutarSorteo(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ Solo los administradores pueden sortear.', flags: MessageFlags.Ephemeral });
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const todos = inscritos();

  // Si ya se paso una ronda de confirmacion, solo entran los que dijeron que
  // si. Si nunca se uso /coliseo confirmar, entran todos como siempre.
  const hayConfirmaciones = todos.some(i => i.confirmado !== undefined);
  const lista = hayConfirmaciones ? todos.filter(i => i.confirmado === true) : todos;
  const fuera = todos.length - lista.length;

  if (lista.length < 2) {
    return interaction.editReply(
      hayConfirmaciones
        ? `❌ Solo hay **${lista.length}** inscrito(s) confirmado(s), hacen falta al menos **2**.\n` +
          'Usa `/coliseo confirmar` para pedir confirmación otra vez, o revisa la lista con `/coliseo lista`.'
        : '❌ Hacen falta al menos **2** inscritos.'
    );
  }

  const enCurso = torneo.estado();
  if (enCurso && !enCurso.campeon) {
    return interaction.editReply(
      `❌ Ya hay un torneo en marcha (${enCurso.nombreRonda}).\n` +
      'Termínalo o usa `/coliseo cancelar` para descartarlo.'
    );
  }

  const nuevo = await torneo.iniciar(lista);
  await publicarRonda(interaction.channel, nuevo);

  let resumen = `✅ Torneo iniciado con **${lista.length}** participantes.\n` +
    `${nuevo.nombreRonda} · **${nuevo.duelos.length}** duelos.`;
  if (fuera) resumen += `\n🚫 **${fuera}** inscrito(s) quedaron fuera por no confirmar asistencia.`;
  if (nuevo.pasaDirecto) {
    resumen += `\n🎟️ Número impar: **${nuevo.pasaDirecto.riotId}** pasa sin jugar esta ronda.`;
  }

  return interaction.editReply(resumen);
}

// Boton "Gano X" -> marca el ganador y, si la ronda esta lista, avanza
async function marcarGanador(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ Solo el anfitrión decide los ganadores.', flags: MessageFlags.Ephemeral });
  }

  const [, , dueloId, userId] = interaction.customId.split(':');
  await interaction.deferUpdate();

  const actualizado = await torneo.registrarGanador(dueloId, userId);
  if (!actualizado) return;

  // Refrescar el mensaje del duelo, ya sin botones
  const duelo = actualizado.duelos.find(d => d.id === dueloId);
  await interaction.editReply(mensajeDuelo(duelo, actualizado));

  if (!torneo.rondaCompleta(actualizado)) return;

  const siguiente = await torneo.avanzarRonda();
  if (!siguiente) return;

  if (siguiente.campeon) {
    await interaction.channel.send({ embeds: [anuncioPodio(siguiente)] });
    return;
  }

  await publicarRonda(interaction.channel, siguiente);
}

module.exports = { abrirFormulario, guardarInscripcion, desinscribirse, confirmarAsistencia, ejecutarSorteo, marcarGanador };
