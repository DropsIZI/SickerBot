// Links de stream fijos, escritos en el codigo para que sobrevivan a los
// reinicios y redeploys de Render (el disco es efimero y la memoria se vacia).
// Clave: userId de Discord. Valor: { plataforma: link }
const LINKS_FIJOS = {
  // Sick
  '763864924500787240': {
    TikTok: 'https://www.tiktok.com/@sickonfire',
    Kick: 'https://kick.com/sickonfire',
  },
};

// Cuentas que el bot sondea para saber si hay directo, ya que Discord solo
// avisa de Twitch y YouTube. Clave: userId de Discord.
const VIGILAR = {
  // Sick
  '763864924500787240': {
    tiktok: 'sickonfire',   // el @ del perfil, sin arroba
    kick: 'sickonfire',     // el nombre que aparece en kick.com/<slug>
  },
};

// Links añadidos en caliente con /set-stream. userId -> Map(plataforma -> link)
// Estos si se pierden al reiniciar; los de arriba no.
const streamLinks = new Map();

// Devuelve los links fijos del usuario mas los que haya guardado a mano.
// Si repite plataforma, gana el de /set-stream.
function getLinks(userId) {
  const out = new Map(Object.entries(LINKS_FIJOS[userId] || {}));
  for (const [plataforma, link] of streamLinks.get(userId) || []) {
    out.set(plataforma, link);
  }
  return out;
}

module.exports = { streamLinks, getLinks, LINKS_FIJOS, VIGILAR };
