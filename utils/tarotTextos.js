// Textos complementarios de cada carta, indexados por slug.
//
//   eje     : sintagma corto que describe la carta. Se encadena con el de
//             las otras cartas para redactar la lectura conjunta.
//   consejo : varias opciones por orientacion; se elige una al azar para que
//             la misma carta no se lea siempre igual.
const TEXTOS = {
  'el-loco': {
    eje: { d: 'un comienzo que todavía no se atreve del todo', i: 'un impulso que se adelantó a la reflexión' },
    consejo: {
      d: ['Da el primer paso aunque el camino no esté trazado.', 'No esperes a sentirte preparado: eso llega andando.', 'Confía en lo que aún no puedes justificar.'],
      i: ['Detente lo justo para distinguir el impulso de la intuición.', 'Antes de saltar, mira dónde vas a caer.', 'La prisa aquí te está costando claridad.'],
    },
  },
  'el-mago': {
    eje: { d: 'una capacidad que espera ser usada', i: 'un talento que aún no encuentra dirección' },
    consejo: {
      d: ['Empieza con lo que ya tienes; alcanza.', 'Deja de prepararte y ponte a hacerlo.', 'Tu voluntad pesa más que las condiciones.'],
      i: ['Revisa qué se te promete y qué se te demuestra.', 'No confundas inseguridad con falta de capacidad.', 'Enfoca en una sola cosa antes de abrir otra.'],
    },
  },
  'la-sacerdotisa': {
    eje: { d: 'un saber interno que pide silencio', i: 'algo que permanece deliberadamente en sombra' },
    consejo: {
      d: ['Escucha antes de actuar.', 'La respuesta ya está en ti; dale espacio.', 'Este no es momento de preguntar afuera.'],
      i: ['Nombra aquello que llevas tiempo evitando mirar.', 'Falta información y lo sabes: búscala.', 'No decidas con el terreno incompleto.'],
    },
  },
  'la-emperatriz': {
    eje: { d: 'algo fértil que está madurando', i: 'un desgaste por sostener demasiado' },
    consejo: {
      d: ['Cuida el proceso sin apurar su tiempo.', 'Lo que riegas ahora dará fruto después.', 'Permítete disfrutar lo que ya creciste.'],
      i: ['Atiende lo tuyo antes que lo ajeno.', 'Dar sin recibir agota hasta al más generoso.', 'Revisa cuánto estás entregando y a costa de qué.'],
    },
  },
  'el-emperador': {
    eje: { d: 'una estructura que pide ser establecida', i: 'un control que se volvió rigidez' },
    consejo: {
      d: ['Pon límites claros y sostenlos.', 'Ordena lo disperso antes de avanzar.', 'La autoridad sobre lo tuyo te corresponde.'],
      i: ['Suelta el control donde no hace falta.', 'Lo que no puede moverse termina quebrándose.', 'Distingue entre firmeza y dureza.'],
    },
  },
  'el-sumo-sacerdote': {
    eje: { d: 'un aprendizaje que viene de otro', i: 'una norma heredada que ya no corresponde' },
    consejo: {
      d: ['Consulta a quien ya recorrió ese camino.', 'No todo debe aprenderse por cuenta propia.', 'Un marco probado te ahorra tiempo.'],
      i: ['Distingue lo que conservas por convicción de lo que conservas por inercia.', 'Cuestionar no es desordenar.', 'Esa regla ya no te describe.'],
    },
  },
  'los-enamorados': {
    eje: { d: 'una elección que compromete lo que valoras', i: 'una duda que conviene atender' },
    consejo: {
      d: ['Elige de acuerdo con quien eres, no con lo cómodo.', 'La coherencia pesa más que la conveniencia.', 'Decide con el corazón informado.'],
      i: ['Lo que no convence hoy rara vez convence después.', 'Revisa si estás eligiendo o cediendo.', 'Nombra el desequilibrio antes de que crezca.'],
    },
  },
  'el-carruaje': {
    eje: { d: 'un avance que ya está en marcha', i: 'una energía repartida en demasiados frentes' },
    consejo: {
      d: ['Sostén el rumbo cuando llegue el cansancio.', 'El mérito estará en no soltar.', 'Vas bien: no cambies de dirección ahora.'],
      i: ['Elige una sola dirección y acepta soltar las otras.', 'Avanzar en todo es no avanzar en nada.', 'Ordena las prioridades antes de seguir.'],
    },
  },
  'la-fuerza': {
    eje: { d: 'una firmeza que no necesita alzar la voz', i: 'una contención que lleva demasiado tiempo' },
    consejo: {
      d: ['Responde con calma: eso desarma.', 'Lo que enfrentas con serenidad pierde poder.', 'Domina la reacción antes que la situación.'],
      i: ['Reconoce que estás cansado; no es debilidad.', 'Algo lleva demasiado tiempo aguantándose.', 'Suelta un poco antes de que se desborde.'],
    },
  },
  'el-ermitano': {
    eje: { d: 'un repliegue necesario', i: 'un aislamiento que se prolongó de más' },
    consejo: {
      d: ['Concédete tiempo a solas sin culpa.', 'Aparta el ruido para oírte.', 'Este es momento de mirar, no de moverte.'],
      i: ['Deja que te acompañen; volver no anula lo aprendido.', 'El retiro ya cumplió su función.', 'Pedir ayuda no deshace tu proceso.'],
    },
  },
  'la-rueda': {
    eje: { d: 'un ciclo que gira a favor', i: 'una fase descendente que es tránsito' },
    consejo: {
      d: ['Aprovecha: el momento es ahora, no antes.', 'Lo que no funcionó puede funcionar hoy.', 'Muévete mientras el viento sopla.'],
      i: ['Resistirse al giro solo alarga la vuelta.', 'Esto responde a un momento, no a una condición.', 'Sostén hasta que el ciclo complete.'],
    },
  },
  'la-justicia': {
    eje: { d: 'una consecuencia que está por manifestarse', i: 'una balanza que sigue inclinada' },
    consejo: {
      d: ['Reconoce tu parte en lo ocurrido.', 'Actúa con la honestidad que esperas recibir.', 'Lo sembrado está por llegar.'],
      i: ['Nombra lo que no está siendo justo.', 'Asume la responsabilidad que has estado esquivando.', 'Mira la balanza de frente.'],
    },
  },
  'el-colgado': {
    eje: { d: 'una pausa que reordena', i: 'una espera que dejó de ser útil' },
    consejo: {
      d: ['Mira el asunto desde otro ángulo.', 'Ver distinto precede a hacer distinto.', 'Esta pausa no es tiempo perdido.'],
      i: ['La señal que esperas no va a llegar: muévete.', 'Sostener esa renuncia ya no sirve a nadie.', 'El momento de actuar es ahora.'],
    },
  },
  'la-muerte': {
    eje: { d: 'un cierre que abre paso', i: 'un apego a lo que ya terminó' },
    consejo: {
      d: ['Permítete el duelo: es parte del proceso.', 'Lo que termina deja sitio a lo que viene.', 'No fuerces la despedida ni la alargues.'],
      i: ['Soltar no es renunciar: es reconocer lo ocurrido.', 'La resistencia encarece el tránsito.', 'Eso ya terminó, aunque duela nombrarlo.'],
    },
  },
  'la-balanza': {
    eje: { d: 'una medida que se está encontrando', i: 'un movimiento pendular entre extremos' },
    consejo: {
      d: ['Sostén el ritmo aunque no sea el que quisieras.', 'La constancia rinde más que el arrebato.', 'Combina sin forzar la mezcla.'],
      i: ['Busca el punto medio: no es tibieza, es sostenibilidad.', 'Todo o nada te está desgastando.', 'Regula antes de volver a lanzarte.'],
    },
  },
  'el-diablo': {
    eje: { d: 'una atadura que ejerce más poder del reconocido', i: 'una cadena que empieza a aflojarse' },
    consejo: {
      d: ['Míralo de frente: ese es el primer movimiento.', 'Lo que se elige libremente no ata.', 'Nombra la dependencia sin juzgar el deseo.'],
      i: ['El proceso es incómodo; suele serlo.', 'Ese espacio nuevo es tuyo: ocúpalo.', 'Vas soltando, aunque no lo notes aún.'],
    },
  },
  'la-torre': {
    eje: { d: 'una ruptura que despeja el terreno', i: 'un derrumbe que se viene postergando' },
    consejo: {
      d: ['Lo que cae no tenía base firme.', 'Después del golpe queda espacio libre.', 'No reconstruyas igual lo que se cayó.'],
      i: ['Anticiparse permite elegir cómo.', 'Lo aplazado suele caer con más fuerza.', 'Ya sabes qué tiene que cambiar.'],
    },
  },
  'la-estrella': {
    eje: { d: 'una calma ganada tras el esfuerzo', i: 'una confianza que necesita reconstruirse' },
    consejo: {
      d: ['Es buen momento para proyectar a largo plazo.', 'Descansa sin culpa: te lo ganaste.', 'La esperanza aquí no es ingenua.'],
      i: ['Reconstruye la fe con hechos pequeños.', 'El camino sigue abierto aunque no lo veas.', 'El desánimo nubla, no cierra.'],
    },
  },
  'la-luna': {
    eje: { d: 'un panorama que aún no se ve claro', i: 'una niebla que empieza a disiparse' },
    consejo: {
      d: ['No concluyas con datos incompletos.', 'Lo que crees ver puede estar teñido por lo que temes.', 'Espera a que se despeje.'],
      i: ['Lo real suele ser más manejable que lo imaginado.', 'Ahora sí puedes decidir con información.', 'Aprovecha la claridad mientras dura.'],
    },
  },
  'el-sol': {
    eje: { d: 'una claridad que confirma lo dudado', i: 'una alegría que llega con demora' },
    consejo: {
      d: ['Muéstrate sin reservas.', 'Lo que costaba empieza a fluir.', 'Disfrútalo sin buscarle el defecto.'],
      i: ['El resultado no se cancela: se retrasa.', 'Permítete la alegría que estás postergando.', 'Ya viene, aunque tarde más de lo previsto.'],
    },
  },
  'el-juicio': {
    eje: { d: 'una segunda oportunidad que se presenta', i: 'una autocrítica más severa que justa' },
    consejo: {
      d: ['Retoma aquello con la comprensión que ahora tienes.', 'Haz balance sin buscar culpables.', 'Ese llamado lo reconoces al escucharlo.'],
      i: ['Mira los hechos sin la condena.', 'El rigor excesivo te está frenando, no impulsando.', 'Trátate como tratarías a quien quieres.'],
    },
  },
  'el-mundo': {
    eje: { d: 'un ciclo que se cierra completo', i: 'un cierre al que le falta un paso' },
    consejo: {
      d: ['Reconoce lo recorrido antes de mirar lo siguiente.', 'Cierra bien para poder abrir.', 'Lo lograste: date el crédito.'],
      i: ['Queda un cabo suelto: atiéndelo.', 'No lo des por hecho todavía.', 'Falta poco, pero falta.'],
    },
  },
};

// Frases con que arranca la lectura, para que no siempre empiece igual
const APERTURAS = [
  'Las cartas señalan lo siguiente.',
  'Esto es lo que se muestra.',
  'La tirada apunta en esta dirección.',
  'Lo que aparece es claro.',
  'El mensaje se presenta así.',
  'Las cartas responden.',
];

// Aperturas de la sintesis segun cuantas cartas salieron invertidas
const TONO_CONJUNTO = {
  0: [
    'La tirada llega limpia: las tres cartas caen derechas, y eso indica un proceso que avanza sin trabas de fondo.',
    'Ninguna carta salió invertida. El camino se muestra despejado y la energía fluye en una sola dirección.',
  ],
  1: [
    'Dos cartas derechas y una invertida: el proceso avanza, pero hay un punto que pide atención antes de seguir.',
    'La tirada es mayormente favorable, con una sola resistencia que conviene mirar de cerca.',
  ],
  2: [
    'Dos cartas invertidas señalan que hay más bloqueo que impulso en este momento. No es un mal augurio, sino un aviso de que algo debe destrabarse.',
    'La mayoría de la tirada aparece invertida: el asunto está atravesando su parte más densa.',
  ],
  3: [
    'Las tres cartas caen invertidas. Es una tirada exigente, que habla de un momento donde casi todo pide revisión antes que acción.',
    'Toda la tirada aparece del revés. No anuncia desgracia, sino que ningún frente está listo todavía: es tiempo de reordenar.',
  ],
};

const CIERRES = {
  favorable: [
    'La lectura acompaña: lo que se ponga en marcha ahora tiene terreno a favor.',
    'El conjunto invita a avanzar con confianza, sin forzar los tiempos.',
    'Hay coherencia entre lo que fue, lo que es y lo que viene.',
  ],
  mixto: [
    'La lectura pide discernimiento: no todo está resuelto, pero tampoco cerrado.',
    'El conjunto sugiere avanzar con atención, resolviendo lo pendiente sin detener la marcha.',
    'Hay movimiento, aunque conviene atender lo que aún no encaja.',
  ],
  exigente: [
    'La lectura aconseja pausa antes que acción: primero ordenar, después avanzar.',
    'El conjunto no cierra puertas, pero pide revisar los cimientos antes de dar el siguiente paso.',
    'Es momento de sostener y observar más que de decidir.',
  ],
};

module.exports = { TEXTOS, APERTURAS, TONO_CONJUNTO, CIERRES };
