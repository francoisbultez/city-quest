import type { Lesson } from '../types'

/**
 * Lessons for Madrid · The Sol Route.
 * Built from the sources listed on each lesson; where sources disagreed
 * (e.g. who sculpted the bear) the detail was left out.
 * DRAFT: check every fact on the ground before launch.
 */

const WIKI = (path: string, name = 'Wikipedia') => ({ name, url: `https://en.wikipedia.org/wiki/${path}` })

export const lessons: Record<string, Lesson> = {
  km0: {
    title: 'Kilómetro Cero',
    subtitle: 'The point every main road in Spain is measured from',
    recap: 'Where Spain’s main roads are measured from',
    numbers: [
      { value: '0 km', label: 'where it all starts' },
      { value: '6', label: 'national roads begin here' },
      { value: '12', label: 'grapes at New Year' },
    ],
    story: [
      { lead: 'A gate to the sun.', text: 'The Puerta del Sol was once one of the gates of Madrid’s town walls. Its name means “Gate of the Sun”.' },
      { lead: 'Why measure from here?', text: 'In the 18th century Spain built its six national roads out from Madrid, starting where the royal mail riders set off: right on this square.' },
      { lead: 'Spain’s New Year clock.', text: 'The building behind the plaque was the Royal Post Office. Every New Year’s Eve, Spain watches its clock on TV and eats one grape at each of the 12 chimes.' },
    ],
    timeline: [
      { year: '1700s', text: 'Spain’s six national roads are built out from Madrid' },
      { year: '1962', text: 'The New Year chimes are first broadcast on national TV' },
      { year: '1998', text: 'The old post office becomes the seat of Madrid’s regional government' },
    ],
    context: {
      title: 'A country shaped like a wheel',
      text: 'Spain’s main road network is radial: like the spokes of a wheel, the big national roads run from Madrid out to the coasts and borders. That is why distances on road signs all over Spain count from this plaque.',
    },
    lookCloser: [
      { title: 'The plaque.', text: 'Read the words around the “0”. It sits in the pavement in front of the old post office door.' },
      { title: 'The clock tower.', text: 'Look up: this is the clock all of Spain counts down with on New Year’s Eve.' },
    ],
    words: [
      { es: 'puerta', en: 'door, gate' },
      { es: 'sol', en: 'sun' },
      { es: 'reloj', en: 'clock' },
      { es: 'uvas', en: 'grapes' },
    ],
    think: 'Why would a country measure all its roads from its capital, and not from its biggest port or its geographic centre?',
    check: { question: 'What do people in Spain eat at the 12 New Year chimes?', options: ['Grapes', 'Olives', 'Churros'], answer: 'Grapes' },
    sources: [WIKI('Puerta_del_Sol'), { name: 'IFEMA: history of Kilómetro Cero', url: 'https://www.ifema.es/visita-madrid/historia/kilometro-cero-madrid-historia' }],
  },

  bear: {
    title: 'El Oso y el Madroño',
    subtitle: 'Madrid’s coat of arms, cast in bronze',
    recap: 'Madrid’s symbol, on this square since 1967',
    numbers: [
      { value: '1967', label: 'unveiled' },
      { value: '4 m', label: 'tall, stone and bronze' },
      { value: '2', label: 'symbols: a bear and a tree' },
    ],
    story: [
      { lead: 'A city’s badge.', text: 'A bear reaching into a strawberry tree has stood for Madrid on its coat of arms for centuries.' },
      { lead: 'From badge to statue.', text: 'This statue turned the coat of arms into something you can meet beside. It was unveiled in 1967 on the east side of the square, between Calle de Alcalá and Carrera de San Jerónimo.' },
      { lead: 'Still the meeting point.', text: 'It has been moved several times as the square was redesigned, but people in Madrid still say “quedamos en el oso”: meet you at the bear.' },
    ],
    timeline: [
      { year: '1967', text: 'The statue is unveiled in the Puerta del Sol' },
      { year: 'Since', text: 'Moved several times as the square is remodelled' },
    ],
    context: {
      title: 'What is a coat of arms?',
      text: 'Cities, like noble families, used a coat of arms as their badge. Madrid’s shows the bear and the madroño under a crown, with seven stars around them.',
    },
    lookCloser: [
      { title: 'The fruit.', text: 'Look for the small round berries on the tree. Madroño fruit is red when ripe.' },
      { title: 'The crowd.', text: 'Count how many people are waiting for someone here right now.' },
    ],
    words: [
      { es: 'oso', en: 'bear' },
      { es: 'madroño', en: 'strawberry tree' },
      { es: 'escudo', en: 'coat of arms' },
      { es: 'quedar', en: 'to meet up' },
    ],
    think: 'If your town had a coat of arms, which animal or plant would you put on it, and why?',
    check: { question: 'When was the statue unveiled?', options: ['1867', '1967', '2007'], answer: '1967' },
    sources: [
      WIKI('Statue_of_the_Bear_and_the_Strawberry_Tree'),
      { name: 'Madrid City Council', url: 'https://diario.madrid.es/blog/notas-de-prensa/la-estatua-del-oso-y-el-madrono-trasladada-a-su-nueva-ubicacion-en-la-puerta-del-sol/' },
    ],
  },

  'plaza-mayor': {
    title: 'Plaza Mayor',
    subtitle: 'The great square of Habsburg Madrid, and the city’s stage for 400 years',
    recap: 'Finished in 1619 · 10 entrances',
    numbers: [
      { value: '1619', label: 'finished' },
      { value: '10', label: 'entrances' },
      { value: '1848', label: 'statue arrives' },
    ],
    story: [
      { lead: 'Before the square,', text: 'this was the Plaza del Arrabal: an open market just outside the old town walls.' },
      { lead: 'Then Madrid became the capital.', text: 'King Felipe II moved his court here in 1561 and the town grew fast. It needed a grand main square, and his son Felipe III had the architect Juan Gómez de Mora finish it in 1619.' },
      { lead: 'A stage for the city.', text: 'Markets, bullfights, royal celebrations and even the public trials of the Inquisition took place here. Fire swept through the square several times, and each time it was rebuilt.' },
    ],
    timeline: [
      { year: '1561', text: 'Felipe II makes Madrid the capital of Spain' },
      { year: '1616', text: 'The bronze statue of Felipe III is cast' },
      { year: '1619', text: 'Juan Gómez de Mora finishes the square' },
      { year: '1631', text: 'The first great fire; the square is rebuilt' },
      { year: '1848', text: 'The statue is moved here from the Casa de Campo' },
    ],
    context: {
      title: 'Madrid de los Austrias',
      text: 'The Habsburgs, called “los Austrias” in Spain, ruled from 1516 to 1700. The old streets around this square, from Sol to the palace, still carry their name. Most of today’s route is in their Madrid.',
    },
    lookCloser: [
      { title: 'The bronze king.', text: 'Cast in 1616 by Giambologna and Pietro Tacca. It stood in the Casa de Campo park until 1848.' },
      { title: 'The painted façade.', text: 'The Casa de la Panadería is named after the bakery that once stood on its site.' },
      { title: 'The ten arches.', text: 'Can you find the one with steep steps? That’s where you’re heading next.' },
    ],
    words: [
      { es: 'plaza mayor', en: 'main square' },
      { es: 'panadería', en: 'bakery' },
      { es: 'arco', en: 'arch' },
      { es: 'los Austrias', en: 'the Habsburgs' },
    ],
    think: 'Why would a king want a huge, closed square right in the middle of his new capital?',
    check: { question: 'In which year did Madrid become the capital?', options: ['1492', '1561', '1619'], answer: '1561' },
    sources: [
      { name: 'esMadrid (official Madrid tourism)', url: 'https://www.esmadrid.com/informacion-turistica/plaza-mayor' },
      { name: 'Culture Trip', url: 'https://theculturetrip.com/europe/spain/articles/a-brief-history-of-the-plaza-mayor' },
      { name: 'Fascinating Spain', url: 'https://www.fascinatingspain.com/articulo/what-to-see-in-madrid/madrids-plaza-mayor-400-years-of-history/20200831080616066893.html' },
    ],
  },

  cuchilleros: {
    title: 'Arco de Cuchilleros',
    subtitle: 'The steep way down to old Madrid’s taverns',
    recap: 'Steps down to Botín, open since 1725',
    numbers: [
      { value: '1 of 10', label: 'entrances to the square' },
      { value: '1725', label: 'Botín opens below' },
      { value: '#1', label: 'oldest restaurant (Guinness)' },
    ],
    story: [
      { lead: 'A square on a slope.', text: 'The Plaza Mayor sits higher than the streets below it, so this corner exit is a steep stairway through an arch.' },
      { lead: 'Named after knives.', text: 'The arch takes its name from the street below, Calle de Cuchilleros, the street of the cutlers: the knife makers.' },
      { lead: 'Dinner since 1725.', text: 'At the bottom is Botín, founded in 1725 and listed by Guinness World Records as the oldest restaurant in the world. Ernest Hemingway set the final scene of The Sun Also Rises there.' },
    ],
    timeline: [
      { year: '1725', text: 'Botín opens at the foot of the steps' },
      { year: '1926', text: 'Hemingway’s The Sun Also Rises is published' },
    ],
    context: {
      title: 'Streets named after trades',
      text: 'Old Madrid named many streets after the craftspeople who worked there. Keep an eye out on the route for other trade names, like Calle de Bordadores, the street of the embroiderers.',
    },
    lookCloser: [
      { title: 'The steps.', text: 'Count them on your way down. How steep is the slope from the square?' },
      { title: 'Botín’s sign.', text: 'Find the restaurant at the bottom and the year on its front.' },
    ],
    words: [
      { es: 'cuchillo', en: 'knife' },
      { es: 'cuchillero', en: 'cutler, knife maker' },
      { es: 'escalera', en: 'stairs' },
      { es: 'mesón', en: 'old tavern' },
    ],
    think: 'Why do you think the oldest taverns grew up right next to the main square?',
    check: { question: 'Which writer set a famous scene at Botín?', options: ['Hemingway', 'Cervantes', 'Shakespeare'], answer: 'Hemingway' },
    sources: [
      { name: 'esMadrid: century-old restaurants', url: 'https://w3.esmadrid.com/sites/default/files/mapa_restaurantescentenarios_madrid.pdf' },
      { name: 'Vozpópuli', url: 'https://www.vozpopuli.com/gastropoli/asi-es-el-restaurante-mas-antiguo-del-mundo-segun-el-libro-guinness-de-los-records-esta-en-madrid-lleva-abierto-desde-1725-y-dio-de-comer-a-ernest-hemingway.html' },
      { name: 'Mirador Madrid', url: 'https://www.miradormadrid.com/?p=2149' },
    ],
  },

  'san-miguel': {
    title: 'Mercado de San Miguel',
    subtitle: 'An iron market hall from 1916, reborn as a food hall',
    recap: 'Iron market hall, opened in 1916',
    numbers: [
      { value: '1916', label: 'opened' },
      { value: '2009', label: 'reopened' },
      { value: 'Paris', label: 'inspired its design' },
    ],
    story: [
      { lead: 'Named after a church.', text: 'The market takes its name from the church of San Miguel that once stood on this spot.' },
      { lead: 'Iron and light.', text: 'Architect Alfonso Dubé y Díez gave it an iron frame inspired by Les Halles in Paris. It opened on 13 May 1916.' },
      { lead: 'A second life.', text: 'After years of decline it was restored and reopened in 2009 as a gourmet food market, one of the first of its kind in Spain.' },
    ],
    timeline: [
      { year: '1913', text: 'Work on the iron market begins' },
      { year: '1916', text: 'The market opens on 13 May' },
      { year: '2009', text: 'It reopens as a gourmet food market' },
    ],
    context: {
      title: 'The age of iron',
      text: 'Around 1900, iron and glass let architects build big, bright spaces quickly. Train stations, greenhouses and market halls like this one went up all over Europe.',
    },
    lookCloser: [
      { title: 'The iron columns.', text: 'Look up and follow how they carry the roof.' },
      { title: 'The glass walls.', text: 'They were fitted around the original iron frame in the restoration.' },
    ],
    words: [
      { es: 'mercado', en: 'market' },
      { es: 'hierro', en: 'iron' },
      { es: 'cristal', en: 'glass' },
      { es: 'puesto', en: 'stall' },
    ],
    think: 'When an old local market becomes a place for visitors, who gains and who loses?',
    check: { question: 'Which city’s market inspired its design?', options: ['Paris', 'London', 'Rome'], answer: 'Paris' },
    sources: [
      WIKI('Market_of_San_Miguel'),
      { name: 'MIT Libraries (Dome)', url: 'https://dome.mit.edu/handle/1721.3/152313?show=full' },
      { name: 'Vozpópuli', url: 'https://www.vozpopuli.com/altavoz/cultura/el-mercado-de-san-miguel-de-punto-de-encuentro-local-a-icono-global-del-turismo-gastronomico.html' },
    ],
  },

  'plaza-villa': {
    title: 'Plaza de la Villa',
    subtitle: 'Where Madrid was governed for centuries',
    recap: 'Madrid’s town hall square until 2007',
    numbers: [
      { value: '1400s', label: 'oldest tower' },
      { value: '1891', label: 'admiral’s statue' },
      { value: '2007', label: 'council moves out' },
    ],
    story: [
      { lead: 'Three centuries in one square.', text: 'Around you stand the Torre de los Lujanes from the 15th century, the Casa de Cisneros from 1537, and the Casa de la Villa, Madrid’s old town hall.' },
      { lead: 'The city’s office.', text: 'The town hall was designed by Juan Gómez de Mora, the architect of the Plaza Mayor, and begun in the 1640s. Madrid’s city council met here until 2007.' },
      { lead: 'The admiral.', text: 'In the middle stands Álvaro de Bazán, a commander of the 16th-century Spanish navy who fought at the battle of Lepanto in 1571. Mariano Benlliure’s bronze was unveiled in 1891.' },
    ],
    timeline: [
      { year: '1400s', text: 'The Torre de los Lujanes is built' },
      { year: '1537', text: 'The Casa de Cisneros is built' },
      { year: '1640s', text: 'Work begins on the town hall' },
      { year: '1891', text: 'The statue of Álvaro de Bazán is unveiled' },
      { year: '2007', text: 'The city council moves out' },
    ],
    context: {
      title: 'Three styles, side by side',
      text: 'The tower is Mudéjar: Christian building with Islamic-style brickwork. The Casa de Cisneros is Plateresque, carved as finely as silverwork. The town hall is Baroque. Spot the difference as you turn around.',
    },
    lookCloser: [
      { title: 'The covered bridge.', text: 'An arch links the town hall to the Casa de Cisneros next door.' },
      { title: 'The admiral’s armour.', text: 'He is shown in half armour. Look at the details on his chest plate.' },
    ],
    words: [
      { es: 'villa', en: 'town' },
      { es: 'ayuntamiento', en: 'town hall, council' },
      { es: 'torre', en: 'tower' },
      { es: 'almirante', en: 'admiral' },
    ],
    think: 'Why might a city move its town hall out of its oldest square?',
    check: { question: 'Until when did the city council meet here?', options: ['1891', '1975', '2007'], answer: '2007' },
    sources: [
      WIKI('Plaza_de_la_Villa'),
      { name: 'A View on Cities', url: 'https://aviewoncities.com/madrid/plaza-de-la-villa' },
      { name: 'Mirador Madrid', url: 'https://www.miradormadrid.com/?p=1902' },
    ],
  },

  palacio: {
    title: 'Royal Palace',
    subtitle: 'A palace built on the ashes of a fortress',
    recap: 'Begun in 1738 after the Alcázar burned',
    numbers: [
      { value: '1734', label: 'the old Alcázar burns' },
      { value: '1738', label: 'first stone' },
      { value: '~3,000', label: 'rooms' },
    ],
    story: [
      { lead: 'A fortress first.', text: 'Madrid began here as a Muslim fortress on the hill above the river Manzanares. It later became the royal Alcázar.' },
      { lead: 'The Christmas Eve fire.', text: 'On Christmas Eve 1734 the Alcázar caught fire and burned for days. King Felipe V ordered a new palace of stone and brick. Filippo Juvarra designed it; after his death Giovanni Battista Sacchetti adapted the plan, and the first stone was laid in 1738.' },
      { lead: 'Still the royal palace.', text: 'With around 3,000 rooms it is the official residence of the King of Spain, used today for state ceremonies. Across the square, the Almudena Cathedral was consecrated in 1993 by Pope John Paul II.' },
    ],
    timeline: [
      { year: '800s', text: 'A Muslim fortress is built on this hill' },
      { year: '1734', text: 'The Alcázar burns on Christmas Eve' },
      { year: '1738', text: 'The first stone of the new palace is laid' },
      { year: '1993', text: 'The Almudena Cathedral is consecrated' },
    ],
    context: {
      title: 'Madrid’s Muslim beginnings',
      text: 'Madrid started as Mayrit, a fortress built in the 9th century by the emirs of Córdoba to watch over this hill. The Alcázar and then the palace grew on the same spot.',
    },
    lookCloser: [
      { title: 'The view west.', text: 'Walk to the railings: the hill drops towards the river and the Casa de Campo park.' },
      { title: 'Palace vs cathedral.', text: 'Stand between them. The palace took about 25 years to build; the cathedral more than a century.' },
    ],
    words: [
      { es: 'palacio', en: 'palace' },
      { es: 'catedral', en: 'cathedral' },
      { es: 'incendio', en: 'fire' },
      { es: 'Nochebuena', en: 'Christmas Eve' },
    ],
    think: 'Why build the new palace exactly where the old one burned, instead of somewhere new?',
    check: { question: 'When did the old Alcázar burn?', options: ['1734', '1808', '1936'], answer: '1734' },
    sources: [WIKI('Royal_Palace_of_Madrid'), { name: 'Patrimonio Nacional', url: 'https://www.patrimonionacional.es/en/visita/royal-palace-madrid' }],
  },

  debod: {
    title: 'Templo de Debod',
    subtitle: 'A 2,200-year-old Egyptian temple in a Madrid park',
    recap: '2,000+ years old, rebuilt here in 1972',
    numbers: [
      { value: '2nd c. BC', label: 'built in Egypt' },
      { value: '1968', label: 'given to Spain' },
      { value: '1972', label: 'opened here' },
    ],
    story: [
      { lead: 'Born on the Nile.', text: 'The temple was built in the 2nd century BC near Aswan, in Nubia in southern Egypt, and dedicated to the gods Amun and Isis.' },
      { lead: 'Saved from the water.', text: 'When the Aswan High Dam was built in the 1960s, the rising Nile threatened Nubia’s temples. Spain helped save them, including Abu Simbel, and in 1968 Egypt gave Debod to Spain as thanks.' },
      { lead: 'A new home.', text: 'It was shipped in pieces and rebuilt here, on the site of the old Cuartel de la Montaña barracks, and opened in 1972. Today it is one of the best places in Madrid to watch the sunset.' },
    ],
    timeline: [
      { year: '100s BC', text: 'The temple is built near Aswan' },
      { year: '1960s', text: 'The Aswan High Dam threatens Nubia’s temples' },
      { year: '1968', text: 'Egypt gives the temple to Spain' },
      { year: '1972', text: 'It opens to the public in Madrid' },
    ],
    context: {
      title: 'Saving the Nubian monuments',
      text: 'In the 1960s UNESCO led an international campaign to move Nubia’s temples before the waters rose. Several countries that helped received a temple as thanks: New York, Leiden and Turin each have one too.',
    },
    lookCloser: [
      { title: 'The gateways.', text: 'Walk through the two stone gateways that stand in front of the temple.' },
      { title: 'The carvings.', text: 'Look for hieroglyphs on the stone, more than 2,000 years old.' },
    ],
    words: [
      { es: 'templo', en: 'temple' },
      { es: 'regalo', en: 'gift' },
      { es: 'atardecer', en: 'sunset' },
      { es: 'Egipto', en: 'Egypt' },
    ],
    think: 'Is it better to move a monument far away to save it, or to leave it where it was built?',
    check: {
      question: 'Why did Egypt give Spain this temple?',
      options: ['To thank Spain for helping save Nubian temples', 'In exchange for a painting', 'To celebrate a royal wedding'],
      answer: 'To thank Spain for helping save Nubian temples',
    },
    sources: [
      { name: 'esMadrid', url: 'https://w3.esmadrid.com/en/node/2923' },
      { name: 'Atlas Obscura', url: 'https://atlasobscura.com/places/templo-de-debod' },
      { name: 'Archaeology Travel', url: 'https://archaeology-travel.com/spain/ancient-egyptian-temple-debod-madrid/' },
    ],
  },
}
