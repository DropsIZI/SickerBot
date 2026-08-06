// Detecta de que va la consulta y anade una nota acorde a la lectura.
//
// Las claves se comparan sobre el texto normalizado (sin tildes ni signos),
// y como se busca por fragmento basta la raiz de la palabra: "enamor" cubre
// enamorado, enamorada, enamorarse y enamoramiento.
const TEMAS = [
  {
    id: 'amor',
    titulo: '💗 Sobre el amor',
    claves: [
      'amor', 'enamor', 'pareja', 'novi', 'crush', 'me gusta', 'le gusto',
      'relacion', 'romance', 'cita', 'beso', 'corazon', 'querer', 'me quiere',
      'me ama', 'me amara', 'casarme', 'matrimonio', 'boda', 'ligar',
      'conquistar', 'mi ex', 'su ex',
      'volver con', 'infiel', 'celos', 'gustar', 'salir con',
    ],
    notas: [
      'En asuntos del corazón, las cartas describen el terreno, no a la otra persona. Lo que muestran es tu posición en el vínculo.',
      'El tarot no dice si alguien te quiere: dice qué papel estás ocupando tú y qué depende de ti.',
      'En consultas de pareja, lo que la tirada ilumina es tu parte del asunto. La del otro no le corresponde a estas cartas.',
    ],
  },
  {
    id: 'dinero',
    titulo: '💰 Sobre el dinero',
    claves: [
      'dinero', 'plata', 'lana', 'guita', 'feria', 'billete', 'sueldo',
      'salario', 'pago', 'cobrar', 'deuda', 'prestamo', 'ahorr', 'economi',
      'finanz', 'rico', 'pobre', 'gastar', 'invertir', 'inversion', 'renta',
    ],
    notas: [
      'En lo económico las cartas señalan tendencias y decisiones, no cifras ni fechas.',
      'El dinero suele responder a hábitos sostenidos. La tirada apunta al hábito, no al golpe de suerte.',
      'Lo que muestran las cartas aquí es la dirección de tus decisiones, no una cantidad concreta.',
    ],
  },
  {
    id: 'apuestas',
    titulo: '🎲 Sobre juegos de azar',
    claves: [
      'apuesta', 'apostar', 'casino', 'loteria', 'ruleta', 'azar', 'quiniela',
      'tragamonedas', 'tragaperras', 'bet', 'raspadit', 'sorteo', 'rifa',
      'numero de la suerte', 'jugar dinero', 'poker', 'blackjack', 'kino',
    ],
    notas: [
      'El tarot no predice resultados de azar. Ninguna carta puede decirte qué número saldrá, y quien afirme lo contrario te está engañando.',
      'Las cartas no anticipan sorteos ni partidas: en el azar, por definición, no hay patrón que leer.',
      'Sobre juegos de azar la lectura no sirve como pronóstico. Si el juego te está costando dinero o tranquilidad, eso sí merece atención.',
    ],
  },
  {
    id: 'trabajo',
    titulo: '💼 Sobre el trabajo',
    claves: [
      'trabajo', 'trabajar', 'empleo', 'chamba', 'laburo', 'pega', 'jefe',
      'entrevista', 'curriculum', 'ascenso', 'renunciar', 'despido',
      'contrato', 'negocio', 'emprender', 'cliente', 'proyecto', 'oficina',
    ],
    notas: [
      'En lo laboral las cartas hablan de tu posición y tus tiempos, no de decisiones que toman otros por ti.',
      'La tirada apunta a lo que puedes mover tú dentro del asunto, que suele ser más de lo que parece.',
      'Aquí conviene separar lo que depende de tu esfuerzo de lo que depende del contexto. Las cartas se refieren a lo primero.',
    ],
  },
  {
    id: 'estudios',
    titulo: '📚 Sobre los estudios',
    claves: [
      'estudi', 'examen', 'universidad', 'carrera', 'tesis', 'aprobar',
      'reprobar', 'materia', 'profesor', 'colegio', 'escuela', 'beca',
      'nota', 'calificacion', 'titular', 'graduar',
    ],
    notas: [
      'En los estudios las cartas hablan de tu constancia y tu enfoque, no del resultado de una prueba concreta.',
      'La tirada no anticipa una calificación: describe cómo estás llegando a ella.',
      'Lo que se lee aquí es tu relación con el esfuerzo, que es lo que sí puedes ajustar.',
    ],
  },
  {
    id: 'salud',
    titulo: '🌿 Sobre el bienestar',
    claves: [
      'salud', 'enferm', 'doctor', 'medico', 'dolor', 'ansiedad', 'depres',
      'terapia', 'psicolog', 'dormir', 'insomnio', 'cansancio', 'agotad',
      'cuerpo', 'operacion', 'tratamiento', 'recuper',
    ],
    notas: [
      'El tarot no diagnostica ni sustituye a un profesional de la salud. Lo que puede mostrar es cómo estás viviendo el proceso.',
      'En temas de salud las cartas hablan del ánimo con que atraviesas la situación, nunca de lo médico.',
      'Si hay algo físico o emocional que te preocupa, esta lectura acompaña pero no reemplaza una consulta profesional.',
    ],
  },
  {
    id: 'familia',
    titulo: '🏠 Sobre la familia',
    claves: [
      'familia', 'mama', 'papa', 'madre', 'padre', 'hermano', 'hermana',
      'hijo', 'hija', 'abuel', 'tio', 'primo', 'pariente', 'casa de mis',
      'mis viejos', 'mudarme',
    ],
    notas: [
      'En lo familiar las cartas suelen apuntar a patrones antiguos más que a hechos recientes.',
      'Estos vínculos cargan historia. La tirada señala qué parte sigue activa hoy.',
      'Aquí lo que se lee es tu lugar dentro del sistema, no la conducta de los demás.',
    ],
  },
  {
    id: 'amistad',
    titulo: '🫂 Sobre las amistades',
    claves: [
      'amig', 'amistad', 'compa', 'cuate', 'pana', 'parce', 'brother',
      'grupo', 'traicion', 'confianza', 'me hablan', 'ignoran',
    ],
    notas: [
      'En las amistades las cartas muestran la reciprocidad: cuánto se sostiene desde ambos lados.',
      'La tirada apunta a si el vínculo se alimenta o solo se arrastra por costumbre.',
      'Lo que aparece aquí es tu posición en el grupo, no lo que otros piensan de ti.',
    ],
  },
  {
    id: 'decision',
    titulo: '🧭 Sobre tu decisión',
    claves: [
      'debo', 'deberia', 'me conviene', 'decidir', 'decision', 'elegir',
      'que hago', 'me voy', 'irme', 'quedarme', 'cambiar', 'arriesgar',
      'aceptar', 'rechazar', 'camino', 'opcion',
    ],
    notas: [
      'Las cartas no eligen por ti: muestran qué pesa en cada lado para que decidas con más información.',
      'Ante una decisión, la tirada no dicta la respuesta. Ordena lo que ya sabes.',
      'Lo que hace la lectura aquí es señalar qué estás pasando por alto, no darte una instrucción.',
    ],
  },
];

const normalizar = txt => txt
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 ]/g, ' ');

// Devuelve el tema que mejor encaja, o null si no encaja ninguno.
// Puntua por la longitud de la clave: "mis amigos" describe la consulta mucho
// mejor que un fragmento de tres letras que aparece por casualidad.
function detectarTema(pregunta) {
  if (!pregunta) return null;
  const texto = normalizar(pregunta);

  let mejor = null;
  let maxPuntos = 0;

  for (const tema of TEMAS) {
    let puntos = 0;
    for (const clave of tema.claves) {
      const c = normalizar(clave).trim();
      if (texto.includes(c)) puntos += c.length;
    }
    if (puntos > maxPuntos) { maxPuntos = puntos; mejor = tema; }
  }

  return mejor;
}

module.exports = { TEMAS, detectarTema };
