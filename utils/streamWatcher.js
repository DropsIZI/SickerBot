// Vigila TikTok y Kick por sondeo.
//
// Discord solo informa de los streams de Twitch y YouTube, asi que para el
// resto hay que preguntarle a cada plataforma cada cierto tiempo.
//
//   TikTok: endpoint interno que usa su propia web, no necesita credenciales.
//   Kick:   API oficial con OAuth. Su web esta detras de Cloudflare y
//           responde 403 a cualquier peticion automatizada, asi que la via
//           oficial es la unica que funciona. Sin credenciales se omite.

const { EmbedBuilder } = require('discord.js');
const { getLinks, VIGILAR } = require('./streamStore');
const { marcarEnVivo, marcarOffline } = require('./liveStatus');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const INTERVALO_MS = 60 * 1000;

// userId -> Set de plataformas que ya anunciamos, para no repetir el aviso
// en cada vuelta del sondeo
const anunciados = new Map();

async function consultarTikTok(usuario) {
  const url = `https://www.tiktok.com/api-live/user/room/?aid=1988&sourceType=54&uniqueId=${encodeURIComponent(usuario)}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: 'https://www.tiktok.com/' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);

  const json = await res.json();
  const sala = json?.data?.liveRoom;
  // status 2 = retransmitiendo; 4 = terminado
  if (json?.data?.user?.status !== 2 || !sala) return { live: false };

  return {
    live: true,
    titulo: sala.title || 'En directo en TikTok',
    url: `https://www.tiktok.com/@${usuario}/live`,
    portada: sala.coverUrl || null,
  };
}

let tokenKick = { valor: null, expira: 0 };

async function getTokenKick() {
  if (tokenKick.valor && Date.now() < tokenKick.expira) return tokenKick.valor;

  const res = await fetch('https://id.kick.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.KICK_CLIENT_ID,
      client_secret: process.env.KICK_CLIENT_SECRET,
    }),
  });
  if (!res.ok) throw new Error('token HTTP ' + res.status);

  const json = await res.json();
  tokenKick = {
    valor: json.access_token,
    expira: Date.now() + (json.expires_in || 3600) * 1000 - 60_000,
  };
  return tokenKick.valor;
}

async function consultarKick(slug) {
  if (!process.env.KICK_CLIENT_ID || !process.env.KICK_CLIENT_SECRET) return { live: false };

  const token = await getTokenKick();
  const res = await fetch(`https://api.kick.com/public/v1/channels?slug=${encodeURIComponent(slug)}`, {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);

  const canal = (await res.json())?.data?.[0];
  if (!canal?.stream?.is_live) return { live: false };

  return {
    live: true,
    titulo: canal.stream_title || canal.stream?.stream_title || 'En directo en Kick',
    url: `https://kick.com/${slug}`,
    portada: canal.stream?.thumbnail || null,
  };
}

async function publicarAviso(guild, userId, plataforma, info) {
  const canalId = process.env.STREAM_CHANNEL_ID;
  if (!canalId) return;

  const canal = await guild.channels.fetch(canalId).catch(() => null);
  if (!canal) return;

  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member) return;

  const links = [...getLinks(userId).entries()]
    .map(([p, l]) => `> 🔗 **${p}:** ${l}`).join('\n');

  const embed = new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle('🔴  ¡STREAM EN VIVO! 🍩')
    .setURL(info.url)
    .setDescription(
      `### ${member.displayName} está transmitiendo en ${plataforma} 🎀\n\n` +
      `> 📺 **${info.titulo}**\n` +
      `\n> ▶️ ${info.url}\n` +
      (links ? `\n${links}` : '')
    )
    .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 }))
    .setFooter({ text: 'SickerBot 🍩 • ¡No te lo pierdas!' })
    .setTimestamp();

  if (info.portada) embed.setImage(info.portada);

  const pingRoleId = process.env.PING_ROLE_ID;
  await canal.send({
    content: `🔴 ${pingRoleId ? `<@&${pingRoleId}>` : ''} ¡**${member.displayName}** está en vivo en ${plataforma}!`,
    embeds: [embed],
  }).catch(err => console.error('[streamWatcher] no se pudo anunciar:', err.message));
}

async function revisar(guild) {
  for (const [userId, cuentas] of Object.entries(VIGILAR)) {
    const activas = anunciados.get(userId) || new Set();

    for (const [plataforma, consultar, cuenta] of [
      ['TikTok', consultarTikTok, cuentas.tiktok],
      ['Kick', consultarKick, cuentas.kick],
    ]) {
      if (!cuenta) continue;

      let info;
      try {
        info = await consultar(cuenta);
      } catch (err) {
        // Un fallo puntual de red no debe apagar el cartel de "en vivo"
        console.error(`[streamWatcher] ${plataforma} (${cuenta}):`, err.message);
        continue;
      }

      if (info.live && !activas.has(plataforma)) {
        activas.add(plataforma);
        console.log(`[streamWatcher] ${cuenta} empezo a transmitir en ${plataforma}`);
        await marcarEnVivo(guild, userId);
        await publicarAviso(guild, userId, plataforma, info);
      } else if (!info.live && activas.has(plataforma)) {
        activas.delete(plataforma);
        console.log(`[streamWatcher] ${cuenta} termino en ${plataforma}`);
      }
    }

    anunciados.set(userId, activas);
    // Solo se apaga el cartel cuando no queda ninguna plataforma activa
    if (activas.size === 0) await marcarOffline(guild, userId);
  }
}

function iniciar(guild) {
  if (!Object.keys(VIGILAR).length) return;

  const plataformas = ['TikTok'];
  if (process.env.KICK_CLIENT_ID && process.env.KICK_CLIENT_SECRET) plataformas.push('Kick');
  else console.log('[streamWatcher] sin credenciales de Kick, solo se vigila TikTok');

  console.log(`[streamWatcher] vigilando ${plataformas.join(' y ')} cada ${INTERVALO_MS / 1000}s`);

  const vuelta = () => revisar(guild).catch(err => console.error('[streamWatcher]', err.message));
  vuelta();
  setInterval(vuelta, INTERVALO_MS);
}

module.exports = { iniciar, consultarTikTok, consultarKick };
