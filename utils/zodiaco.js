// Signos del zodiaco y la lectura de una fecha de nacimiento.
//
//   desde/hasta : [mes, dia] del tramo del signo. Capricornio cruza el fin de
//                 año, por eso el rango se comprueba por extremos y no como un
//                 intervalo continuo.
//   retrato     : el signo descrito en dos o tres lineas
//   luz/sombra  : lo que el signo aporta y lo que le cuesta
const SIGNOS = [
  {
    nombre: 'Aries', emoji: '♈', slug: 'aries',
    desde: [3, 21], hasta: [4, 19],
    elemento: 'Fuego', emojiElemento: '🔥', regente: 'Marte',
    lema: 'Primero se lanza, después se pregunta.',
    retrato: 'Aries empieza cosas. Donde otros calculan el riesgo, él ya cruzó y está mirando atrás para ver quién lo sigue. Su fuerza no está en sostener, está en arrancar: nada se mueve hasta que alguien da el primer paso, y ese alguien suele ser él.',
    luz: 'Iniciativa, franqueza, coraje para lo que nadie quiere estrenar.',
    sombra: 'Impaciencia, y la costumbre de confundir la prisa con la valentía.',
  },
  {
    nombre: 'Tauro', emoji: '♉', slug: 'tauro',
    desde: [4, 20], hasta: [5, 20],
    elemento: 'Tierra', emojiElemento: '🌱', regente: 'Venus',
    lema: 'Lo que vale la pena no se apura.',
    retrato: 'Tauro construye despacio y para quedarse. Le interesa lo que se puede tocar: lo estable, lo cómodo, lo que no hay que explicar dos veces. Tarda en moverse, pero cuando decide algo, mover esa decisión cuesta más que haberla tomado.',
    luz: 'Constancia, lealtad, y un sentido del disfrute que no pide permiso.',
    sombra: 'Terquedad, y el apego a lo conocido aunque ya no sirva.',
  },
  {
    nombre: 'Géminis', emoji: '♊', slug: 'geminis',
    desde: [5, 21], hasta: [6, 20],
    elemento: 'Aire', emojiElemento: '💨', regente: 'Mercurio',
    lema: 'Todo es más interesante si se puede contar.',
    retrato: 'Géminis vive de la curiosidad. Pregunta, conecta, traduce: entiende rápido y explica mejor. Su problema no es la falta de interés, es el exceso — empieza cinco cosas porque las cinco le parecieron buenas al mismo tiempo.',
    luz: 'Ingenio, adaptabilidad, la capacidad de hablar con cualquiera.',
    sombra: 'Dispersión, y decir que sí antes de mirar la agenda.',
  },
  {
    nombre: 'Cáncer', emoji: '♋', slug: 'cancer',
    desde: [6, 21], hasta: [7, 22],
    elemento: 'Agua', emojiElemento: '🌊', regente: 'la Luna',
    lema: 'Cuidar también es una forma de estar presente.',
    retrato: 'Cáncer se acuerda de todo: de la fecha, del detalle, de lo que dijiste de pasada hace meses. Protege a los suyos con una intensidad que no siempre anuncia, y se repliega cuando se siente expuesto. Su memoria es su don y su condena.',
    luz: 'Empatía, memoria afectiva, una lealtad que no se negocia.',
    sombra: 'Susceptibilidad, y guardar lo que dolió en vez de decirlo.',
  },
  {
    nombre: 'Leo', emoji: '♌', slug: 'leo',
    desde: [7, 23], hasta: [8, 22],
    elemento: 'Fuego', emojiElemento: '🔥', regente: 'el Sol',
    lema: 'Si va a hacerse, que se note.',
    retrato: 'Leo ocupa el espacio sin pedirlo y normalmente le sienta bien. Es generoso de verdad, no por cálculo, y defiende a los suyos en voz alta. Necesita que le reconozcan lo que hace, y ese es a la vez su motor y su punto débil.',
    luz: 'Generosidad, calidez, y el valor de sostener la mirada.',
    sombra: 'Orgullo, y medir su valor por los aplausos que recibe.',
  },
  {
    nombre: 'Virgo', emoji: '♍', slug: 'virgo',
    desde: [8, 23], hasta: [9, 22],
    elemento: 'Tierra', emojiElemento: '🌱', regente: 'Mercurio',
    lema: 'El detalle no es un adorno, es el trabajo.',
    retrato: 'Virgo ve lo que falta. Ordena, revisa, corrige, y suele ser quien arregla en silencio lo que otros dieron por terminado. Su exigencia con los demás es alta; la que se aplica a sí mismo casi siempre lo es más.',
    luz: 'Precisión, servicio, una fiabilidad que se da por sentada.',
    sombra: 'Autocrítica sin freno, y confundir cuidar con corregir.',
  },
  {
    nombre: 'Libra', emoji: '♎', slug: 'libra',
    desde: [9, 23], hasta: [10, 22],
    elemento: 'Aire', emojiElemento: '💨', regente: 'Venus',
    lema: 'Casi todo se resuelve mirándolo desde el otro lado.',
    retrato: 'Libra busca el punto donde nadie sale perdiendo. Sabe mediar, suavizar y leer el ambiente antes de entrar. Pero tanto equilibrio tiene precio: a veces posterga lo propio por no romper la calma que él mismo sostiene.',
    luz: 'Diplomacia, sentido de la justicia, don de gentes.',
    sombra: 'Indecisión, y evitar el conflicto hasta que se vuelve grande.',
  },
  {
    nombre: 'Escorpio', emoji: '♏', slug: 'escorpio',
    desde: [10, 23], hasta: [11, 21],
    elemento: 'Agua', emojiElemento: '🌊', regente: 'Plutón',
    lema: 'O del todo, o mejor no.',
    retrato: 'Escorpio no hace las cosas a medias. Percibe lo que no se dice, incomoda sin proponérselo y aguanta lo que otros no querrían ni mirar. Da confianza despacio, y cuando la da, va entera.',
    luz: 'Intensidad, lucidez, una lealtad a prueba de casi todo.',
    sombra: 'Desconfianza, y tardar demasiado en soltar lo que ya pasó.',
  },
  {
    nombre: 'Sagitario', emoji: '♐', slug: 'sagitario',
    desde: [11, 22], hasta: [12, 21],
    elemento: 'Fuego', emojiElemento: '🔥', regente: 'Júpiter',
    lema: 'El mundo es grande y queda tiempo.',
    retrato: 'Sagitario necesita horizonte. Le mueve aprender, viajar, discutir ideas grandes y decir lo que piensa sin envolverlo. Su optimismo es real, no ingenuo: apuesta porque cree que la apuesta vale.',
    luz: 'Honestidad, entusiasmo, una libertad que contagia.',
    sombra: 'Falta de tacto, y prometer más de lo que la agenda aguanta.',
  },
  {
    nombre: 'Capricornio', emoji: '♑', slug: 'capricornio',
    desde: [12, 22], hasta: [1, 19],
    elemento: 'Tierra', emojiElemento: '🌱', regente: 'Saturno',
    lema: 'La cima se sube un paso por vez.',
    retrato: 'Capricornio juega a largo plazo. Se fija una meta lejana y avanza hacia ella sin necesidad de que nadie le aplauda por el camino. Parece frío y rara vez lo es: lo que ocurre es que no confunde sentir con mostrarlo.',
    luz: 'Disciplina, responsabilidad, y una paciencia que rinde.',
    sombra: 'Dureza consigo mismo, y medirlo todo por lo que produce.',
  },
  {
    nombre: 'Acuario', emoji: '♒', slug: 'acuario',
    desde: [1, 20], hasta: [2, 18],
    elemento: 'Aire', emojiElemento: '💨', regente: 'Urano',
    lema: 'Que siempre se haya hecho así no es un argumento.',
    retrato: 'Acuario piensa por su cuenta. Cuestiona lo que todos aceptan, se le ocurren salidas que a nadie se le habían ocurrido y defiende causas que aún no son populares. Cercano en grupo y reservado en lo íntimo.',
    luz: 'Originalidad, independencia, un sentido genuino de lo colectivo.',
    sombra: 'Distancia emocional, y llevar la contraria por costumbre.',
  },
  {
    nombre: 'Piscis', emoji: '♓', slug: 'piscis',
    desde: [2, 19], hasta: [3, 20],
    elemento: 'Agua', emojiElemento: '🌊', regente: 'Neptuno',
    lema: 'Se entiende antes de poder explicarlo.',
    retrato: 'Piscis capta el estado de ánimo de una sala al entrar. Es imaginativo, compasivo y se le da bien acompañar sin arreglar. El límite es su asignatura pendiente: absorbe lo ajeno hasta confundirlo con lo propio.',
    luz: 'Sensibilidad, creatividad, una comprensión que no juzga.',
    sombra: 'Escapismo, y decir que sí por no dejar a nadie mal.',
  },
];

// Como se puede llamar el archivo de imagen de cada signo, ademas de su slug
// y su nombre. El arte se sube a mano y los nombres llegan con faltas o en
// otras lenguas (Canser, aquario, picis), asi que en vez de exigir un nombre
// exacto se acepta cualquiera de estas formas.
const ARCHIVOS = {
  aries: ['aries', 'aris'],
  tauro: ['tauro', 'taurus', 'toro'],
  geminis: ['geminis', 'gemini', 'geminix'],
  cancer: ['cancer', 'canser', 'kancer', 'cangrejo'],
  leo: ['leo', 'leon'],
  virgo: ['virgo', 'virgen'],
  libra: ['libra', 'balanza'],
  escorpio: ['escorpio', 'escorpion', 'scorpio', 'escorpius'],
  sagitario: ['sagitario', 'sagitarius', 'sagittarius', 'sagitarion'],
  capricornio: ['capricornio', 'capricorn', 'capricornius'],
  acuario: ['acuario', 'aquario', 'aquarius', 'acuarius'],
  piscis: ['piscis', 'picis', 'pisis', 'pises', 'pisces'],
};

const MESES = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10,
  noviembre: 11, diciembre: 12,
};

const NOMBRE_MES = Object.entries(MESES)
  .reduce((acc, [n, m]) => { acc[m] = acc[m] || n; return acc; }, {});

const DIAS_MES = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const normalizar = t => (t || '')
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 /.-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const fechaValida = (dia, mes) =>
  Number.isInteger(dia) && Number.isInteger(mes) &&
  mes >= 1 && mes <= 12 && dia >= 1 && dia <= DIAS_MES[mes - 1];

// Capricornio cruza diciembre-enero, asi que el tramo se comprueba por cada
// extremo en vez de como un rango corrido
function signoDe(dia, mes) {
  return SIGNOS.find(s =>
    (mes === s.desde[0] && dia >= s.desde[1]) ||
    (mes === s.hasta[0] && dia <= s.hasta[1])
  ) || null;
}

// Los dos signos que toca un mes, para cuando solo se dice el mes. Primero el
// que termina dentro del mes, que es el que ocupa los dias iniciales.
const signosDelMes = mes => SIGNOS
  .filter(s => s.desde[0] === mes || s.hasta[0] === mes)
  .sort((a, b) => (b.hasta[0] === mes ? 1 : 0) - (a.hasta[0] === mes ? 1 : 0));

const buscarSigno = texto => {
  const t = normalizar(texto);
  return SIGNOS.find(s => s.slug === t || normalizar(s.nombre) === t) || null;
};

const tramoDe = s =>
  `${s.desde[1]} de ${NOMBRE_MES[s.desde[0]]} – ${s.hasta[1]} de ${NOMBRE_MES[s.hasta[0]]}`;

// Interpreta lo que se escribe tras !zodiaco. Acepta "15/3", "15 marzo",
// "15 de marzo", "marzo 15", "marzo" a secas o el nombre de un signo.
// Devuelve { tipo: 'signo' | 'mes' | 'vacio' | 'invalido' }.
function interpretar(texto) {
  const t = normalizar(texto);
  if (!t) return { tipo: 'vacio' };

  const porNombre = buscarSigno(t);
  if (porNombre) return { tipo: 'signo', signo: porNombre, fecha: null };

  const limpio = t.replace(/\bde\b/g, ' ').replace(/\s+/g, ' ').trim();

  // 15/3, 15-3, 15.3 (un año al final se ignora)
  const numerica = limpio.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-]\d{2,4})?$/);
  if (numerica) {
    const dia = Number(numerica[1]);
    const mes = Number(numerica[2]);
    return fechaValida(dia, mes)
      ? { tipo: 'signo', signo: signoDe(dia, mes), fecha: { dia, mes } }
      : { tipo: 'invalido' };
  }

  // 15 marzo / marzo 15
  const conMes = limpio.match(/^(\d{1,2}) ([a-z]+)$/) || limpio.match(/^([a-z]+) (\d{1,2})$/);
  if (conMes) {
    const dia = Number(conMes[1]) || Number(conMes[2]);
    const mes = MESES[conMes[1]] || MESES[conMes[2]];
    if (!mes) return { tipo: 'invalido' };
    return fechaValida(dia, mes)
      ? { tipo: 'signo', signo: signoDe(dia, mes), fecha: { dia, mes } }
      : { tipo: 'invalido' };
  }

  // Solo el mes: abarca dos signos, hace falta el dia
  if (MESES[limpio]) {
    const mes = MESES[limpio];
    return { tipo: 'mes', mes, signos: signosDelMes(mes) };
  }

  return { tipo: 'invalido' };
}

module.exports = {
  SIGNOS, MESES, NOMBRE_MES, ARCHIVOS,
  signoDe, signosDelMes, buscarSigno, tramoDe, fechaValida, interpretar,
};
