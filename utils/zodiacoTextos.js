// Lecturas variables de !zodiaco.
//
// La ficha del signo (retrato, elemento, regente) no cambia nunca: es su
// identidad, y dos personas del mismo signo tienen que leer lo mismo. Lo que
// varia son estas dos capas:
//
//   MENSUAL : por signo, cambia al cambiar de mes e igual para todo el signo,
//             como un horoscopo de verdad. Los textos no nombran el mes, asi
//             que rotan sin quedar descolocados; el titulo pone el mes.
//   DIARIO  : por elemento, cambia cada dia y es distinto para cada persona.
//
// Las dos se eligen por hash, no al azar: el mismo dia devuelve siempre lo
// mismo, asi que repetir el comando no sirve para buscar un mensaje mejor.
const crypto = require('crypto');

const MENSUAL = {
  aries: [
    'Mes de cerrar lo que quedó abierto. Lo que empieces ahora pide terminarse, no solo arrancarse.',
    'Vas a tener más iniciativa que margen. Elige dos frentes y suelta el resto sin culpa.',
    'Alguien va a intentar marcarte el ritmo. Se puede negociar sin convertirlo en pelea.',
    'Un mes para demostrar con hechos algo que llevas tiempo defendiendo con palabras.',
    'La impaciencia va a ser tu único obstáculo real. Lo demás está de tu lado.',
    'Algo que rompiste por prisa se puede recomponer este mes, si eres tú quien habla primero.',
  ],
  tauro: [
    'Mes de consolidar, no de estrenar. Lo que ya tienes pide atención antes que lo nuevo.',
    'Algo material se ordena: un gasto, un espacio o un acuerdo que llevaba meses torcido.',
    'Te van a pedir flexibilidad justo donde menos te apetece darla. Cede en lo pequeño.',
    'Un mes lento por fuera y productivo por dentro. No lo midas por lo que se ve.',
    'Lo que disfrutas no es un lujo este mes: es lo que te va a sostener.',
    'Hay algo a lo que te agarras por costumbre y no por deseo. Este mes se distingue bien.',
  ],
  geminis: [
    'Mes de conversaciones que mueven cosas. Una de ellas te cambia un plan entero.',
    'Vas a querer abarcar todo. Lo que sobreviva al mes será lo que elijas la primera semana.',
    'Alguien necesita que traduzcas lo que otros no saben explicar. Se te va a dar bien.',
    'Mes para escribir, no solo para pensar. Lo que no apuntes se pierde.',
    'La dispersión va a disfrazarse de oportunidad. Pregúntate si de verdad te interesa.',
    'Un vínculo que tenías por casual resulta más importante de lo que creías.',
  ],
  cancer: [
    'Mes de casa, en cualquier sentido de la palabra. Lo que cuides ahora te cuidará después.',
    'Algo del pasado vuelve a llamar. Puedes abrir la puerta sin quedarte a vivir ahí.',
    'Te va a tocar ser el sostén de alguien. Mide cuánto puedes sin desaparecer tú.',
    'Mes para decir lo que llevas guardado. Guardado ya no protege a nadie.',
    'Tu memoria trabaja a favor este mes: recuerdas justo lo que hacía falta.',
    'Una retirada tuya la leyeron como enfado. Se puede aclarar con una frase.',
  ],
  leo: [
    'Mes de exposición. Lo que hagas se va a ver, así que hazlo como quieras que se vea.',
    'Vas a recibir reconocimiento por algo que no fue lo que más te costó. Acéptalo igual.',
    'Alguien va a aprovecharse de tu generosidad. No es motivo para dejar de tenerla.',
    'Mes para defender a quien no puede defenderse solo. Te sale natural.',
    'El orgullo va a estorbarte en una sola conversación: justo en la que importa.',
    'Algo que dabas por perdido reaparece porque alguien se acordó de ti.',
  ],
  virgo: [
    'Mes de arreglar lo que otros dieron por terminado. Se va a notar, aunque no lo digas.',
    'Vas a ver todos los fallos menos uno: el de exigirte de más.',
    'Algo que llevabas revisando eternamente ya está listo. Suéltalo.',
    'Mes para pedir ayuda concreta. La vas a recibir si la nombras.',
    'Corregir a alguien no es lo mismo que cuidarlo. Este mes se distingue bien.',
    'Un orden pequeño va a desbloquear algo grande que llevaba meses trabado.',
  ],
  libra: [
    'Mes de decidir sin consultar. Vas a tener información suficiente antes de lo que crees.',
    'Sostienes un equilibrio tú solo y se está empezando a notar. Dilo antes de que pese más.',
    'Alguien necesita que medies, no que te pongas en medio. Hay diferencia.',
    'Mes bueno para lo social y lo estético: lo que organices va a salir bien.',
    'Evitar el conflicto este mes lo hace más grande, no más pequeño.',
    'Algo que postergaste por no incomodar ya no se puede postergar más.',
  ],
  escorpio: [
    'Mes de verdades. Una sale a la luz y no vas a poder mirar hacia otro lado.',
    'Vas a percibir algo antes que nadie. Tener razón no obliga a decirlo todavía.',
    'Algo que llevas tiempo sin soltar se suelta este mes, si le quitas la mano.',
    'Mes para dar confianza a alguien que se la ha ganado. Cuesta y conviene.',
    'La desconfianza te va a proteger de una cosa y a costarte otra. Elige cuál.',
    'Lo que hagas a medias este mes te va a molestar más que no haberlo hecho.',
  ],
  sagitario: [
    'Mes de horizonte: algo se abre y pide un sí antes de tenerlo todo resuelto.',
    'Tu sinceridad va a hacer falta en una conversación. Cuida la forma, no el fondo.',
    'Vas a prometer más de lo que la agenda aguanta. Revísalo antes de comprometerte.',
    'Mes para aprender algo por gusto y no por utilidad. Te va a servir igual.',
    'Alguien necesita tu optimismo, no tu diagnóstico. Basta con acompañar.',
    'Un plan lejano deja de serlo si este mes le pones la primera fecha.',
  ],
  capricornio: [
    'Mes de avance callado. No vas a tener aplausos, y tampoco te hacen falta.',
    'Algo que empezaste hace mucho da este mes su primer resultado visible.',
    'Te vas a medir por lo que produces. Este mes esa cuenta te va a quedar corta.',
    'Mes para delegar algo que sostienes solo porque nadie más lo haría igual.',
    'Tu paciencia rinde, pero hay una cosa que ya no conviene seguir esperando.',
    'Alguien te ve más frío de lo que eres. Una frase lo arregla.',
  ],
  acuario: [
    'Mes para proponer lo que nadie propone. Va a encontrar menos resistencia de la que esperas.',
    'Algo colectivo te va a necesitar. Aparecer cuenta más que tener razón.',
    'Tu distancia hace falta en un conflicto: eres el único que lo ve entero.',
    'Mes para dejar de llevar la contraria por costumbre y elegir dónde sí merece la pena.',
    'Alguien cercano quiere más presencia tuya, no más ideas.',
    'Lo que este mes parece una rareza tuya, en unos meses lo va a copiar el resto.',
  ],
  piscis: [
    'Mes sensible. Lo que captes va a ser cierto; lo que cargues, no siempre es tuyo.',
    'Algo creativo pide salir. No hace falta que sea bueno para que merezca hacerse.',
    'Vas a decir sí a algo por no dejar mal a nadie. Todavía se puede deshacer.',
    'Mes para poner un límite suave y sostenerlo. Se puede sin romper nada.',
    'Alguien te va a agradecer una compañía que tú diste por poca cosa.',
    'Lo que evitas mirar de frente se hace más pequeño en cuanto lo miras.',
  ],
};

const DIARIO = {
  Fuego: [
    'Hoy la prisa no te ayuda: lo que quieres resolver de un tirón pide dos pasos.',
    'Alguien está esperando que tomes la iniciativa, y probablemente no lo va a decir.',
    'Te va a tentar responder rápido. La versión que digas en diez minutos será mejor.',
    'Hay una conversación que evitas por no discutir. Hoy saldría bien.',
    'Lo que hoy te parece un desprecio es, casi seguro, alguien ocupado en lo suyo.',
    'Te sienta bien que te vean, pero hoy rinde más escuchar primero.',
    'Vas a querer empezar algo nuevo antes de cerrar lo de ayer. Cierra primero.',
    'Tu energía hoy convence sin argumentar. Gástala en algo que lo merezca.',
    'Si algo se está estancando, mueve tú la primera pieza. Nadie más lo va a hacer.',
    'Hoy alguien va a poner a prueba tu paciencia. No es contra ti.',
    'Lo que digas de pasada se va a quedar grabado más de lo que crees.',
    'Un plan aplazado vuelve a estar a tiro. Esta vez ponle fecha.',
    'No te midas con nadie hoy: la comparación te va a salir injusta.',
    'Hay entusiasmo disponible, pero no para todo. Elige una cosa.',
    'Hoy defiendes mejor a otro que a ti mismo. Recuerda que también cuentas.',
    'Algo que arrancaste sin pensar está saliendo bien. Cuídalo.',
    'Si hoy te callas algo, mañana va a pesar el doble.',
    'El día pide decidir, no consultar. Ya sabes lo que necesitas saber.',
  ],
  Tierra: [
    'Lo que hoy construyas despacio va a aguantar. No lo aceleres.',
    'Hay algo material pendiente —un pago, un trámite, una llamada— que hoy se resuelve fácil.',
    'Tu cuerpo lleva días avisándote de algo. Hoy hazle caso.',
    'No todo lo que se demora está fallando. Algo solo necesita más tiempo.',
    'Hoy alguien te va a pedir que cambies de plan. Escucha antes de negarte.',
    'Lo que ya funciona no necesita que lo mejores hoy. Déjalo estar.',
    'Un gasto que parecía necesario resulta que no lo era. Todavía puedes frenarlo.',
    'Te vas a exigir más de lo que la jornada permite. Ajusta la lista.',
    'Hay comodidad en lo de siempre, pero hoy lo de siempre te está costando.',
    'Alguien valora un trabajo tuyo que diste por invisible, y hoy lo dice.',
    'Hoy conviene terminar antes que empezar. Mira qué quedó a medias.',
    'Lo que decidas hoy con calma no habrá que rehacerlo. Tómate el rato.',
    'Un cambio pequeño en la rutina rinde más que un plan grande.',
    'Estás sosteniendo algo que ya no te toca sostener.',
    'Hoy el orden te va a devolver tiempo, no quitártelo.',
    'Alguien necesita de ti algo concreto, no un consejo. Pregunta qué.',
    'Te cuesta soltar una idea que ya no encaja. Hoy es buen día para revisarla.',
    'Lo estable no es aburrido: hoy es exactamente lo que hace falta.',
  ],
  Aire: [
    'Hoy tienes las palabras. Elige bien con quién las gastas.',
    'Una conversación pendiente se va a dar sola si te dejas encontrar.',
    'Empezar cinco cosas hoy es no terminar ninguna. Quédate con dos.',
    'Alguien te va a pedir opinión de verdad, no por cortesía. Dásela.',
    'Hoy entiendes rápido algo que a otros les cuesta. Ten paciencia con ellos.',
    'Un mensaje sin responder pesa más que responderlo.',
    'Lo que hoy te parece curiosidad, en un mes será un proyecto. Anótalo.',
    'Te conviene decir menos y preguntar más.',
    'Hay una idea rondándote desde hace semanas. Hoy sí se puede escribir.',
    'No todo desacuerdo hay que resolverlo hoy. Algunos se deshacen solos.',
    'Hoy te van a malinterpretar por hablar rápido. Repítelo despacio.',
    'Alguien del grupo se está quedando fuera, y tú lo notas antes que nadie.',
    'Te distrae algo que no es importante. Ya sabes cuál.',
    'Hoy puedes conectar a dos personas que se necesitaban. Hazlo.',
    'Piensa en voz alta con alguien: la respuesta aparece a mitad de frase.',
    'Lo que decidiste por evitar el conflicto hoy se puede revisar.',
    'Hay un plan que suena bien en tu cabeza y no en un papel. Escríbelo.',
    'Hoy la distancia no te protege de nada. Acércate.',
  ],
  Agua: [
    'Hoy captas el ánimo de los demás antes de que hablen. No lo confundas con el tuyo.',
    'Algo que guardaste sin decir lleva tiempo ocupando espacio. Hoy cabe decirlo.',
    'Alguien necesita compañía, no soluciones. Con quedarte basta.',
    'Hoy te van a pedir más de lo que puedes dar. Se puede decir que no.',
    'Una intuición tuya de hace días resulta que iba bien encaminada.',
    'Lo que hoy te dolió probablemente no iba dirigido a ti.',
    'Te conviene poner un límite antes de que se convierta en reproche.',
    'Hay alguien a quien llevas tiempo queriendo escribir. Hoy es buen día.',
    'Hoy recuerdas algo con más nitidez de la que hace falta. Déjalo pasar.',
    'No tienes que arreglar lo que sientes. Basta con nombrarlo.',
    'Alguien te confía algo que no ha contado a nadie. Cuídalo.',
    'Hoy la sensibilidad es información, no debilidad.',
    'Estás absorbiendo un problema ajeno como si fuera tuyo.',
    'Un gesto pequeño tuyo va a significar mucho más de lo que calcules.',
    'Hoy te apetece desaparecer un rato. Hazlo, pero avisa.',
    'Lo que perdonaste a medias vuelve hoy. Termina de hacerlo, o dilo.',
    'Hay una decisión que ya tomaste por dentro y no te atreves a decir en voz alta.',
    'Hoy cuidar de ti no le quita nada a nadie.',
  ],
};

const mcd = (a, b) => (b ? mcd(b, a % b) : a);

// Un paso que recorra la lista entera sin repetir tiene que ser coprimo con su
// longitud. Se busca a partir de la semilla para que cada clave lleve su propio
// orden y no todos vean la misma secuencia.
function paso(n, semilla) {
  for (let i = 0; i < n; i++) {
    const c = 1 + ((semilla + i) % Math.max(1, n - 1));
    if (mcd(c, n) === 1) return c;
  }
  return 1;
}

// En vez de sortear el texto por hash, se avanza por una permutacion: el hash
// de la clave fija donde empieza cada uno y con que paso avanza, y el periodo
// (el dia o el mes) dice cuanto se ha avanzado. Asi sigue siendo determinista
// —repetir el comando no cambia nada— pero nadie ve el mismo mensaje dos veces
// hasta haber pasado por todos.
function elegir(lista, clave, periodo) {
  const hash = crypto.createHash('sha256').update(clave).digest();
  const inicio = hash[0] % lista.length;
  return lista[(inicio + periodo * paso(lista.length, hash[1])) % lista.length];
}

// Numero de dia y de mes absolutos, para que el avance no se reinicie cada año
const numeroDeDia = hoy => Math.floor(Date.UTC(
  hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()) / 86_400_000);
const numeroDeMes = hoy => hoy.getUTCFullYear() * 12 + hoy.getUTCMonth();

// Igual para todo el signo, cambia al cambiar de mes
function lecturaDelMes(signo, hoy = new Date()) {
  const textos = MENSUAL[signo.slug];
  return textos ? elegir(textos, signo.slug, numeroDeMes(hoy)) : null;
}

// Distinta para cada persona, cambia cada dia
function lecturaDelDia(signo, userId, hoy = new Date()) {
  const textos = DIARIO[signo.elemento];
  return textos ? elegir(textos, `${userId}|${signo.slug}`, numeroDeDia(hoy)) : null;
}

module.exports = { MENSUAL, DIARIO, lecturaDelMes, lecturaDelDia };
