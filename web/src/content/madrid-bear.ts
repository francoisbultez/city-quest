import type { Hunt } from '../types'

/**
 * Pilot hunt for Madrid.
 * Every node is a DRAFT until someone checks it on the ground
 * (coordinates, geofence radius, and that the answer is visible on site).
 */
export const madridBear: Hunt = {
  id: 'madrid-bear',
  city: 'Madrid',
  title: "The Cartographer's Last Map",
  tagline: 'Sol → Plaza Mayor → Palacio Real → Templo de Debod',
  intro:
    'In 1790 a royal mapmaker named Inés Valcárcel was accused of hiding a map of a secret route under the city. ' +
    'She was never found, but she left clues in plain sight, things you only notice if you stand where she stood. ' +
    'Her first note says: "Every road in Spain begins at my feet."',
  outro:
    "The last clue points west, to the sunset behind the Templo de Debod. Inés's route was never a tunnel. " +
    "It was this walk: the heart of the city from kilometre zero to its most famous sunset. You've just retraced it. Stay for the light.",
  nodes: [
    {
      id: 'km0',
      title: 'Where every road begins',
      place: { name: 'Kilómetro Cero, Puerta del Sol', lat: 40.41669, lng: -3.70358, radiusM: 50 },
      minutes: 8,
      priority: 1,
      stepFree: true,
      lead: '"Every road in Spain begins at my feet." Go to the Puerta del Sol and find the plaque set into the pavement in front of the old Royal Post Office, the building with the clock.',
      question: {
        kind: 'text',
        prompt: 'What distance is marked on the plaque? (just the number)',
        answers: ['0', 'cero', 'zero', 'km 0', 'kilometro cero', 'kilometro 0'],
      },
      hint: 'It is the starting point for measuring distances on Spain’s main roads.',
      reveal: 'Kilómetro Cero is the point Spain’s main radial roads are measured from. Inés’s next note: "Find the beast that eats from the tree."',
      verification: { status: 'draft' },
    },
    {
      id: 'bear',
      title: 'The beast and the tree',
      place: { name: 'El Oso y el Madroño, Puerta del Sol', lat: 40.417, lng: -3.7021, radiusM: 50 },
      minutes: 6,
      priority: 1,
      stepFree: true,
      lead: '"Find the beast that eats from the tree." Look for the bronze statue on the Puerta del Sol that every Madrileño uses as a meeting point.',
      question: {
        kind: 'choice',
        prompt: 'The bear is reaching into a tree. Which tree is it?',
        options: ['An olive tree', 'A strawberry tree (madroño)', 'An orange tree', 'A fig tree'],
        answer: 'A strawberry tree (madroño)',
      },
      hint: 'The tree’s Spanish name is part of the statue’s name.',
      reveal: 'The bear and the madroño are on Madrid’s coat of arms. Next note: "A king on horseback guards the great square."',
      verification: { status: 'draft' },
    },
    {
      id: 'plaza-mayor',
      title: 'The king on horseback',
      place: { name: 'Plaza Mayor', lat: 40.41553, lng: -3.70742, radiusM: 50 },
      minutes: 10,
      priority: 1,
      stepFree: true,
      lead: '"A king on horseback guards the great square." Walk to the Plaza Mayor and go to its centre.',
      question: {
        kind: 'choice',
        prompt: 'Read the base of the statue. Who is the king on the horse?',
        options: ['Felipe II', 'Felipe III', 'Carlos III', 'Fernando VII'],
        answer: 'Felipe III',
      },
      hint: 'He was the son of the king who made Madrid the capital.',
      reveal: 'Felipe III, the king in whose reign the Plaza Mayor was built. Next note: "Go down the knife-makers’ steps."',
      verification: { status: 'draft' },
    },
    {
      id: 'cuchilleros',
      title: "The knife-makers' steps",
      place: { name: 'Arco de Cuchilleros', lat: 40.41461, lng: -3.7077, radiusM: 35 },
      minutes: 5,
      priority: 3,
      stepFree: false,
      lead: '"Go down the knife-makers’ steps." Leave the Plaza Mayor through its south-west corner and take the steep stairway under the arch.',
      question: {
        kind: 'choice',
        prompt: 'The arch is named after the trade of the street below. Who worked here?',
        options: ['Cutlers (knife makers)', 'Bakers', 'Shoemakers', 'Silversmiths'],
        answer: 'Cutlers (knife makers)',
      },
      hint: 'Cuchillo means knife in Spanish.',
      reveal: '“Cuchilleros” were cutlers. Next note: "Where the city once bought its fish and fruit, under a roof of iron."',
      verification: { status: 'draft' },
    },
    {
      id: 'san-miguel',
      title: 'Under a roof of iron',
      place: { name: 'Mercado de San Miguel', lat: 40.41543, lng: -3.70895, radiusM: 50 },
      minutes: 10,
      priority: 2,
      stepFree: true,
      lead: '"Where the city once bought its fish and fruit, under a roof of iron." Find the market just west of the Plaza Mayor.',
      question: {
        kind: 'choice',
        prompt: 'Stand outside and look at how the market is built. What holds up the glass walls?',
        options: ['Carved stone', 'An iron frame', 'Wooden beams', 'Red brick'],
        answer: 'An iron frame',
      },
      hint: 'Inés gave it away in her note.',
      reveal: 'The iron-and-glass market dates from the early 20th century. Next note: "An admiral stands where the city was governed."',
      verification: { status: 'draft' },
    },
    {
      id: 'plaza-villa',
      title: 'The admiral',
      place: { name: 'Plaza de la Villa', lat: 40.41544, lng: -3.71058, radiusM: 50 },
      minutes: 7,
      priority: 2,
      stepFree: true,
      lead: '"An admiral stands where the city was governed." Continue along Calle Mayor to the small square of the old town hall.',
      question: {
        kind: 'choice',
        prompt: 'Which admiral is honoured by the statue in the middle of the square?',
        options: ['Blas de Lezo', 'Álvaro de Bazán', 'Cosme Damián Churruca', 'Federico Gravina'],
        answer: 'Álvaro de Bazán',
      },
      hint: 'Read the name on the pedestal.',
      reveal: 'Álvaro de Bazán, a 16th-century admiral. Next note: "The king’s house looks at the queen of heaven."',
      verification: { status: 'draft' },
    },
    {
      id: 'palacio',
      title: 'The palace and the cathedral',
      place: { name: 'Plaza de la Armería, Palacio Real', lat: 40.4172, lng: -3.7143, radiusM: 90 },
      minutes: 10,
      priority: 1,
      stepFree: true,
      lead: '"The king’s house looks at the queen of heaven." Go to the big square between the Royal Palace and the church that faces it.',
      question: {
        kind: 'choice',
        prompt: 'With your back to the palace, which church do you see?',
        options: ['San Francisco el Grande', 'Almudena Cathedral', 'San Jerónimo el Real', 'San Ginés'],
        answer: 'Almudena Cathedral',
      },
      hint: 'It is Madrid’s cathedral, dedicated to the city’s patron Virgin.',
      reveal: 'The Almudena Cathedral faces the Royal Palace. Last note: "Follow the sun to the temple that crossed the sea."',
      verification: { status: 'draft' },
    },
    {
      id: 'debod',
      title: 'The temple that crossed the sea',
      place: { name: 'Templo de Debod', lat: 40.424, lng: -3.7177, radiusM: 80 },
      minutes: 12,
      priority: 1,
      stepFree: true,
      lead: '"Follow the sun to the temple that crossed the sea." Walk north through the gardens to the park on the hill.',
      question: {
        kind: 'choice',
        prompt: 'This ancient temple was a gift to Spain. Which country gave it?',
        options: ['Greece', 'Italy', 'Egypt', 'Turkey'],
        answer: 'Egypt',
      },
      hint: 'Look for hieroglyphs.',
      reveal: 'Egypt gave the Templo de Debod to Spain for helping to save the Nubian temples.',
      verification: { status: 'draft' },
    },
  ],
}

export const hunts: Hunt[] = [madridBear]
