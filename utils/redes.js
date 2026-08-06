// Redes de Sick. Para anadir o quitar una, editar esta lista y volver a
// lanzar /redes. El orden es el que tendran los botones.
//
// Discord admite hasta 5 botones por fila y 5 filas, asi que caben 25.
const REDES = [
  { nombre: 'TikTok', emoji: '🎵', url: 'https://www.tiktok.com/@sickonfire' },
  { nombre: 'Kick', emoji: '🟢', url: 'https://kick.com/sickonfire' },
  { nombre: 'YouTube', emoji: '📺', url: 'https://www.youtube.com/@sickonfire' },
  { nombre: 'Instagram', emoji: '📸', url: 'https://www.instagram.com/sickonfxre/' },
  { nombre: 'X', emoji: '🐦', url: 'https://x.com/sickonfirex' },
];

// Horario de directos, en hora de Peru (GMT-5), todos los dias.
const HORARIO = {
  dias: 'Todos los días',
  zonaBase: 'hora de Perú',
  bloques: [
    { nombre: '☀️ Mediodía', ini: 11, fin: 13.5 },
    { nombre: '🌙 Noche', ini: 19.5, fin: 23.5 },
  ],
  // Desfase respecto a Peru. Chile y Espana cambian con el horario de
  // verano, asi que estos valores son los de su horario estandar.
  zonas: [
    { banderas: '🇵🇪 🇨🇴 🇪🇨 🇵🇦', desfase: 0 },
    { banderas: '🇲🇽 🇬🇹 🇸🇻 🇭🇳 🇳🇮 🇨🇷', desfase: -1 },
    { banderas: '🇧🇴 🇻🇪 🇨🇱 🇩🇴 🇵🇷 🇨🇺', desfase: 1 },
    { banderas: '🇦🇷 🇺🇾 🇵🇾 🇧🇷', desfase: 2 },
    { banderas: '🇪🇸', desfase: 6 },
  ],
};

// 13.5 -> "13:30". Si pasa de medianoche marca que es del dia siguiente.
function formatoHora(h) {
  let sufijo = '';
  if (h >= 24) { h -= 24; sufijo = '⁺¹'; }
  const horas = Math.floor(h);
  const minutos = Math.round((h - horas) * 60);
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}${sufijo}`;
}

const tramo = (bloque, desfase) =>
  `${formatoHora(bloque.ini + desfase)}–${formatoHora(bloque.fin + desfase)}`;

function textoHorario() {
  const cabecera =
    `**${HORARIO.dias}**\n` +
    HORARIO.bloques.map(b => `${b.nombre}  \`${tramo(b, 0)}\``).join('   ') +
    `  · ${HORARIO.zonaBase}\n`;

  const tabla = HORARIO.zonas
    .map(z => `${z.banderas}\n\`${HORARIO.bloques.map(b => tramo(b, z.desfase)).join('\`  \`')}\``)
    .join('\n');

  return `${cabecera}\n${tabla}\n\n-# ⁺¹ es la madrugada del día siguiente`;
}

module.exports = { REDES, HORARIO, textoHorario };
