// Redacciones alternativas de cada carta, indexadas por slug.
//
// La interpretacion no cambia: son otras formas de decir lo mismo, para que
// quien tire varias veces no reciba siempre el texto identico. Se suman a la
// version que ya vive en tarot.js, asi que cada carta acaba con dos lecturas
// y tres sintesis por orientacion.
const VARIANTES = {
  'el-loco': {
    lectura: {
      d: ['Se abre un camino que no pediste y para el que no hay mapa. La carta habla de disponibilidad: aceptar lo que empieza sin exigirle garantías de antemano.'],
      i: ['El entusiasmo va por delante del criterio. Hay algo que quieres resolver de un salto cuando pedía un paso medido.'],
    },
    sintesis: {
      d: ['Empieza sin exigirte certezas.', 'Lo nuevo pide disponibilidad, no garantías.'],
      i: ['El entusiasmo se adelantó al criterio.', 'Falta medir antes de saltar.'],
    },
  },
  'el-mago': {
    lectura: {
      d: ['No falta talento ni ocasión: falta ponerse. La carta señala que el desnivel entre lo que puedes y lo que haces se cierra actuando, no preparándote más.'],
      i: ['Hay potencial disperso o mal empleado. Conviene revisar si el obstáculo es real o si lo estás construyendo tú.'],
    },
    sintesis: {
      d: ['El desnivel se cierra actuando.', 'La ocasión ya está; falta ponerse.'],
      i: ['El potencial existe pero se dispersa.', 'Revisa si el obstáculo es real.'],
    },
  },
  'la-sacerdotisa': {
    lectura: {
      d: ['Lo que necesitas saber no se razona, se percibe. La carta aconseja quedarse quieto el tiempo suficiente para que eso se haga audible.'],
      i: ['Hay una desconexión entre lo que sientes y lo que te dices. Mientras esa distancia siga, cualquier conclusión será prematura.'],
    },
    sintesis: {
      d: ['Quédate quieto hasta oírlo.', 'Se percibe antes de razonarse.'],
      i: ['Hay distancia entre lo que sientes y lo que te dices.', 'Cualquier conclusión sería prematura.'],
    },
  },
  'la-emperatriz': {
    lectura: {
      d: ['Algo prospera bajo tu cuidado, aunque el resultado tarde en verse. La carta pide confiar en el proceso más que en las señales inmediatas.'],
      i: ['El desgaste viene de sostener lo ajeno descuidando lo propio. Lo que no se nutre por dentro termina secándose por fuera.'],
    },
    sintesis: {
      d: ['Confía en el proceso, no en las señales.', 'Prospera aunque aún no se vea.'],
      i: ['Lo que no se nutre por dentro se seca.', 'Sostienes lo ajeno a costa de lo tuyo.'],
    },
  },
  'el-emperador': {
    lectura: {
      d: ['Lo que está disperso necesita un marco. La carta habla de decidir con criterio propio y sostener esa decisión aunque incomode a otros.'],
      i: ['La estructura se volvió jaula. Aquello que se creó para proteger ahora impide moverse.'],
    },
    sintesis: {
      d: ['Decide con criterio propio y sostenlo.', 'Lo disperso necesita un marco.'],
      i: ['La estructura se volvió jaula.', 'Lo que protegía ahora impide moverse.'],
    },
  },
  'el-sumo-sacerdote': {
    lectura: {
      d: ['El camino que enfrentas ya tiene precedentes. Apoyarse en lo aprendido por otros no resta mérito: ahorra errores evitables.'],
      i: ['Sigues una regla que dejó de describirte. La carta no pide rebelarse por rebelarse, sino revisar qué sostiene todavía y qué solo pesa.'],
    },
    sintesis: {
      d: ['Apoyarse en lo aprendido ahorra errores.', 'El camino ya tiene precedentes.'],
      i: ['Esa regla dejó de describirte.', 'Revisa qué sostiene y qué solo pesa.'],
    },
  },
  'los-enamorados': {
    lectura: {
      d: ['Hay que elegir, y la elección dice más de ti que de las opciones. La carta pide alinearse con lo que valoras aunque cueste.'],
      i: ['Algo se sostiene por costumbre o por miedo a decepcionar. La carta señala que esa desalineación acabará pesando.'],
    },
    sintesis: {
      d: ['La elección dice más de ti que las opciones.', 'Alinéate con lo que valoras.'],
      i: ['Se sostiene por costumbre o por miedo.', 'La desalineación acabará pesando.'],
    },
  },
  'el-carruaje': {
    lectura: {
      d: ['El impulso está dado y el terreno responde. La carta advierte que el riesgo no es fracasar, sino aflojar antes de llegar.'],
      i: ['Se avanza en varias direcciones que se anulan entre sí. El desgaste no viene del esfuerzo sino de la falta de foco.'],
    },
    sintesis: {
      d: ['El riesgo es aflojar antes de llegar.', 'El terreno responde: sigue.'],
      i: ['Las direcciones se anulan entre sí.', 'El desgaste viene de la falta de foco.'],
    },
  },
  'la-fuerza': {
    lectura: {
      d: ['Lo que enfrentas cede ante la constancia, no ante la fuerza. La carta señala que el dominio empieza por uno mismo.'],
      i: ['El límite de lo que puedes sostener está cerca. Ignorarlo no lo aleja: lo vuelve más brusco cuando llegue.'],
    },
    sintesis: {
      d: ['Cede ante la constancia, no la fuerza.', 'El dominio empieza por uno mismo.'],
      i: ['El límite está cerca.', 'Ignorarlo solo lo vuelve más brusco.'],
    },
  },
  'el-ermitano': {
    lectura: {
      d: ['Hay preguntas que solo se responden en soledad. La carta invita a retirarse sin sentir que eso es abandonar nada.'],
      i: ['La distancia dejó de proteger y empezó a aislar. Lo que era refugio se volvió costumbre.'],
    },
    sintesis: {
      d: ['Retirarse no es abandonar.', 'Hay preguntas que piden soledad.'],
      i: ['El refugio se volvió costumbre.', 'La distancia dejó de proteger.'],
    },
  },
  'la-rueda': {
    lectura: {
      d: ['Las condiciones cambian a tu favor sin que hayas hecho nada distinto. La carta habla de oportunidad y de saber reconocerla a tiempo.'],
      i: ['Toca la parte baja del ciclo. Nada de lo que ocurre ahora define el conjunto, aunque lo parezca desde dentro.'],
    },
    sintesis: {
      d: ['Reconoce la oportunidad a tiempo.', 'Las condiciones cambian a tu favor.'],
      i: ['Es la parte baja del ciclo.', 'Nada de esto define el conjunto.'],
    },
  },
  'la-justicia': {
    lectura: {
      d: ['El resultado será proporcional a lo hecho, no a lo deseado. La carta pide mirar los propios actos antes que las circunstancias.'],
      i: ['Hay una cuenta pendiente que nadie ha nombrado. Mientras siga sin decirse, seguirá condicionando.'],
    },
    sintesis: {
      d: ['El resultado será proporcional a lo hecho.', 'Mira tus actos antes que las circunstancias.'],
      i: ['Hay una cuenta que nadie nombra.', 'Lo no dicho sigue condicionando.'],
    },
  },
  'el-colgado': {
    lectura: {
      d: ['La salida no está donde la buscas. La carta sugiere invertir la perspectiva antes que redoblar el esfuerzo.'],
      i: ['La quietud perdió su sentido y se volvió costumbre. Lo que se aplaza demasiado deja de ser decisión.'],
    },
    sintesis: {
      d: ['Invierte la perspectiva antes que el esfuerzo.', 'La salida no está donde la buscas.'],
      i: ['La quietud perdió su sentido.', 'Lo aplazado deja de ser decisión.'],
    },
  },
  'la-muerte': {
    lectura: {
      d: ['Algo llega a su término y conviene dejarlo terminar. La carta no habla de pérdida sino de tránsito hacia otra forma.'],
      i: ['Sostienes algo que ya no responde. El desgaste no viene del cambio sino de negarlo.'],
    },
    sintesis: {
      d: ['Deja que termine lo que termina.', 'No es pérdida: es tránsito.'],
      i: ['Sostienes algo que ya no responde.', 'El desgaste viene de negar el cambio.'],
    },
  },
  'la-balanza': {
    lectura: {
      d: ['El equilibrio no se alcanza de golpe sino ajustando sobre la marcha. La carta pide paciencia con el propio ritmo.'],
      i: ['Se alterna entre exceso y abandono sin punto medio. Ese vaivén cuesta más energía que el propio asunto.'],
    },
    sintesis: {
      d: ['Se ajusta sobre la marcha.', 'Ten paciencia con tu ritmo.'],
      i: ['Alternas exceso y abandono.', 'El vaivén cuesta más que el asunto.'],
    },
  },
  'el-diablo': {
    lectura: {
      d: ['Hay un vínculo que da menos de lo que cobra. La carta no condena el deseo, señala el precio que estás pagando por él.'],
      i: ['Lo que te ataba pierde fuerza. Aparece un margen que llevaba tiempo sin existir.'],
    },
    sintesis: {
      d: ['Da menos de lo que cobra.', 'Mira el precio que estás pagando.'],
      i: ['Lo que ataba pierde fuerza.', 'Aparece un margen que no existía.'],
    },
  },
  'la-torre': {
    lectura: {
      d: ['Se cae algo que parecía firme y no lo era. Incómodo, pero honesto: lo que se sostenía mal no iba a sostenerse siempre.'],
      i: ['Ves venir el desmoronamiento y sigues apuntalando. El aplazamiento no evita el golpe, solo te quita la elección.'],
    },
    sintesis: {
      d: ['Lo que se sostenía mal no iba a durar.', 'Incómodo, pero honesto.'],
      i: ['Apuntalas lo que ya ves caer.', 'El aplazamiento te quita la elección.'],
    },
  },
  'la-estrella': {
    lectura: {
      d: ['Después de un tramo exigente llega el respiro. La carta habla de una confianza recuperada por haber atravesado, no por suerte.'],
      i: ['Cuesta sostener la perspectiva. No es que el camino se cerrara: es que el cansancio no deja verlo.'],
    },
    sintesis: {
      d: ['El respiro llega por haber atravesado.', 'La confianza se recupera.'],
      i: ['El cansancio no deja ver el camino.', 'No se cerró nada: se nubló.'],
    },
  },
  'la-luna': {
    lectura: {
      d: ['Falta información y sobra interpretación. La carta advierte que lo que temes está tiñendo lo que crees ver.'],
      i: ['Empieza a distinguirse lo real de lo imaginado. Suele ser más pequeño de lo que ocupaba en la cabeza.'],
    },
    sintesis: {
      d: ['Falta información y sobra interpretación.', 'Lo que temes tiñe lo que ves.'],
      i: ['Lo real es más pequeño de lo imaginado.', 'Ya se distingue lo que había.'],
    },
  },
  'el-sol': {
    lectura: {
      d: ['Lo que estaba en duda se confirma y lo trabado se suelta. La carta habla de un buen momento sin letra pequeña.'],
      i: ['El resultado llega, pero más tarde de lo esperado. La demora no cancela: solo cansa.'],
    },
    sintesis: {
      d: ['Un buen momento sin letra pequeña.', 'Lo dudado se confirma.'],
      i: ['La demora cansa pero no cancela.', 'Llega, aunque más tarde.'],
    },
  },
  'el-juicio': {
    lectura: {
      d: ['Puedes retomar aquello con lo que ahora entiendes. La carta habla de una revisión que no busca culpables sino conclusiones.'],
      i: ['El juicio propio se volvió sentencia. Esa dureza no corrige nada: solo paraliza.'],
    },
    sintesis: {
      d: ['Retómalo con lo que ahora entiendes.', 'Revisar no es buscar culpables.'],
      i: ['El juicio propio se volvió sentencia.', 'La dureza paraliza, no corrige.'],
    },
  },
  'el-mundo': {
    lectura: {
      d: ['Se completa algo que llevó tiempo. La carta pide detenerse a reconocerlo antes de saltar a lo siguiente.'],
      i: ['El final está a la vista pero no consumado. Dar por hecho lo que falta suele ser lo que lo retrasa.'],
    },
    sintesis: {
      d: ['Reconócelo antes de saltar a lo siguiente.', 'Se completa algo que llevó tiempo.'],
      i: ['Está a la vista, no consumado.', 'Darlo por hecho es lo que lo retrasa.'],
    },
  },
};

module.exports = { VARIANTES };
