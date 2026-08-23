const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags} = require('discord.js');

// Estructura objetivo. Cada canal se busca entre los que ya existen por
// palabras clave, de modo que se renombra y se mueve el canal de siempre en
// vez de crear uno nuevo: asi no se pierde el historial de mensajes.
// Solo se crea desde cero lo que no encuentra.
const PLAN = [
  {
    categoria: '🎀・BIENVENIDA',
    canales: [
      { nombre: '🌸・reglas-sickers', claves: ['reglas'] },
      { nombre: '🚪・puerta-del-servidor', claves: ['puerta', 'bienvenid'] },
      { nombre: '🍭・roles-y-colores', claves: ['roles'], crearSiFalta: true },
    ],
  },
  {
    categoria: '📢・AVISOS',
    canales: [
      { nombre: '🔔・anuncios-o-eventos', claves: ['anuncios', 'eventos'] },
      { nombre: '🎮・free-games', claves: ['free', 'games'] },
      { nombre: '🎬・clips-and-more', claves: ['clips'] },
    ],
  },
  {
    // Esta categoria la renombra el bot segun haya stream, asi que aqui
    // solo se colocan los canales que van dentro.
    categoria: null,
    usarLiveCategory: true,
    canales: [
      { nombre: '📺・streams-tiktoks', claves: ['streams', 'tiktok'] },
    ],
  },
  {
    categoria: '🍩・ROSQUITAS',
    canales: [
      { nombre: '💬・chat-general', claves: ['chat', 'general'] },
      { nombre: '📸・memes-o-fotitos', claves: ['memes', 'fotitos'] },
      { nombre: '💡・sugerencias', claves: ['sugerencias'] },
      { nombre: '⭐・nivel-rosca', claves: ['nivel', 'rosca'] },
      { nombre: '🤖・comandos-spam', claves: ['comandos-spam', 'spam'] },
    ],
  },
  {
    categoria: '🎵・BAJE DE PEPA',
    canales: [
      { nombre: '🎧・comandos-musica', claves: ['comandos-musica', 'musica'] },
    ],
  },
];

const normalizar = txt => txt
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]/g, '');

function buscarCanal(guild, claves, usados) {
  for (const clave of claves) {
    const objetivo = normalizar(clave);
    const encontrado = guild.channels.cache.find(c =>
      c.type === ChannelType.GuildText &&
      !usados.has(c.id) &&
      normalizar(c.name).includes(objetivo)
    );
    if (encontrado) return encontrado;
  }
  return null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('organizar-servidor')
    .setDescription('Renombra y ordena los canales con la estructura kawaii')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(o =>
      o.setName('aplicar')
        .setDescription('Falso (por defecto) solo muestra los cambios sin tocar nada')
    ),

  async execute(interaction) {
    const aplicar = interaction.options.getBoolean('aplicar') === true;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guild = interaction.guild;
    await guild.channels.fetch();

    const usados = new Set();
    const lineas = [];
    let cambios = 0;

    for (const grupo of PLAN) {
      // Localizar o preparar la categoria
      let categoria = null;

      if (grupo.usarLiveCategory) {
        categoria = guild.channels.cache.get(process.env.LIVE_CATEGORY_ID) || null;
        if (!categoria) { lineas.push('⚠️ No encuentro la categoría de stream, me la salto'); continue; }
        lineas.push(`\n**${categoria.name}** *(la renombra el bot según el stream)*`);
      } else {
        categoria = guild.channels.cache.find(c =>
          c.type === ChannelType.GuildCategory && normalizar(c.name) === normalizar(grupo.categoria)
        );

        if (!categoria) {
          // Reaprovechar una categoria parecida antes de crear otra
          const parecida = guild.channels.cache.find(c =>
            c.type === ChannelType.GuildCategory &&
            !usados.has(c.id) &&
            normalizar(grupo.categoria).includes(normalizar(c.name).slice(0, 6))
          );

          if (parecida) {
            lineas.push(`\n**${grupo.categoria}** ← renombrar «${parecida.name}»`);
            if (aplicar) await parecida.setName(grupo.categoria).catch(() => {});
            categoria = parecida;
          } else {
            lineas.push(`\n**${grupo.categoria}** ← crear`);
            if (aplicar) {
              categoria = await guild.channels.create({
                name: grupo.categoria, type: ChannelType.GuildCategory,
              }).catch(() => null);
            }
          }
          cambios++;
        } else {
          lineas.push(`\n**${categoria.name}**`);
        }
        if (categoria) usados.add(categoria.id);
      }

      for (const def of grupo.canales) {
        const canal = buscarCanal(guild, def.claves, usados);

        if (!canal) {
          if (!def.crearSiFalta) { lineas.push(`   ⚠️ no encontrado: ${def.nombre}`); continue; }
          lineas.push(`   ➕ crear ${def.nombre}`);
          cambios++;
          if (aplicar && categoria) {
            await guild.channels.create({
              name: def.nombre, type: ChannelType.GuildText, parent: categoria.id,
            }).catch(() => {});
          }
          continue;
        }

        usados.add(canal.id);
        const renombrar = canal.name !== def.nombre;
        const mover = categoria && canal.parentId !== categoria.id;

        if (!renombrar && !mover) { lineas.push(`   ✅ ${canal.name}`); continue; }

        lineas.push(`   ✏️ «${canal.name}» → ${def.nombre}${mover ? ' *(y se mueve)*' : ''}`);
        cambios++;

        if (aplicar) {
          if (mover) await canal.setParent(categoria.id, { lockPermissions: false }).catch(() => {});
          if (renombrar) await canal.setName(def.nombre).catch(err =>
            console.error('[organizar] ' + canal.name + ':', err.message));
        }
      }
    }

    const cabecera = aplicar
      ? `✅ **Aplicado.** ${cambios} cambio(s).\n`
      : `🔍 **Simulación.** ${cambios} cambio(s) pendientes.\n` +
        `Si te convence, repite con \`aplicar:True\`.\n`;

    const cuerpo = lineas.join('\n');
    const texto = cabecera + (cuerpo.length > 1800 ? cuerpo.slice(0, 1800) + '\n…' : cuerpo);

    await interaction.editReply(texto);
  },
};
