// ── Carta de cumpleaños (mensaje final) ────────────────────────────────────
// La carta está diseñada como bloques INDEPENDIENTES de contenido para poder
// editar cada sección sin tocar el código ni el resto del texto.
//
// Estructura de cada bloque:
//   label?       -> etiqueta opcional que se muestra como encabezado
//   paragraphs[] -> párrafos del bloque (cada uno se muestra por separado)
//   style        -> 'saludo' | 'principal' | 'gordo' | 'final' | 'despedida' | 'sign'
//
// Reemplaza el TEXTO de cada bloque (nunca lo simplifiques ni lo borres):
//   - saludo      → "Shantal:"
//   - principal   → párrafos principales de la carta
//   - gordo       → MENSaje COMPLETO de Gordo Lui (independiente)
//   - final       → mensaje final de Danilo
//   - despedida   → cierre de la carta
//   - sign        → la firma con emoji

export type LetterBlockStyle = 'saludo' | 'principal' | 'gordo' | 'final' | 'despedida' | 'sign'

export interface LetterBlock {
  label?: string
  paragraphs: string[]
  style: LetterBlockStyle
}

export const LETTER_BLOCKS: LetterBlock[] = [
  // ── Saludo ──
  {
    style: 'saludo',
    paragraphs: ['Para Shantal:'],
  },
  // ── Mensaje principal ──
  {
    style: 'principal',
    paragraphs: [
      'Hoy quería escribirte unas palabras porque es tu cumpleaños y porque siento que una amistad como la nuestra merece algo más que un simple “feliz cumpleaños”.',
      'Primero que nada, feliz cumpleaños, amistad. Espero que hoy tengas un día increíble, que recibas mucho cariño, que te consientan bastante y que puedas disfrutar cada momento.Me alegra mucho haberte conocido y que con el tiempo nuestra amistad haya podido convertirse en algo tan bonito. Hemos compartido risas, conversaciones, momentos buenos y otros no tan buenos, pero cada uno de ellos ha dejado algún recuerdo que seguramente algún día recordaremos con una sonrisa.',
      'Quiero que sepas que te aprecio muchísimo, amistad. Espero que este nuevo año de vida venga acompañado de muchas cosas buenas, nuevos sueños, experiencias increíbles y, sobre todo, mucha felicidad. Te deseo de corazón que puedas conseguir todo aquello que te propongas y que nunca te falten motivos para seguir sonriendo.',
      'Y obviamente, no podía faltar la participación de un pequeño animal, bueno de pequeño no tiene nada. Así que hoy recibiste un mensaje de alguien especial:.',
    ],
  },
  // ── Mensaje de Gordo Lui (bloque independiente: no simplificar) ──
  {
    label: '💬 Mensaje sopresa',
    style: 'gordo',
    paragraphs: [
      'Hola, amistad. Soy Gordo Lui y me informo danilo que hoy cumples años. No sé exactamente qué se sentira cumplir años ya que danilo maldito no me festeja, pero aparentemente hay comida, así que me parece una excelente idea y espero que me sobres para seguir engordando junto a mi dueño.” 😼',
      '“Quería desearte un feliz cumpleaños y decirte que eres una muy buena humana. Gracias por quererme, me dijeron que eres mi fan numero 1, jaja god. Avesces puede ser que muerda o arañe a danilo pero es por su bien lo estoy adiestrando para que se comporte bonito miau.”',
      '“Espero que tengas muchos regalos, muchos abrazos y un día muy bonito.”',
      '“Feliz cumpleaños, amistad. Te quiero mucho... pero no tanto como quiero dormir todo el día.',
      'Y recuerda, Shantal: si algún día sientes que nadie te entiende, yo probablemente tampoco te entienda, pero tendras una foto mia dormido sacada sin mi consentimiento para poder alegrarte un poco',
    ],
  },
  // ── Mensaje final de Danilo ──
  {
    style: 'final',
    paragraphs: [
      'Volviendo conmigo osea Danilo xd, amistad, espero que tengas un cumpleaños muy bonito y que este nuevo año de tu vida esté lleno de momentos que valga la pena recordar y ojala no mas traumas con tus pacientes.',
      'Gracias por ser tú, por tu forma de ser y por formar parte de mi vida social. Espero que nuestra amistad siga teniendo muchos capítulos más, muchas risas, conversaciones y momentos que podamos recordar en el futuro.',
    ],
  },
  // ── Despedida ──
  {
    style: 'despedida',
    paragraphs: [
      'Feliz cumpleaños número 21 ',
      'Con cariño, Danilo.',
    ],
  },
  {
    style: 'sign',
    paragraphs: [' 🎂❤️'],
  },
]

// ── Textos del regalo secreto (la carta colgante) ───────────────────────────
// Se muestran en el hub cuando el examen alcanza el puntaje mínimo.
export const SECRET_BANNER_TITLE = 'Has desbloqueado un regalo secreto'
export const SECRET_BANNER_SUB = 'Busca la carta colgante en el cielo de tu mundo ✨'
export const SECRET_AVAILABLE_LABEL = 'Ya se deja atrapar ✨'