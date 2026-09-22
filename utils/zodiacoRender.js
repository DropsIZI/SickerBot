// Mensajes de !zodiaco: la ficha de un signo y las respuestas de ayuda.
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { SIGNOS, NOMBRE_MES, tramoDe } = require('./zodiaco');

const COLOR = {
  Fuego: 0xE25822,
  Tierra: 0x6B8E23,
  Aire: 0x87AFC7,
  Agua: 0x4A7BA7,
};

const DIR_SIGNOS = path.join(__dirname, '../assets/zodiaco');
const EXTENSIONES = ['.png', '.jpg', '.jpeg', '.webp'];

// Las imagenes se van anadiendo sobre la marcha y el nombre del archivo puede
// venir como Aries.jpg, aries.png o Géminis.jpg. En vez de exigir un formato,
// se listan los archivos y se comparan normalizados. La lista se cachea unos
// segundos para no releer el disco en cada consulta, pero caduca sola para que
// un signo recien subido aparezca sin reiniciar el bot.
const VIDA_CACHE = 60_000;
let cache = null;
let cacheHasta = 0;

const normalizar = t => t
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]/g, '');

function imagenes() {
  if (cache && Date.now() < cacheHasta) return cache;

  cache = new Map();
  try {
    for (const archivo of fs.readdirSync(DIR_SIGNOS)) {
      const ext = path.extname(archivo).toLowerCase();
      if (!EXTENSIONES.includes(ext)) continue;
      cache.set(normalizar(path.basename(archivo, path.extname(archivo))), archivo);
    }
  } catch {
    // Sin carpeta de imagenes las fichas salen solo con texto
  }
  cacheHasta = Date.now() + VIDA_CACHE;
  return cache;
}

const buscarImagen = signo => {
  const archivo = imagenes().get(normalizar(signo.slug)) || imagenes().get(normalizar(signo.nombre));
  return archivo ? path.join(DIR_SIGNOS, archivo) : null;
};

function fichaSigno(signo, { usuario = null, fecha = null } = {}) {
  const embed = new EmbedBuilder()
    .setColor(COLOR[signo.elemento] || 0x6B4E8C)
    .setTitle(`${signo.emoji}  ${signo.nombre}`)
    .setDescription(`*${signo.lema}*\n\n${signo.retrato}`)
    .addFields(
      { name: 'Elemento', value: `${signo.emojiElemento} ${signo.elemento}`, inline: true },
      { name: 'Regente', value: `✦ ${signo.regente}`, inline: true },
      { name: 'Fechas', value: tramoDe(signo), inline: true },
      { name: '☀️ Su luz', value: `> ${signo.luz}` },
      { name: '🌑 Su sombra', value: `> ${signo.sombra}` },
    );

  if (fecha) {
    embed.setAuthor({ name: `Nacido el ${fecha.dia} de ${NOMBRE_MES[fecha.mes]}` });
  }

  embed.setFooter({
    text: usuario ? `Carta astral de ${usuario.username}` : 'Zodiaco · Sick Community',
  });

  const imagen = buscarImagen(signo);
  if (imagen) embed.setImage(`attachment://${path.basename(imagen)}`);

  return { embed, imagen };
}

// Un mes entero abarca dos signos: se muestran los dos y se pide el dia
function fichaMes(mes, signos) {
  const opciones = signos
    .map(s => `${s.emoji} **${s.nombre}** · ${tramoDe(s)}`)
    .join('\n');

  return new EmbedBuilder()
    .setColor(0x6B4E8C)
    .setTitle(`📅  ${NOMBRE_MES[mes].charAt(0).toUpperCase() + NOMBRE_MES[mes].slice(1)} abarca dos signos`)
    .setDescription(`${opciones}\n\nDime también el día y te digo cuál te toca:\n\`!zodiaco 15 ${NOMBRE_MES[mes]}\``);
}

const ayuda = () => new EmbedBuilder()

  .setColor(0x6B4E8C)
  .setTitle('🔮  ¿Qué signo eres?')
  .setDescription(
    'Dime tu fecha de nacimiento y te digo tu signo:\n\n' +
    '`!zodiaco 15/3`\n' +
    '`!zodiaco 15 de marzo`\n' +
    '`!zodiaco marzo` · te digo los dos signos de ese mes\n' +
    '`!zodiaco piscis` · la ficha de un signo concreto'
  )
  .addFields({
    name: 'Los doce',
    value: SIGNOS.map(s => `${s.emoji} ${s.nombre}`).join(' · '),
  });

const noEntendido = () => new EmbedBuilder()
  .setColor(0x8B0000)
  .setTitle('🤔  No reconocí esa fecha')
  .setDescription(
    'Prueba con `!zodiaco 15/3`, `!zodiaco 15 de marzo` o el nombre de un signo.\n' +
    'Si escribiste un día que no existe en ese mes, revísalo.'
  );

// Cada respuesta se devuelve ya como payload de mensaje, para que quien la
// envie no tenga que saber si el signo trae imagen o no
const mensajeSigno = (signo, opts) => {
  const { embed, imagen } = fichaSigno(signo, opts);
  return { embeds: [embed], files: imagen ? [new AttachmentBuilder(imagen)] : [] };
};

const mensajeMes = (mes, signos) => ({ embeds: [fichaMes(mes, signos)], files: [] });
const mensajeAyuda = () => ({ embeds: [ayuda()], files: [] });
const mensajeNoEntendido = () => ({ embeds: [noEntendido()], files: [] });

module.exports = {
  fichaSigno, fichaMes, ayuda, noEntendido,
  mensajeSigno, mensajeMes, mensajeAyuda, mensajeNoEntendido,
};
