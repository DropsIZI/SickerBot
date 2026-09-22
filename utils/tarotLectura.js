// Arma la lectura de tarot ya lista para enviarse.
//
// Vive aparte del comando porque la tirada se pide por dos vias: el slash
// command /tarot y el prefijo !tarot en cualquier canal. Ambas construyen el
// mismo mensaje, asi que la forma de la lectura se decide aqui y cada via solo
// se encarga de como responder.
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const {
  cartaDelDia, cartaAlAzar, tirada,
  consejoDe, lecturaDe, sintesisDe, lecturaConjunta, apertura,
} = require('./tarot');
const { detectarTema } = require('./tarotTemas');

const DIR_CARTAS = path.join(__dirname, '../assets/tarot');
const POSICIONES = ['🕰️ Pasado', '✨ Presente', '🔮 Futuro'];

const TIPOS = ['dia', 'azar', 'tres'];

// Lo que se acepta como tipo al escribir !tarot, mas alla del nombre exacto
const ALIAS = {
  dia: 'dia', día: 'dia', hoy: 'dia',
  azar: 'azar', random: 'azar', carta: 'azar',
  tres: 'tres', 3: 'tres', tirada: 'tres',
};

// La pregunta viaja dentro del contenido del mensaje, que Discord corta en
// 2000 caracteres; se recorta para que la cabecera nunca lo agote
const MAX_PREGUNTA = 200;

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

// Separa "!tarot tres me cambio de trabajo?" en tipo + pregunta. Si la primera
// palabra no nombra una tirada, todo el texto se toma como la pregunta.
function interpretar(texto) {
  const limpio = (texto || '').trim();
  if (!limpio) return { tipo: 'dia', pregunta: null };

  const [primera, ...resto] = limpio.split(/\s+/);
  const tipo = ALIAS[primera.toLowerCase()];

  return tipo
    ? { tipo, pregunta: resto.join(' ') || null }
    : { tipo: 'dia', pregunta: limpio };
}

function construirLectura({ tipo = 'dia', pregunta = null, usuario, anonimo = false }) {
  const recortada = pregunta ? pregunta.slice(0, MAX_PREGUNTA).trim() || null : null;

  const embeds = [];
  const files = [];

  if (tipo === 'tres') {
    const sacadas = tirada(3);
    sacadas.forEach((sacada, i) => {
      const { embed, imagen } = embedCarta(sacada, POSICIONES[i]);
      embeds.push(embed);
      if (imagen) files.push(new AttachmentBuilder(imagen));
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
    if (imagen) files.push(new AttachmentBuilder(imagen));
  }

  // Nota acorde al asunto que se consulta, si se reconoce alguno
  const tema = detectarTema(recortada);
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
  const content = recortada
    ? `🔮 ${quien} consulta: *${recortada}*\n${apertura()}`
    : anonimo
      ? `🔮 Lectura anónima\n${apertura()}`
      : `🔮 Lectura para ${quien}\n${apertura()}`;

  // parse: [] para que nadie fuerce un @everyone metiendolo en la pregunta
  return { content, embeds, files, allowedMentions: { parse: [] } };
}

module.exports = { construirLectura, interpretar, TIPOS };
