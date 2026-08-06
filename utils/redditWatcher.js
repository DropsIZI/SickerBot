// Publica automaticamente lo que se cuelga en unos subreddits.
//
// Reddit bloquea con 403 las peticiones sin autenticar que vienen de
// servidores (Render es uno), asi que la unica via estable es su API con
// OAuth. Las credenciales son gratuitas y se sacan en reddit.com/prefs/apps
// creando una app de tipo "script".

const { EmbedBuilder } = require('discord.js');
const storage = require('./storage');

const UA = 'SickerBot/1.0 (Discord bot para la comunidad de Sick)';
const INTERVALO_MS = 20 * 60 * 1000;
const POR_VUELTA = 2;      // como mucho 2 publicaciones por subreddit y vuelta
const MEMORIA = 300;       // ids recordados para no repetir

// Subreddits vigilados. Editar aqui para anadir o quitar.
const FUENTES = ['memes', 'dankmemes', 'meme'];

let token = { valor: null, expira: 0 };

async function getToken() {
  if (token.valor && Date.now() < token.expira) return token.valor;

  const cred = Buffer
    .from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`)
    .toString('base64');

  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + cred,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UA,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  });
  if (!res.ok) throw new Error('token HTTP ' + res.status);

  const json = await res.json();
  token = {
    valor: json.access_token,
    expira: Date.now() + (json.expires_in || 3600) * 1000 - 60_000,
  };
  return token.valor;
}

// Solo imagenes: los enlaces a videos o galerias no se ven bien en un embed
const esImagen = url => /\.(jpe?g|png|gif)$/i.test(url || '');

async function traer(subreddit, limite = 25) {
  const t = await getToken();
  const res = await fetch(
    `https://oauth.reddit.com/r/${subreddit}/hot?limit=${limite}&raw_json=1`,
    { headers: { Authorization: 'Bearer ' + t, 'User-Agent': UA } }
  );
  if (!res.ok) throw new Error('HTTP ' + res.status);

  return (await res.json()).data.children
    .map(c => c.data)
    .filter(p => !p.stickied && !p.over_18 && esImagen(p.url))
    .map(p => ({
      id: p.id,
      titulo: p.title,
      imagen: p.url,
      enlace: 'https://reddit.com' + p.permalink,
      sub: p.subreddit_name_prefixed,
      autor: p.author,
      votos: p.ups,
    }));
}

function embedDe(post) {
  return new EmbedBuilder()
    .setColor(0xFF4500)
    .setTitle(post.titulo.slice(0, 250))
    .setURL(post.enlace)
    .setImage(post.imagen)
    .setFooter({ text: `${post.sub} · u/${post.autor} · ▲ ${post.votos}` });
}

const vistos = () => storage.getConfig().redditVistos || [];

async function recordar(ids) {
  const config = storage.getConfig();
  const nuevos = [...(config.redditVistos || []), ...ids].slice(-MEMORIA);
  await storage.setConfig({ ...config, redditVistos: nuevos });
}

// Trae uno al azar que no se haya publicado ya
async function unoNuevo() {
  const sub = FUENTES[Math.floor(Math.random() * FUENTES.length)];
  const yaVistos = new Set(vistos());
  const posts = (await traer(sub)).filter(p => !yaVistos.has(p.id));
  if (!posts.length) return null;

  const post = posts[Math.floor(Math.random() * posts.length)];
  await recordar([post.id]);
  return post;
}

async function revisar(guild) {
  const canalId = storage.getConfig().memesChannel;
  if (!canalId) return;

  const canal = await guild.channels.fetch(canalId).catch(() => null);
  if (!canal) return;

  const yaVistos = new Set(vistos());
  const publicados = [];

  for (const sub of FUENTES) {
    let posts;
    try {
      posts = (await traer(sub)).filter(p => !yaVistos.has(p.id)).slice(0, POR_VUELTA);
    } catch (err) {
      console.error(`[reddit] ${sub}:`, err.message);
      continue;
    }

    for (const post of posts) {
      await canal.send({ embeds: [embedDe(post)] })
        .catch(err => console.error('[reddit] no se pudo publicar:', err.message));
      publicados.push(post.id);
    }
  }

  if (publicados.length) {
    await recordar(publicados);
    console.log(`[reddit] ${publicados.length} publicacion(es) nuevas`);
  }
}

function iniciar(guild) {
  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
    console.log('[reddit] sin credenciales, los memes automaticos quedan desactivados');
    return;
  }

  console.log(`[reddit] vigilando ${FUENTES.join(', ')} cada ${INTERVALO_MS / 60000} min`);
  const vuelta = () => revisar(guild).catch(err => console.error('[reddit]', err.message));
  vuelta();
  setInterval(vuelta, INTERVALO_MS);
}

module.exports = { iniciar, unoNuevo, embedDe, FUENTES };
