import { activity, emoji, fill, match, mcq, multi, sequence, sort, yesno } from '../builders';
import type { Unit } from '../types';

export const unit08: Unit = {
  id: 8,
  slug: 'mixture',
  title: 'Mixture',
  theme: 'Material Science',
  intro: 'A mixture has two or more materials mixed together. In this unit you will separate mixtures and find out which materials dissolve in water.',
  objectives: [
    'Describe methods to separate a mixture.',
    'Explain why a method is used.',
    'Identify materials that dissolve and do not dissolve in water.',
    'Summarise how to make materials dissolve more quickly.',
  ],
  notes: [
    { heading: 'Hand-picking', emoji: '🤏', body: 'Used to separate big pieces, like muruku and nuts.' },
    { heading: 'Sieving', emoji: '🥣', body: 'Used to separate fine materials from big ones, like flour and raisins.' },
    { heading: 'Magnet', emoji: '🧲', body: 'Used to pull out things a magnet attracts, like paper clips from sand.' },
    { heading: 'Floatation', emoji: '🪵', body: 'Used to separate things that float from things that sink, like wood pieces and sand in water.' },
    { heading: 'Filtration', emoji: '☕', body: 'Used to separate solid bits from a liquid, using filter paper.' },
    { heading: 'Dissolving', emoji: '🥄', body: 'Sugar and salt dissolve in water. Sand and rice do not. Materials dissolve faster in hot water, when stirred, and when they are small.' },
  ],
  standards: ['8.1.1', '8.1.2', '8.1.3', '8.1.4', '8.1.5'],
  activities: [
    activity(8, 1, {
      title: 'Mix and Separate',
      skill: 'Identify methods',
      instructions: 'Choose the best way to separate each mixture.',
      standards: ['8.1.1', '8.1.3'],
    }, [
      mcq('How can you separate muruku and nuts?', ['🤏 hand-picking', '🧲 magnet', '☕ filtration'], 0,
        'Muruku and nuts are big and have different shapes, so we can pick them out by hand.', { visual: emoji('🥜') }),
      mcq('How can you separate paper clips from sand?', ['🥣 sieving', '🧲 using a magnet', '🤏 tasting'], 1,
        'A magnet attracts the metal paper clips and pulls them out of the sand.', { visual: emoji('📎') }),
      yesno('Sugar dissolves in water.', true, 'Yes! When we stir sugar in water, it dissolves and we cannot see it anymore.', { visual: emoji('🍬') }),
      yesno('Sand dissolves in water.', false, 'Sand does not dissolve. We can still see it at the bottom of the glass.', { visual: emoji('🏖️') }),
      match('Match each mixture to the best way to separate it.', [
        ['flour and raisins', '🥣 sieving'], ['sand and wood pieces', '🪵 floatation'], ['tea leaves and tea', '☕ filtration'],
      ], 'Use a sieve for flour and raisins, floatation for wood in sand and filtration for tea leaves.'),
      mcq('Which material dissolves in water?', ['🧂 salt', '🍚 rice', '🫘 green beans'], 0,
        'Salt dissolves in water. Rice and green beans do not.'),
    ]),

    activity(8, 2, {
      title: 'Dissolve Detectives',
      skill: 'Classify and compare',
      instructions: 'Sort the materials and complete the sentences.',
      standards: ['8.1.1', '8.1.3', '8.1.4'],
    }, [
      sort('Sort these materials.', {
        'Dissolve in water': ['🍬 sugar', '🧂 salt', '☕ instant coffee powder'],
        'Do not dissolve in water': ['🏖️ sand', '🍚 rice', '🌽 corn kernels'],
      }, 'Sugar, salt and instant coffee dissolve. Sand, rice and corn kernels do not.'),
      fill('Complete the sentence.', 'Sugar dissolves more quickly in ___ water than in ___ water.', ['hot', 'cold'], ['salty', 'dirty'],
        'Hot water makes sugar dissolve more quickly.'),
      mcq('Which dissolves more quickly in water?', ['fine sugar', 'a sugar cube'], 0,
        'Small-sized materials dissolve more quickly than big ones.'),
      fill('Complete the sentence.', 'Materials dissolve more quickly when they are ___.', ['stirred'], ['frozen', 'left alone'],
        'Stirring helps materials dissolve more quickly.'),
      match('Match the method to what it separates.', [
        ['🥣 sieving', 'fine and large materials'],
        ['🧲 magnet', 'materials attracted by a magnet'],
        ['☕ filtration', 'solids from liquids'],
      ], 'Each method works because of a property of the materials, like size, magnetism, or being solid in a liquid.'),
      sequence('Put the steps of filtering a mixture of sand and water in order.', [
        'Fold the filter paper and place it in the funnel',
        'Place the funnel over a container',
        'Pour the mixture into the funnel',
        'Sand stays on the paper; clear water drips through',
      ], 'Prepare the filter, pour the mixture slowly, and the solid stays behind while the liquid passes through.'),
    ]),

    activity(8, 3, {
      title: 'Mixture Problem Solvers',
      skill: 'Solve problems and give reasons',
      instructions: 'Think about each problem. Choose the best plan.',
      standards: ['8.1.2', '8.1.4', '8.1.5'],
    }, [
      mcq('Kanang\'s old aquarium has sand and pieces of rotten wood. What is the best way to separate them?', [
        'Add water and stir; the wood floats and can be removed', 'Use a magnet', 'Dissolve the sand in hot water',
      ], 0, 'Wood floats in water but sand sinks. This is the floatation method.', { visual: emoji('🐠') }),
      mcq('Mother wants her tea sweet quickly. Which plan works BEST?', [
        'Use hot tea, fine sugar and stir', 'Use cold tea, sugar cubes and do not stir', 'Use cold tea and add ice',
      ], 0, 'Hot water, small sugar grains and stirring all make sugar dissolve faster.', { visual: emoji('🍵') }),
      mcq('A mixture has salt and sand. Which plan separates them?', [
        'Add water and stir, filter out the sand, then let the water dry to get the salt back', 'Use a magnet', 'Pick the salt grains by hand',
      ], 0, 'Salt dissolves but sand does not. Filtering removes the sand. When the water dries, the salt is left behind.'),
      mcq('Why do we use a sieve, not a magnet, to separate flour and raisins?', [
        'A magnet does not attract flour or raisins, but a sieve separates them by size', 'A sieve is heavier', 'Raisins are made of metal',
      ], 0, 'Neither flour nor raisins are attracted by magnets. They have different sizes, so a sieve works.'),
      mcq('Iron filings are mixed with beach sand. What is the FASTEST way to separate them?', [
        'Use a magnet', 'Dissolve the sand in water', 'Pick out each tiny filing by hand',
      ], 0, 'A magnet attracts iron, so it pulls the filings out quickly. Sand does not dissolve, and hand-picking tiny filings takes far too long.', { visual: emoji('🧲') }),
    ]),

    activity(8, 4, {
      title: 'Unit 8 Assessment',
      skill: 'Show what you know',
      instructions: 'Answer all the questions. Do your best!',
      standards: ['8.1.1', '8.1.3', '8.1.4'],
    }, [
      match('Name a suitable method to separate each mixture.', [
        ['paper clips and staples (big pieces)', 'hand-picking'],
        ['iron powder and beach sand', 'magnet'],
        ['corks and sand', 'floatation'],
        ['green beans and flour', 'sieving'],
      ], 'Hand-pick large items, use a magnet for iron, floatation for corks and a sieve for beans and flour.'),
      multi('Which materials dissolve in water? Choose ALL correct answers.', ['🍬 sugar', '🏖️ sand', '🧂 salt', '🪨 stone'], [0, 2],
        'Sugar and salt dissolve. Sand and stone do not.'),
      multi('How can we make sugar dissolve more quickly? Choose ALL correct answers.', [
        'use hot water', 'stir the water', 'use smaller sugar grains', 'put the water in the fridge',
      ], [0, 1, 2], 'Hot water, stirring and small grains all make materials dissolve faster.'),
      mcq('Which method separates solid materials from a liquid?', ['filtration', 'hand-picking', 'magnet'], 0,
        'Filtration uses filter paper to separate solids from liquids.'),
      yesno('A mixture has two or more materials mixed together.', true, 'Yes! A mixture contains two or more materials.'),
      mcq('Which statement is TRUE?', ['Rice dissolves in water', 'Salt dissolves in water', 'Sand dissolves in water'], 1,
        'Salt dissolves in water. Rice and sand do not.'),
    ]),
  ],
};
