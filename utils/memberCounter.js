// Mantiene un canal cuyo nombre muestra cuanta gente hay en el servidor.
//
// Discord solo admite unos 2 renombres cada 10 minutos por canal, asi que no
// se puede actualizar en cada entrada y salida: se refresca cada 10 minutos y
// solo si la cifra cambio de verdad.

const INTERVALO_MS = 10 * 60 * 1000;

// {count} se sustituye por el numero de miembros
const FORMATO = process.env.MEMBER_COUNT_FORMAT || '｡˚♡ Mis Rosquitas ♡˚｡ ─ {count}';

let ultimoPuesto = null;

function contar(guild) {
  // Sin contar bots, que no son comunidad
  const humanos = guild.members.cache.filter(m => !m.user.bot).size;
  return humanos || guild.memberCount;
}

async function actualizar(guild) {
  const canalId = process.env.MEMBER_COUNT_CHANNEL_ID;
  if (!canalId) return;

  const total = contar(guild);
  if (total === ultimoPuesto) return;

  const canal = await guild.channels.fetch(canalId).catch(() => null);
  if (!canal) return console.error('[memberCounter] no encuentro el canal ' + canalId);

  const nombre = FORMATO.replace('{count}', total);
  if (canal.name === nombre) { ultimoPuesto = total; return; }

  await canal.setName(nombre, 'Contador de miembros')
    .then(() => {
      ultimoPuesto = total;
      console.log(`[memberCounter] actualizado a ${total} miembros`);
    })
    .catch(err => console.error('[memberCounter] no se pudo renombrar:', err.message));
}

function iniciar(guild) {
  if (!process.env.MEMBER_COUNT_CHANNEL_ID) return;

  console.log(`[memberCounter] actualizando cada ${INTERVALO_MS / 60000} min`);
  const vuelta = () => actualizar(guild).catch(err => console.error('[memberCounter]', err.message));
  vuelta();
  setInterval(vuelta, INTERVALO_MS);
}

module.exports = { iniciar, actualizar };
