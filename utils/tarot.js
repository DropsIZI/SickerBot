const crypto = require('crypto');

// Arcanos mayores. El slug es el nombre del archivo que se busca en
// assets/tarot/<slug>.png; si no existe, la carta se muestra solo con texto.
const CARTAS = [
  { n: 0,  slug: 'el-loco',           nombre: 'El Loco',            emoji: '🃏', derecho: 'Empiezas algo nuevo sin miedo. Sáltate el guion y confía.', invertido: 'Estás corriendo sin mirar. Frena un poquito antes de decidir.' },
  { n: 1,  slug: 'el-mago',           nombre: 'El Mago',            emoji: '🪄', derecho: 'Tienes todo lo que necesitas para lograrlo. Solo empieza.', invertido: 'Te estás subestimando o alguien te vende humo.' },
  { n: 2,  slug: 'la-sacerdotisa',    nombre: 'La Sacerdotisa',     emoji: '🌙', derecho: 'Escucha esa corazonada, sabe más que tu cabeza.', invertido: 'Estás ignorando lo que ya sabes por dentro.' },
  { n: 3,  slug: 'la-emperatriz',     nombre: 'La Emperatriz',      emoji: '🌷', derecho: 'Abundancia y cariño. Algo bonito está creciendo.', invertido: 'Te estás olvidando de cuidarte a ti primero.' },
  { n: 4,  slug: 'el-emperador',      nombre: 'El Emperador',       emoji: '👑', derecho: 'Pon orden y límites. Tú mandas en lo tuyo.', invertido: 'Demasiada rigidez. Suelta el control un ratito.' },
  { n: 5,  slug: 'el-hierofante',     nombre: 'El Hierofante',      emoji: '📜', derecho: 'Alguien con experiencia tiene la respuesta que buscas.', invertido: 'Deja de seguir reglas que ya no te sirven.' },
  { n: 6,  slug: 'los-enamorados',    nombre: 'Los Enamorados',     emoji: '💕', derecho: 'Una decisión del corazón. Elige con honestidad.', invertido: 'Estás dudando porque algo no te cuadra. Hazle caso.' },
  { n: 7,  slug: 'el-carro',          nombre: 'El Carro',           emoji: '🏆', derecho: 'Avanzas con fuerza. Nada te frena si sigues así.', invertido: 'Vas en muchas direcciones a la vez. Elige una.' },
  { n: 8,  slug: 'la-fuerza',         nombre: 'La Fuerza',          emoji: '🦁', derecho: 'Tu dulzura es tu poder. Con calma se gana más.', invertido: 'La paciencia se te está agotando. Respira.' },
  { n: 9,  slug: 'el-ermitano',       nombre: 'El Ermitaño',        emoji: '🕯️', derecho: 'Necesitas un rato a solas para aclararte. Tómalo.', invertido: 'Te estás aislando de más. Deja que te acompañen.' },
  { n: 10, slug: 'la-rueda',          nombre: 'La Rueda',           emoji: '🎡', derecho: 'La suerte gira a tu favor. Algo cambia pronto.', invertido: 'Mala racha pasajera. No es para siempre.' },
  { n: 11, slug: 'la-justicia',       nombre: 'La Justicia',        emoji: '⚖️', derecho: 'Todo vuelve. Lo que sembraste está por llegarte.', invertido: 'Algo no está siendo justo y lo sabes.' },
  { n: 12, slug: 'el-colgado',        nombre: 'El Colgado',         emoji: '🙃', derecho: 'Mira el asunto del revés. Ahí está la respuesta.', invertido: 'Estás atascad@ esperando. Muévete ya.' },
  { n: 13, slug: 'la-muerte',         nombre: 'La Muerte',          emoji: '🦋', derecho: 'Se cierra una etapa para abrir otra mejor.', invertido: 'Te aferras a algo que ya terminó. Suéltalo.' },
  { n: 14, slug: 'la-templanza',      nombre: 'La Templanza',       emoji: '🍵', derecho: 'Equilibrio. Vas al ritmo justo, no te apures.', invertido: 'Te estás pasando de un extremo al otro.' },
  { n: 15, slug: 'el-diablo',         nombre: 'El Diablo',          emoji: '😈', derecho: 'Algo te tiene enganchad@. Míralo de frente.', invertido: 'Te estás soltando de esa cadena. ¡Bien ahí!' },
  { n: 16, slug: 'la-torre',          nombre: 'La Torre',           emoji: '⚡', derecho: 'Sacudida inesperada, pero necesaria. Se cae lo que no era.', invertido: 'Estás evitando un cambio que igual va a pasar.' },
  { n: 17, slug: 'la-estrella',       nombre: 'La Estrella',        emoji: '⭐', derecho: 'Esperanza y calma. Lo bonito viene en camino.', invertido: 'Perdiste la fe un poquito. Vuelve a confiar.' },
  { n: 18, slug: 'la-luna',           nombre: 'La Luna',            emoji: '🌕', derecho: 'No todo es lo que parece. Ve despacio.', invertido: 'Se aclara la confusión. Por fin ves bien.' },
  { n: 19, slug: 'el-sol',            nombre: 'El Sol',             emoji: '☀️', derecho: '¡Alegría pura! Todo se ilumina para ti.', invertido: 'La felicidad está ahí, solo que nublada. Ya asoma.' },
  { n: 20, slug: 'el-juicio',         nombre: 'El Juicio',          emoji: '📯', derecho: 'Una segunda oportunidad. Es momento de renacer.', invertido: 'Te estás juzgando muy duro. Sé más amable contigo.' },
  { n: 21, slug: 'el-mundo',          nombre: 'El Mundo',           emoji: '🌍', derecho: 'Cierras un ciclo con éxito. ¡Lo lograste!', invertido: 'Casi lo tienes. Falta un último empujón.' },
];

// La carta del dia sale de un hash del usuario y la fecha: asi le toca la
// misma toda la jornada por mucho que repita el comando, pero cambia
// cada dia y es distinta para cada quien.
function cartaDelDia(userId) {
  const hoy = new Date().toISOString().slice(0, 10);
  const hash = crypto.createHash('sha256').update(userId + hoy).digest();
  return {
    carta: CARTAS[hash[0] % CARTAS.length],
    invertida: (hash[1] % 100) < 30, // 30% de salir del revés
  };
}

function cartaAlAzar() {
  return {
    carta: CARTAS[crypto.randomInt(CARTAS.length)],
    invertida: crypto.randomInt(100) < 30,
  };
}

// Tirada sin repetir carta
function tirada(cantidad) {
  const mazo = [...CARTAS];
  const salida = [];
  for (let i = 0; i < cantidad && mazo.length; i++) {
    salida.push({
      carta: mazo.splice(crypto.randomInt(mazo.length), 1)[0],
      invertida: crypto.randomInt(100) < 30,
    });
  }
  return salida;
}

module.exports = { CARTAS, cartaDelDia, cartaAlAzar, tirada };
