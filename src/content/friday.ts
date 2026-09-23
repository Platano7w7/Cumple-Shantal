// ── Regalo 2: Los viernes ───────────────────────────────────────────────────
// Notas y recuerdos de los viernes compartidos.

export interface FridayNote { emoji: string; title: string; text: string; sign?: string }

export const FRIDAY_OPENING =
  'Los viernes eran sagrados. Nuestro pequeño refugio de la semana.'

export const FRIDAY_NOTES: FridayNote[] = [
  {
    emoji: '📅',
    title: 'El plan perfecto',
    text: 'Solo vernos y ponernos al día. Era simple, pero era exactamente lo que esperaba despues de toda una semana.',
  },
  {
    emoji: '💬',
    title: 'Conversaciones que no terminaban',
    text: 'Hablamos de como te fue en la semana, que clases tuviste, como te fue en los examenes, si viste a tu querido 23 que ahora es 24, pero no importar que siempre habia conversaciones ',
    sign: '— y ojala anunca acabe las conversaciones',
  },
  {
    emoji: '☕',
    title: 'El tiempo compartido',
    text: 'Muchas risas, algo de tiempo juntos, todo eso es lo necesario para ya ser feliz un viernes por la tarde en ese hueco hasta las 8 y espero que de igual manera haber podido ayudarte a distraerte un poco por lo menos de todo el estres que siempre cargas',
  },
  {
    emoji: '📚',
    title: 'Verte cumplir tus sueños',
    text: 'Cada viernes me contabas tus grandes esfuerzos. Me gusta verte esforzarte mucho es como algun tipo de admiracion, puesto que eres la primera persona que de verdad veo que le gusta estudiar y le gusta lo que hace, por mas que no encuentres pacientes estoy seguro que seras la mejor odontologa.',
  },
  {
    emoji: '🤝',
    title: 'Una buena costumbre',
    text: 'Sin darme cuenta, cada viernes que iba a acompañarte lo hacia cada vez mas seguido y con mas ganas, nose si sera ya costumbre pero la verdad me gusta esa costumbre que cree y agradecido de que de tan poco tiempo que tienes dediques en conversar un rato con tu servidor',
  },
]

export const FRIDAY_CLOSING =
  'Nada hubiera sido igual sin nuestros viernes. Gracias por ser parte de cada uno. ✨'