const crypto = require('crypto');

// Arcanos mayores. El slug es el nombre del archivo que se busca en
// assets/tarot/<slug>.png; si no existe, la carta se muestra solo con texto.
//
//   clave  : palabras clave de la carta
//   corto  : el significado en una linea
//   lectura: la interpretacion extendida que se muestra al consultante
const CARTAS = [
  {
    n: 0, slug: 'el-loco', nombre: 'El Loco', emoji: '🃏',
    clave: { d: 'Comienzos · Libertad · Fe', i: 'Imprudencia · Miedo · Caos' },
    corto: { d: 'Un comienzo que pide confianza.', i: 'Un impulso que conviene medir.' },
    lectura: {
      d: 'Te encuentras en el umbral de algo nuevo, sin todas las respuestas y con el camino todavía sin trazar. Esta carta no exige certezas, solo el valor de dar el primer paso. Lo que hoy parece un salto al vacío mañana será el punto de partida.',
      i: 'Hay una energía que se mueve más rápido de lo que puedes sostener. Quizá estés evitando una decisión, o corriendo hacia ella sin mirar las consecuencias. La carta pide detenerse lo justo para distinguir el impulso de la intuición.',
    },
  },
  {
    n: 1, slug: 'el-mago', nombre: 'El Mago', emoji: '🪄',
    clave: { d: 'Voluntad · Talento · Acción', i: 'Manipulación · Dudas · Dispersión' },
    corto: { d: 'Tienes los recursos; falta usarlos.', i: 'El talento existe, la dirección no.' },
    lectura: {
      d: 'Todo lo que necesitas para lograr aquello que te propones ya está en tus manos. La carta habla de capacidad y de momento oportuno: no de esperar condiciones perfectas, sino de reconocer las que ya tienes. La voluntad, aquí, es más determinante que el talento.',
      i: 'La energía está presente pero mal dirigida. Puede tratarse de tu propia inseguridad, que te hace creer que no estás preparado, o de alguien que promete más de lo que sostiene. Conviene revisar qué se afirma y qué se demuestra.',
    },
  },
  {
    n: 2, slug: 'la-sacerdotisa', nombre: 'La Sacerdotisa', emoji: '🌙',
    clave: { d: 'Intuición · Silencio · Misterio', i: 'Secretos · Desconexión' },
    corto: { d: 'La respuesta está en lo que ya intuyes.', i: 'Algo permanece oculto o ignorado.' },
    lectura: {
      d: 'Hay un saber en ti que no pasa por el razonamiento y que llevas tiempo desatendiendo. Esta carta no aconseja actuar, sino escuchar: lo que buscas afuera ya se está manifestando adentro. El silencio, en este momento, rinde más que la consulta.',
      i: 'Algo se mantiene en la sombra. Puede ser información que se te oculta, o una verdad propia que prefieres no mirar de frente. Mientras siga ahí, cualquier decisión se tomará con el terreno incompleto.',
    },
  },
  {
    n: 3, slug: 'la-emperatriz', nombre: 'La Emperatriz', emoji: '🌷',
    clave: { d: 'Abundancia · Creación · Cuidado', i: 'Descuido · Estancamiento' },
    corto: { d: 'Algo fértil está tomando forma.', i: 'Estás dando más de lo que recibes.' },
    lectura: {
      d: 'Un proyecto, un vínculo o una etapa de tu vida atraviesa un momento de crecimiento genuino. La carta habla de paciencia fértil: lo que cuidas ahora dará fruto, aunque todavía no se vea. No fuerces los tiempos de aquello que está madurando.',
      i: 'La energía que entregas hacia afuera está desatendiendo lo propio. Puede manifestarse como agotamiento, o como un proyecto que se estanca porque quien lo sostiene no se sostiene a sí mismo. El cuidado, para ser sostenible, empieza por dentro.',
    },
  },
  {
    n: 4, slug: 'el-emperador', nombre: 'El Emperador', emoji: '👑',
    clave: { d: 'Estructura · Autoridad · Límites', i: 'Rigidez · Control excesivo' },
    corto: { d: 'Es momento de poner orden.', i: 'La firmeza se volvió dureza.' },
    lectura: {
      d: 'La situación pide estructura: reglas claras, límites definidos y decisiones que se sostengan en el tiempo. Esta carta señala que la autoridad sobre lo tuyo te corresponde a ti, y que ejercerla no es imponerse, sino ordenar lo disperso.',
      i: 'El control se ha vuelto excesivo y está ahogando aquello que pretendía proteger. Puede tratarse de tu propia rigidez o de una autoridad externa que no deja espacio. Lo que no puede moverse, con el tiempo, se quiebra.',
    },
  },
  {
    n: 5, slug: 'el-sumo-sacerdote', nombre: 'El Sumo Sacerdote', emoji: '📜',
    clave: { d: 'Tradición · Guía · Aprendizaje', i: 'Dogma · Rebeldía necesaria' },
    corto: { d: 'Alguien con experiencia puede orientarte.', i: 'Una norma heredada ya no te sirve.' },
    lectura: {
      d: 'La respuesta que buscas no tiene que inventarse: alguien ya recorrió ese camino. Esta carta sugiere apoyarse en quien tiene experiencia, en un marco probado o en un conocimiento que te precede. No todo debe aprenderse por cuenta propia.',
      i: 'Sigues sosteniendo una norma, una costumbre o una expectativa que ya no corresponde a quien eres. La carta no invita al desorden, sino a distinguir entre lo que conservas por convicción y lo que conservas por inercia.',
    },
  },
  {
    n: 6, slug: 'los-enamorados', nombre: 'Los Enamorados', emoji: '💕',
    clave: { d: 'Elección · Unión · Valores', i: 'Duda · Desequilibrio' },
    corto: { d: 'Una decisión que compromete el corazón.', i: 'Algo no termina de encajar.' },
    lectura: {
      d: 'Se presenta una elección que no se resuelve con lógica, porque involucra aquello que valoras. La carta habla de vínculos, pero sobre todo de coherencia: elegir de acuerdo con lo que eres, aunque no sea el camino más cómodo.',
      i: 'Hay una duda que persiste y que conviene atender en lugar de acallar. Puede ser un desequilibrio en una relación o una decisión tomada desde la presión y no desde el deseo. Lo que no convence hoy rara vez convence después.',
    },
  },
  {
    n: 7, slug: 'el-carruaje', nombre: 'El Carruaje', emoji: '🏆',
    clave: { d: 'Avance · Determinación · Triunfo', i: 'Dispersión · Fuerzas opuestas' },
    corto: { d: 'El avance está en marcha; sostenlo.', i: 'Demasiados frentes a la vez.' },
    lectura: {
      d: 'Hay movimiento y dirección: lo que se puso en marcha avanza por su propio impulso. La carta anuncia un logro alcanzado por voluntad más que por suerte, y advierte que el mérito estará en sostener el rumbo cuando aparezca el cansancio.',
      i: 'La energía se dispersa en direcciones que se contradicen entre sí. Avanzas, pero sin ganar terreno. La carta pide elegir una sola dirección y aceptar que eso implica soltar las demás, al menos por ahora.',
    },
  },
  {
    n: 8, slug: 'la-fuerza', nombre: 'La Fuerza', emoji: '🦁',
    clave: { d: 'Templanza · Coraje · Dominio', i: 'Impaciencia · Agotamiento' },
    corto: { d: 'La calma resuelve lo que la fuerza no.', i: 'La paciencia está llegando a su límite.' },
    lectura: {
      d: 'La situación se resuelve por firmeza serena, no por confrontación. Esta carta habla de una fuerza que no necesita alzar la voz: la de quien domina su propia reacción. Lo que se enfrenta con calma pierde poder sobre ti.',
      i: 'La contención sostenida durante demasiado tiempo se está agotando. Puede aparecer como irritación, cansancio o reacciones desproporcionadas ante lo pequeño. No es debilidad: es una señal de que algo lleva demasiado tiempo aguantándose.',
    },
  },
  {
    n: 9, slug: 'el-ermitano', nombre: 'El Ermitaño', emoji: '🕯️',
    clave: { d: 'Introspección · Búsqueda · Guía interior', i: 'Aislamiento · Rechazo a la ayuda' },
    corto: { d: 'Necesitas retirarte para ver con claridad.', i: 'La soledad se volvió refugio.' },
    lectura: {
      d: 'Este es un momento de repliegue, no de acción. La carta sugiere apartarse del ruido para escuchar con claridad lo que la prisa no deja oír. Las respuestas que buscas no vendrán de afuera, sino del tiempo que te concedas a solas.',
      i: 'El retiro dejó de ser reflexión para volverse distancia. Puede que estés rechazando el acompañamiento de quienes podrían ayudarte, o prolongando un aislamiento que ya cumplió su función. Volver no anula lo aprendido.',
    },
  },
  {
    n: 10, slug: 'la-rueda', nombre: 'La Rueda de la Fortuna', emoji: '🎡',
    clave: { d: 'Ciclos · Cambio · Destino', i: 'Resistencia · Racha adversa' },
    corto: { d: 'El ciclo gira a tu favor.', i: 'Una etapa difícil, pero pasajera.' },
    lectura: {
      d: 'Algo se mueve por fuera de tu control y lo hace en tu dirección. La carta habla de oportunidad y de tiempo oportuno: lo que no funcionó antes puede funcionar ahora, no porque hayas cambiado, sino porque el momento sí.',
      i: 'Atraviesas una fase descendente del ciclo. La carta no anuncia permanencia, sino tránsito: lo que hoy pesa responde a un momento, no a una condición. Resistirse al giro solo alarga la vuelta.',
    },
  },
  {
    n: 11, slug: 'la-justicia', nombre: 'La Justicia', emoji: '⚖️',
    clave: { d: 'Equilibrio · Verdad · Consecuencia', i: 'Injusticia · Evasión' },
    corto: { d: 'Cada acción encuentra su correspondencia.', i: 'Algo está fuera de balance.' },
    lectura: {
      d: 'Lo que se puso en movimiento está por dar su resultado, y será proporcional a lo que se hizo. La carta pide honestidad en la evaluación: reconocer la parte propia en lo ocurrido es lo que permite que el equilibrio se restablezca.',
      i: 'Hay un desequilibrio que no se ha nombrado. Puede ser una situación injusta que toleras o una responsabilidad que no has asumido. Mientras la balanza no se mire de frente, seguirá inclinada.',
    },
  },
  {
    n: 12, slug: 'el-colgado', nombre: 'El Colgado', emoji: '🙃',
    clave: { d: 'Pausa · Perspectiva · Entrega', i: 'Estancamiento · Sacrificio inútil' },
    corto: { d: 'Cambiar la mirada resuelve más que actuar.', i: 'La espera dejó de ser útil.' },
    lectura: {
      d: 'La salida no está en avanzar sino en detenerse y observar desde otro ángulo. Esta carta habla de una pausa que parece pérdida de tiempo y no lo es: lo que hoy se suspende está reorganizándose. Ver distinto precede a hacer distinto.',
      i: 'La pausa se prolongó más allá de su propósito y se volvió inmovilidad. Puede que estés esperando una señal que no llegará, o sosteniendo una renuncia que ya nadie te pide. El momento de moverse es ahora.',
    },
  },
  {
    n: 13, slug: 'la-muerte', nombre: 'La Muerte', emoji: '🦋',
    clave: { d: 'Fin · Transformación · Renacer', i: 'Resistencia al cambio' },
    corto: { d: 'Un ciclo termina para que otro empiece.', i: 'Te aferras a algo que ya concluyó.' },
    lectura: {
      d: 'Esta carta no anuncia pérdida sino transformación. Algo llega a su fin —una etapa, un vínculo, una forma de verte— y ese cierre es la condición para lo que viene. El duelo es parte del proceso, no un error en él.',
      i: 'Hay algo que terminó y sigues sosteniendo. La resistencia no evita el cambio, solo alarga el tránsito y lo vuelve más costoso. Soltar, aquí, no es renunciar: es reconocer lo que ya ocurrió.',
    },
  },
  {
    n: 14, slug: 'la-balanza', nombre: 'La Balanza', emoji: '🍵',
    clave: { d: 'Equilibrio · Paciencia · Medida', i: 'Excesos · Impaciencia' },
    corto: { d: 'Vas al ritmo correcto.', i: 'Oscilas entre extremos.' },
    lectura: {
      d: 'La situación avanza a la velocidad que necesita, aunque no sea la que quisieras. Esta carta habla de mezcla y de medida: combinar lo opuesto sin forzarlo, sostener el proceso sin acelerarlo. La constancia rinde más que el arrebato.',
      i: 'Hay un movimiento pendular entre polos opuestos: demasiado y luego nada, entrega total y luego retirada. La carta sugiere buscar el punto medio, que no es tibieza sino sostenibilidad.',
    },
  },
  {
    n: 15, slug: 'el-diablo', nombre: 'El Diablo', emoji: '😈',
    clave: { d: 'Ataduras · Deseo · Dependencia', i: 'Liberación · Ruptura' },
    corto: { d: 'Algo te retiene más de lo que admites.', i: 'Estás soltando una atadura.' },
    lectura: {
      d: 'Existe un vínculo, un hábito o un patrón que ejerce más influencia sobre ti de la que reconoces. La carta no juzga el deseo, señala la dependencia: lo que se elige libremente no ata. Mirarlo de frente es el primer movimiento.',
      i: 'La atadura se está aflojando. Aquello que durante un tiempo tuvo poder sobre ti va perdiendo fuerza, y con ello aparece un espacio que antes no existía. El proceso puede resultar incómodo; suele serlo.',
    },
  },
  {
    n: 16, slug: 'la-torre', nombre: 'La Torre', emoji: '⚡',
    clave: { d: 'Ruptura · Revelación · Cambio brusco', i: 'Crisis evitada · Cambio postergado' },
    corto: { d: 'Cae lo que no tenía base firme.', i: 'Postergas un derrumbe inevitable.' },
    lectura: {
      d: 'Un cambio repentino desarma algo que parecía estable. La carta es incómoda pero honesta: lo que se derrumba estaba construido sobre bases que no sostenían. Después del golpe queda terreno despejado, y eso también es una forma de alivio.',
      i: 'Percibes que algo debe cambiar y sigues sosteniéndolo. La carta advierte que el desmoronamiento no se evita, solo se aplaza, y que lo aplazado suele caer con más fuerza. Anticiparse permite elegir cómo.',
    },
  },
  {
    n: 17, slug: 'la-estrella', nombre: 'La Estrella', emoji: '⭐',
    clave: { d: 'Esperanza · Serenidad · Renovación', i: 'Desánimo · Fe perdida' },
    corto: { d: 'Después de la tormenta, calma.', i: 'La confianza necesita reconstruirse.' },
    lectura: {
      d: 'Llega un periodo de serenidad tras una etapa exigente. La carta habla de una esperanza que no es ingenua sino ganada: se ha atravesado algo difícil y queda la calma. Es buen momento para proyectar a largo plazo.',
      i: 'La confianza se ha desgastado y cuesta sostener la perspectiva. No indica que el camino esté cerrado, sino que el desánimo nubla lo que sigue disponible. La fe, aquí, se recupera de a poco y con hechos pequeños.',
    },
  },
  {
    n: 18, slug: 'la-luna', nombre: 'La Luna', emoji: '🌕',
    clave: { d: 'Confusión · Ilusión · Inconsciente', i: 'Claridad · Verdad revelada' },
    corto: { d: 'No todo es lo que aparenta.', i: 'La confusión empieza a disiparse.' },
    lectura: {
      d: 'El panorama no está claro y las conclusiones apresuradas serían un error. La carta advierte sobre proyecciones, miedos y datos incompletos: lo que crees ver puede estar teñido por lo que temes. Conviene esperar a que se despeje.',
      i: 'La niebla se disipa y aparece lo que estaba oculto. Aquello que generaba inquietud empieza a mostrar su forma real, que suele ser más manejable que la imaginada. Es momento de decidir con información.',
    },
  },
  {
    n: 19, slug: 'el-sol', nombre: 'El Sol', emoji: '☀️',
    clave: { d: 'Claridad · Éxito · Vitalidad', i: 'Optimismo nublado · Retraso' },
    corto: { d: 'Todo se aclara y se vuelve favorable.', i: 'La buena noticia se demora, no se cancela.' },
    lectura: {
      d: 'Una de las cartas más favorables del mazo. Habla de claridad, reconocimiento y bienestar genuino: lo que estaba en duda se confirma y lo que costaba empieza a fluir. Es un buen momento para mostrarse sin reservas.',
      i: 'La energía positiva está presente pero parcialmente bloqueada. Puede tratarse de una demora, de un reconocimiento que tarda o de una alegría que cuesta permitirse. La carta no niega el resultado; ajusta el plazo.',
    },
  },
  {
    n: 20, slug: 'el-juicio', nombre: 'El Juicio', emoji: '📯',
    clave: { d: 'Renacimiento · Balance · Llamado', i: 'Autocrítica · Oportunidad ignorada' },
    corto: { d: 'Una segunda oportunidad se presenta.', i: 'Te juzgas con excesiva dureza.' },
    lectura: {
      d: 'Aparece la posibilidad de retomar algo con una comprensión distinta de la que tenías. La carta habla de un llamado que reconoces al escucharlo, y de un balance del pasado que no busca culpables sino aprendizaje.',
      i: 'La evaluación que haces de ti mismo es más severa que justa. Ese rigor, lejos de impulsarte, está impidiendo que tomes la oportunidad que tienes delante. La carta pide mirar los hechos sin la condena.',
    },
  },
  {
    n: 21, slug: 'el-mundo', nombre: 'El Mundo', emoji: '🌍',
    clave: { d: 'Culminación · Plenitud · Logro', i: 'Cierre pendiente · Falta poco' },
    corto: { d: 'Un ciclo se cierra con éxito.', i: 'Falta un último paso.' },
    lectura: {
      d: 'Un proceso llega a su culminación. La carta señala integración: lo aprendido a lo largo del camino se consolida y da paso a un ciclo nuevo. Es un momento para reconocer lo recorrido antes de mirar hacia lo siguiente.',
      i: 'El cierre está cerca pero incompleto. Queda un cabo suelto, una conversación pendiente o un último esfuerzo que se posterga. La carta anticipa el logro y advierte que aún no conviene darlo por hecho.',
    },
  },
];

// La carta del dia sale de un hash del usuario y la fecha: asi le toca la
// misma toda la jornada por mucho que repita el comando, pero cambia
// cada dia y es distinta para cada quien.
function cartaDelDia(userId) {
  const hoy = new Date().toISOString().slice(0, 10);
  const hash = crypto.createHash('sha256').update(userId + hoy).digest();
  return {
    carta: CARTAS[hash[0] % CARTAS.length],
    invertida: (hash[1] % 100) < 30, // 30% de salir del reves
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

const { TEXTOS, APERTURAS, TONO_CONJUNTO, PUENTES, CIERRES } = require('./tarotTextos');
const { VARIANTES } = require('./tarotVariantes');

const alAzar = arr => arr[crypto.randomInt(arr.length)];

const apertura = () => alAzar(APERTURAS);

// La redaccion base vive en CARTAS y las alternativas en VARIANTES: se
// juntan para que la misma carta no se lea siempre con las mismas palabras.
function lecturaDe({ carta, invertida }) {
  const p = invertida ? 'i' : 'd';
  return alAzar([carta.lectura[p], ...(VARIANTES[carta.slug]?.lectura[p] || [])]);
}

function sintesisDe({ carta, invertida }) {
  const p = invertida ? 'i' : 'd';
  return alAzar([carta.corto[p], ...(VARIANTES[carta.slug]?.sintesis[p] || [])]);
}

// Consejo de la carta, distinto cada vez que sale
function consejoDe({ carta, invertida }) {
  const t = TEXTOS[carta.slug];
  if (!t) return null;
  return alAzar(t.consejo[invertida ? 'i' : 'd']);
}

const ejeDe = ({ carta, invertida }) =>
  TEXTOS[carta.slug]?.eje[invertida ? 'i' : 'd'] || null;

// Redacta la lectura de las tres cartas como un solo mensaje, encadenando
// el eje de cada una en su posicion y ajustando el tono al numero de
// cartas invertidas.
function lecturaConjunta(sacadas) {
  const invertidas = sacadas.filter(s => s.invertida).length;
  const ejes = sacadas.map(ejeDe);

  const partes = [alAzar(TONO_CONJUNTO[invertidas])];

  if (ejes.every(Boolean)) {
    partes.push(alAzar(PUENTES).replace(/\{(\d)\}/g, (_, i) => ejes[i]));
  }

  const tono = invertidas === 0 ? 'favorable' : invertidas >= 2 ? 'exigente' : 'mixto';
  partes.push(alAzar(CIERRES[tono]));

  return partes.join('\n\n');
}

module.exports = {
  CARTAS, cartaDelDia, cartaAlAzar, tirada,
  consejoDe, lecturaDe, sintesisDe, lecturaConjunta, apertura,
};
