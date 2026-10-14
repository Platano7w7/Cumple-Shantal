// ── Regalo 2: Los viernes ───────────────────────────────────────────────────
// Notas y recuerdos de los viernes compartidos.

export interface FridayNote { emoji: string; title: string; text: string; sign?: string }

export const FRIDAY_OPENING =
  'Los viernes eran sagrados. Nuestro pequeño refugio de la semana.'

export const FRIDAY_NOTES: FridayNote[] = [
  {
    title: 'El plan perfecto',
    text: 'Solo vernos y ponernos al día. Era simple, pero era exactamente lo que esperaba despues de toda una semana.',
  },
  {
    title: 'Conversaciones que no terminaban',
    text: 'Hablamos de como te fue en la semana, que clases tuviste, como te fue en los examenes, si viste a tu querido 23 que ahora es 24, pero no importar que siempre habia conversaciones ',
    sign: '— y ojala anunca acabe las conversaciones',
  },
  {
    title: 'El tiempo compartido',
    text: 'Muchas risas, algo de tiempo juntos, todo eso es lo necesario para ya ser feliz un viernes por la tarde en ese hueco hasta las 8 y espero que de igual manera haber podido ayudarte a distraerte un poco por lo menos de todo el estres que siempre cargas',
  },
  {
    title: 'Verte cumplir tus sueños',
    text: 'Cada viernes me contabas tus anecdotas con tus pacientes. Me gusta verte esforzarte mucho es como algun tipo de admiracion que te tengo, puesto que eres la primera persona que de verdad veo que le gusta estudiar y le gusta lo que hace, por mas que no encuentres pacientes estoy seguro que seras la mejor odontologa.',
  },
  {
    title: 'Una buena costumbre',
    text: 'Sin darme cuenta, cada viernes que iba a acompañarte lo hacia cada vez mas seguido con ganas y ahora con sam(esto lo agrege recien esta semana jijiji), nose si sera ya costumbre pero la verdad me gusta esa costumbre que cree y agradecido de que de tan poco tiempo que tienes dediques en conversar un rato con tu causita',
  },
]

export const FRIDAY_CLOSING =
  'Cada viernes cada alegria amistad. Gracias por esos viernes. ✨'