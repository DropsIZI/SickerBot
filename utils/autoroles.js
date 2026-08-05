const { PAISES } = require('./paises');

// Grupos de roles que cada quien se pone a si mismo desde un desplegable.
//
// Todos se crean SIN color aposta: Discord muestra el color del rol con color
// mas alto en la jerarquia, asi que si estos llevaran uno taparian el del
// rango por nivel y el degradado de rangos no se veria.
//
//   unico: true  -> solo se puede tener uno del grupo (pais, genero, edad)
//   unico: false -> se pueden marcar varios (personalidad, juegos)
const GRUPOS = {
  paises: {
    titulo: '🌎  ¿Desde dónde nos acompañas?',
    descripcion: 'Elige tu país y lo verá todo el mundo en tu perfil 🍩',
    placeholder: '🌎 Selecciona tu país…',
    color: 0x7DD3FC,
    unico: true,
    opciones: PAISES.map(p => ({ emoji: p.emoji, nombre: p.nombre })),
  },

  genero: {
    titulo: '💛  ¿Cómo prefieres que te traten?',
    descripcion: 'Para que nadie se equivoque al hablarte 🎀',
    placeholder: '💛 Elige el tuyo…',
    color: 0xFFD700,
    unico: true,
    opciones: [
      { emoji: '💙', nombre: 'Chico' },
      { emoji: '💗', nombre: 'Chica' },
      { emoji: '💜', nombre: 'Otro' },
      { emoji: '🤍', nombre: 'Prefiero no decirlo' },
    ],
  },

  edad: {
    titulo: '🎂  ¿Qué edad tienes?',
    descripcion: 'Nos ayuda a saber cómo es la comunidad. Es opcional 🍩',
    placeholder: '🎂 Elige tu rango…',
    color: 0xFF85A1,
    unico: true,
    opciones: [
      { emoji: '🌙', nombre: '-18' },
      { emoji: '⭐', nombre: '+18' },
    ],
  },

  personalidad: {
    titulo: '🌸  ¿Cómo eres tú?',
    descripcion: 'Marca las que te peguen, puedes elegir varias ✨',
    placeholder: '🌸 Elige las que quieras…',
    color: 0xFFC8DD,
    unico: false,
    opciones: [
      { emoji: '🍯', nombre: 'Amable' },
      { emoji: '🌷', nombre: 'Tímido/a' },
      { emoji: '🤡', nombre: 'Bromista' },
      { emoji: '🔥', nombre: 'Competitivo/a' },
      { emoji: '🎨', nombre: 'Creativo/a' },
      { emoji: '☁️', nombre: 'Tranquilo/a' },
      { emoji: '💬', nombre: 'Hablador/a' },
      { emoji: '🌙', nombre: 'Nocturno/a' },
      { emoji: '🫂', nombre: 'Cariñoso/a' },
    ],
  },

  juegos: {
    titulo: '🎮  ¿A qué juegas?',
    descripcion: 'Así te encuentran para armar partida 🕹️',
    placeholder: '🎮 Elige tus juegos…',
    color: 0xC77DFF,
    unico: false,
    opciones: [
      { emoji: '⛏️', nombre: 'Minecraft' },
      { emoji: '🦸', nombre: 'Marvel Rivals' },
      { emoji: '🎯', nombre: 'Valorant' },
      { emoji: '🏝️', nombre: 'Fortnite' },
      { emoji: '🧱', nombre: 'Roblox' },
      { emoji: '⚔️', nombre: 'League of Legends' },
      { emoji: '🔫', nombre: 'Call of Duty' },
      { emoji: '👻', nombre: 'Among Us' },
      { emoji: '🌟', nombre: 'Genshin Impact' },
      { emoji: '🔴', nombre: 'Pokémon' },
      { emoji: '🚗', nombre: 'GTA' },
      { emoji: '🎲', nombre: 'Otros juegos' },
    ],
  },
};

// El emoji va en el nombre para que se vea en la lista de miembros
const nombreRol = (grupoId, opcion) => `${opcion.emoji} ${opcion.nombre}`;

const rolesDeGrupo = grupoId =>
  GRUPOS[grupoId].opciones.map(o => nombreRol(grupoId, o));

module.exports = { GRUPOS, nombreRol, rolesDeGrupo };
