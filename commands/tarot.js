const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const {
  cartaDelDia, cartaAlAzar, tirada,
  consejoDe, lecturaDe, sintesisDe, lecturaConjunta, apertura,
} = require('../utils/tarot');
const { loadConfig } = require('../utils/levelManager');
const { detectarTema } = require('../utils/tarotTemas');

const DIR_CARTAS = path.join(__dirname, '../assets/tarot');
const POSICIONES = ['🕰️ Pasado', '✨ Presente', '🔮 Futuro'];

// Busca la imagen de la carta, aceptando varias extensiones
function buscarImagen(slug) {
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) {
    const ruta = path.join(DIR_CARTAS, `${slug}.${ext}`);
    if (fs.existsSync(ruta)) return ruta;
  }
  return null;
}

function embedCarta(sacada, titulo) {
  const { carta, invertida } = sacada;
  const p = invertida ? 'i' : 'd';

  const embed = new EmbedBuilder()
    .setColor(invertida ? 0x6B4E8C : 0xB8860B)
    .setTitle(`${carta.emoji}  ${carta.nombre}${invertida ? '  · invertida' : ''}`)
    .setDescription(`*${carta.clave[p]}*\n\n${lecturaDe(sacada)}`)
    .addFields({ name: 'En síntesis', value: `> ${sintesisDe(sacada)}` });

  const consejo = consejoDe(sacada);
  if (consejo) embed.addFields({ name: 'Consejo', value: `> ${consejo}` });

  if (titulo) embed.setAuthor({ name: titulo });

  const imagen = buscarImagen(carta.slug);
  if (imagen) embed.setImage(`attachment://${path.basename(imagen)}`);

  return { embed, imagen };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tarot')
    .setDescription('Consulta las cartas del tarot 🔮')
    .addStringOption(o =>
      o.setName('tipo')
        .setDescription('Qué tirada quieres')
        .addChoices(
          { name: '🌙 Carta del día (una por día)', value: 'dia' },
          { name: '🃏 Una carta al azar', value: 'azar' },
          { name: '🔮 Tirada de 3 (pasado, presente, futuro)', value: 'tres' },
        )
    )
    .addStringOption(o =>
      o.setName('pregunta').setDescription('Qué quieres consultar')
    )
    .addBooleanOption(o =>
      o.setName('anonimo')
        .setDescription('Publica la lectura sin revelar quién consultó')
    ),

  async execute(interaction) {
    // Si hay canal de tarot definido, solo se usa ahí
    const canalTarot = loadConfig().tarotChannel;
    if (canalTarot && interaction.channelId !== canalTarot) {
      return interaction.reply({
        content: `❌ Las cartas solo se leen en <#${canalTarot}> 🔮`,
        ephemeral: true,
      });
    }

    const anonimo = interaction.options.getBoolean('anonimo') === true;

    // Discord encabeza toda respuesta a un comando con «fulano usó /tarot»,
    // asi que para que la tirada sea anonima de verdad hay que responder en
    // privado y publicar la lectura como mensaje suelto del bot.
    await interaction.deferReply({ ephemeral: anonimo });

    const tipo = interaction.options.getString('tipo') || 'dia';
    const pregunta = interaction.options.getString('pregunta');
    const usuario = interaction.user;

    const embeds = [];
    const ficheros = [];

    if (tipo === 'tres') {
      const sacadas = tirada(3);
      sacadas.forEach((sacada, i) => {
        const { embed, imagen } = embedCarta(sacada, POSICIONES[i]);
        embeds.push(embed);
        if (imagen) ficheros.push(new AttachmentBuilder(imagen));
      });

      // Cierre que lee las tres cartas como un solo mensaje
      embeds.push(new EmbedBuilder()
        .setColor(0x4A3B6B)
        .setTitle('🕯️  Lectura conjunta')
        .setDescription(lecturaConjunta(sacadas)));
    } else {
      const sacada = tipo === 'dia' ? cartaDelDia(usuario.id) : cartaAlAzar();
      const { embed, imagen } = embedCarta(sacada, tipo === 'dia' ? '🌙 Tu carta de hoy' : '🃏 Tu carta');
      embeds.push(embed);
      if (imagen) ficheros.push(new AttachmentBuilder(imagen));
    }

    // Nota acorde al asunto que se consulta, si se reconoce alguno
    const tema = detectarTema(pregunta);
    if (tema) {
      const nota = tema.notas[Math.floor(Math.random() * tema.notas.length)];
      embeds[embeds.length - 1].addFields({ name: tema.titulo, value: `> ${nota}` });
    }

    embeds[embeds.length - 1].setFooter({
      text: anonimo
        ? 'Consulta anónima'
        : tipo === 'dia'
          ? `Carta del día de ${usuario.username} · una por jornada`
          : `Consulta de ${usuario.username}`,
    });

    const quien = anonimo ? 'Alguien' : `**${usuario.username}**`;
    const cabecera = pregunta
      ? `🔮 ${quien} consulta: *${pregunta}*\n${apertura()}`
      : anonimo
        ? `🔮 Lectura anónima\n${apertura()}`
        : `🔮 Lectura para ${quien}\n${apertura()}`;

    if (!anonimo) {
      return interaction.editReply({ content: cabecera, embeds, files: ficheros });
    }

    // Mensaje suelto del bot: sin la cabecera que delataria quien consulto
    await interaction.channel.send({ content: cabecera, embeds, files: ficheros });
    await interaction.editReply('✅ Tu lectura se publicó de forma anónima.');
  },
};
