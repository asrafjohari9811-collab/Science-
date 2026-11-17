import { activity, emoji, fill, match, mcq, multi, sequence, sort, yesno } from '../builders';
import type { Unit } from '../types';

export const unit06: Unit = {
  id: 6,
  slug: 'light-and-dark',
  title: 'Light and Dark',
  theme: 'Physical Science',
  intro: 'We need light to see and to do our activities. In this unit you will find sources of light and discover how shadows are made.',
  objectives: [
    'Identify sources of light.',
    'Compare activities in light and dark places.',
    'Explain how a shadow is formed.',
    'Compare how clear shadows are for different objects.',
    'Explain why light is important to humans.',
  ],
  notes: [
    { heading: 'Sources of light', emoji: '☀️', body: 'The sun, fire and lamps give out light. The sun is a natural source of light. Lamps and torches are made by people.' },
    { heading: 'The moon', emoji: '🌙', body: 'The moon is not a source of light. It shines because sunlight bounces off it.' },
    { heading: 'Light and dark', emoji: '🔦', body: 'It is easy to do activities in a bright place. In the dark, we need light.' },
    { heading: 'Shadows', emoji: '👤', body: 'A shadow is formed when light is blocked by an object.' },
    { heading: 'Clear or less clear', emoji: '⭐', body: 'Thick paper gives a clear shadow. Tracing paper gives a less clear shadow. A clear plastic sheet gives almost no shadow.' },
    { heading: 'Shadow play', emoji: '🎭', body: 'Wayang kulit and hand shadow play are fun shadow games.' },
  ],
  standards: ['6.1.1', '6.1.2', '6.1.3', '6.1.4', '6.1.5', '6.1.6'],
  activities: [
    activity(6, 1, {
      title: 'Find the Light',
      skill: 'Identify sources of light',
      instructions: 'Which things give out light?',
      standards: ['6.1.1', '6.1.2'],
    }, [
      multi('Which of these are sources of light? Choose ALL correct answers.', ['☀️ sun', '🔦 torch', '🕯️ candle flame', '🪨 stone'], [0, 1, 2],
        'The sun, a torch and a candle flame give out light. A stone does not.'),
      mcq('What is the main source of light during the day?', ['🌙 moon', '☀️ sun', '💡 street lamp'], 1,
        'During the day, the sun is our main source of light.'),
      yesno('A street lamp is a source of light.', true, 'Yes! A street lamp gives out light at night.', { visual: emoji('💡') }),
      yesno('It is easier to read a book in a bright room than in a dark room.', true,
        'Yes. We need light to see clearly, so reading is easier in a bright room.', { visual: emoji('📖') }),
      mcq('The lights go off at night. What can help you see?', ['🔦 a torch', '🪞 a mirror', '🧦 a sock'], 0,
        'A torch is a source of light. A mirror does not make its own light.'),
      mcq('Which source of light is natural?', ['☀️ sun', '💡 bulb', '🔦 torch'], 0,
        'The sun is a natural source of light. Bulbs and torches are made by people.'),
    ]),

    activity(6, 2, {
      title: 'Shadow Lab',
      skill: 'Classify and compare',
      instructions: 'Sort, compare and complete the sentences.',
      standards: ['6.1.1', '6.1.3', '6.1.4'],
    }, [
      sort('Sort these into sources of light and NOT sources of light.', {
        'Source of light': ['☀️ sun', '🔥 campfire', '💡 lamp'],
        'Not a source of light': ['🌙 moon', '🪞 mirror', '📕 book'],
      }, 'The sun, fire and lamps make their own light. The moon and a mirror only reflect light.'),
      fill('Complete the sentence.', 'A shadow is formed when ___ is ___ by an object.', ['light', 'blocked'], ['water', 'pushed'],
        'A shadow forms when an object blocks light.'),
      sort('How clear is the shadow of each object?', {
        'Clear shadow': ['thick paper', '📘 hardcover book', '🪵 wooden block'],
        'Less clear shadow': ['tracing paper', 'frosted glass'],
        'No shadow': ['clear plastic sheet'],
      }, 'Objects that block all light give clear shadows. Tracing paper and frosted glass let some light through. A clear plastic sheet lets almost all light through.'),
      sequence('Put the objects in order to make a shadow on the screen.', ['🔦 torch', '🦒 toy giraffe', '⬜ screen'],
        'The light comes from the torch, the toy blocks it, and the shadow appears on the screen behind the toy.'),
      mcq('Which object gives the CLEAREST shadow?', ['tracing paper', 'clear plastic sheet', 'thick cardboard'], 2,
        'Thick cardboard blocks all the light, so its shadow is the clearest.'),
      mcq('Compare: Box A has a torch inside, Box B is dark. In which box can you find the number cards faster?', ['Box A', 'Box B', 'Both are the same'], 0,
        'We can see clearly with light, so finding cards in Box A is faster.', { visual: emoji('📦') }),
    ]),

    activity(6, 3, {
      title: 'Shadow Puzzles',
      skill: 'Predict and explain',
      instructions: 'Use what you know about light to solve each puzzle.',
      standards: ['6.1.3', '6.1.4', '6.1.5', '6.1.6'],
    }, [
      mcq('Amin and Khairul shine two torches at a tree from different sides. How many shadows of the tree will form?', ['one', 'two', 'none'], 1,
        'Each torch is blocked by the tree, so each one makes a shadow. Two torches make two shadows.', { visual: emoji('🌳') }),
      mcq('In a wayang kulit show, why are the shadows of the puppets so clear?', [
        'The puppets do not let light pass through', 'The puppets are see-through', 'The screen is black',
      ], 0, 'The leather puppets block the light completely, so the shadows are clear.', { visual: emoji('🎭') }),
      mcq('You want to make a shadow puppet with a sharp, clear shadow. Which material should you choose?', ['clear plastic', 'thick card', 'tracing paper'], 1,
        'Thick card blocks all the light, giving the clearest shadow.'),
      mcq('The moon looks bright at night. Why is the moon NOT a source of light?', [
        'It does not make its own light; it reflects light from the sun', 'It is too small', 'It only comes out at night',
      ], 0, 'The moon does not give out its own light. Sunlight bounces off the moon, so it looks bright.', { visual: emoji('🌕') }),
      mcq('Why is light important to humans?', [
        'It helps us see and do our daily activities', 'It makes us hungry', 'It makes us invisible',
      ], 0, 'Light helps us see. Most of our activities, like reading and playing, need light.'),
    ]),

    activity(6, 4, {
      title: 'Unit 6 Assessment',
      skill: 'Show what you know',
      instructions: 'Answer all the questions. Do your best!',
      standards: ['6.1.1', '6.1.2', '6.1.3', '6.1.4'],
    }, [
      fill('Complete the sentence.', 'Examples of sources of light are the ___, fire and ___.', ['sun', 'lamps'], ['moon', 'mirrors'],
        'The sun, fire and lamps are sources of light.'),
      mcq('It is ___ to do activities in a dark place.', ['easy', 'difficult'], 1,
        'Without light we cannot see well, so activities in the dark are difficult.'),
      yesno('A shadow is formed when light passes through a clear glass window.', false,
        'Clear glass lets light pass through. A shadow forms when light is blocked.'),
      match('Match the object to how clear its shadow is.', [
        ['steel ruler', 'clear shadow'], ['tracing paper', 'less clear shadow'], ['clear plastic sheet', 'no shadow'],
      ], 'A steel ruler blocks all light. Tracing paper lets some through. Clear plastic lets almost all through.'),
      mcq('Which is an example of a shadow game?', ['🎭 wayang kulit', '⚽ football', '🧩 jigsaw puzzle'], 0,
        'Wayang kulit is a shadow play that uses puppets, light and a screen.'),
      mcq('Where must the object be to make a shadow on the screen?', [
        'Between the torch and the screen', 'Behind the screen', 'Behind the torch',
      ], 0, 'The object must be between the light and the screen to block the light.'),
    ]),
  ],
};
