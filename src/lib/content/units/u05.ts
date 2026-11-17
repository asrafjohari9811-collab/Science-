import { activity, emoji, fill, match, mcq, multi, sequence, sort, yesno } from '../builders';
import type { Unit } from '../types';

export const unit05: Unit = {
  id: 5,
  slug: 'plants',
  title: 'Plants',
  theme: 'Life Science',
  intro: 'Plants give us food, air and much more. In this unit you will learn what seeds need to germinate and how plants grow.',
  objectives: [
    'State why plants are important to humans and animals.',
    'State the basic needs for seeds to germinate.',
    'Record changes as a plant grows.',
    'Arrange the stages of plant growth.',
    'State the basic needs for a plant to grow.',
  ],
  notes: [
    { heading: 'Plants are important', emoji: '🌳', body: 'Plants give humans and animals food, air to breathe, medicine and a place to live (habitat).' },
    { heading: 'Seeds need', emoji: '🌰', body: 'Seeds need water, air and a suitable temperature to germinate.' },
    { heading: 'Plants grow', emoji: '🌱', body: 'As a plant grows, it gets more leaves, bigger leaves, a taller height and a thicker stem.' },
    { heading: 'Stages of growth', emoji: '🍅', body: 'Seed → germination of seed → young plant → produce flowers → produce fruits.' },
    { heading: 'Plants need', emoji: '☀️', body: 'Plants need water, air and sunlight to grow. Nutrients from soil or fertilizer help them stay healthy.' },
  ],
  standards: ['5.1.1', '5.1.2', '5.1.3', '5.1.4', '5.1.5', '5.1.6'],
  activities: [
    activity(5, 1, {
      title: 'Why We Need Plants',
      skill: 'Identify and match',
      instructions: 'Look at each picture and choose.',
      standards: ['5.1.1', '5.1.2'],
    }, [
      match('Match how each plant helps us.', [
        ['🍎 apple tree', 'food'], ['🌿 aloe vera', 'medicine'], ['🌳 big tree', 'habitat for birds'],
      ], 'Plants give us food, medicine and homes for animals.'),
      yesno('Plants give us air to breathe.', true, 'Yes! Plants give out oxygen, which humans and animals need to breathe.', { visual: emoji('🌲') }),
      mcq('Which of these is NOT something plants give us?', ['🥕 food', '🪨 rocks', '💊 medicine'], 1,
        'Rocks do not come from plants. Plants give us food, medicine, air and habitats.'),
      multi('What do seeds need to germinate? Choose ALL correct answers.', ['💧 water', '💨 air', '🌡️ suitable temperature', '🍬 sugar'], [0, 1, 2],
        'Seeds need water, air and a suitable temperature to germinate.', { visual: emoji('🌰') }),
      yesno('A seed kept in a dry, empty jar with no water will germinate.', false,
        'Without water, a seed cannot germinate.'),
      mcq('A cow eats grass. Why is grass important to the cow?', ['It gives the cow food', 'It gives the cow a bath', 'It makes the cow sleep'], 0,
        'Many animals depend on plants for food.', { visual: emoji('🐄') }),
    ]),

    activity(5, 2, {
      title: 'Watch It Grow',
      skill: 'Sequence and compare',
      instructions: 'Put plant stages in order and read the growth record.',
      standards: ['5.1.3', '5.1.4', '5.1.6'],
    }, [
      sequence('Arrange the growth stages of a tomato plant.', ['seed', 'germination of seed', 'young plant', '🌼 produce flowers', '🍅 produce fruits'],
        'Seed → germination → young plant → flowers → fruits.'),
      mcq('A maize plant had 2 leaves on Day 3 and 14 leaves on Day 21. What happened?', [
        'The number of leaves increased', 'The number of leaves decreased', 'The number of leaves stayed the same',
      ], 0, 'As a plant grows, the number of leaves increases.', { visual: emoji('🌽') }),
      fill('Complete the sentence.', 'As a plant grows, its ___ increases and its stem gets ___.', ['height', 'thicker'], ['colour', 'thinner'],
        'Plants grow taller and their stems become thicker.'),
      sequence('Arrange the growth stages of a coconut tree.', ['🥥 seed (coconut)', 'germination of seed', 'young plant', 'produce flowers', 'produce fruits'],
        'A coconut germinates, becomes a young plant, then produces flowers and finally fruits.'),
      sort('Sort these into what SEEDS need to germinate and what is NOT needed.', {
        'Needed': ['💧 water', '💨 air', '🌡️ suitable temperature'],
        'Not needed': ['📺 television', '🧸 toys', '🎵 music'],
      }, 'Seeds need water, air and a suitable temperature.'),
      mcq('Day 3: stem 0.3 cm around. Day 21: stem 1.0 cm around. What does this show?', [
        'The stem became thicker', 'The stem became thinner', 'The stem disappeared',
      ], 0, '1.0 cm is more than 0.3 cm, so the circumference of the stem increased.'),
    ]),

    activity(5, 3, {
      title: 'Plant Investigators',
      skill: 'Predict and conclude',
      instructions: 'Read about each experiment. What will happen?',
      standards: ['5.1.2', '5.1.5', '5.1.6'],
    }, [
      mcq('Four plants are tested. Plant A gets no water. Plant B gets water, air and sunlight. Plant C is covered by a plastic bag (no fresh air). Plant D is in a box (no sunlight). Which plant grows best?', [
        'Plant A', 'Plant B', 'Plant C', 'Plant D',
      ], 1, 'Plant B has all its basic needs: water, air and sunlight. So it grows best.'),
      mcq('Plant D was kept inside a box for two weeks. What will most likely happen?', [
        'It becomes weak and yellow because it has no sunlight', 'It grows faster than all the others', 'It produces fruits',
      ], 0, 'Plants need sunlight. Without it they become weak and may die.', { visual: emoji('📦') }),
      mcq('Ah Meng puts seeds on wet cotton inside a dark cupboard. Will they germinate?', [
        'Yes, because they have water, air and a suitable temperature', 'No, because seeds need sunlight to germinate', 'No, because cotton is not soil',
      ], 0, 'Seeds do not need sunlight or soil to germinate. They need water, air and a suitable temperature.'),
      mcq('Two plants get the same water, air and sunlight. Plant A also gets fertilizer. Which grows better?', [
        'Plant A', 'Plant B', 'They grow exactly the same',
      ], 0, 'Fertilizer gives nutrients that help plants grow and stay healthy.'),
      mcq('What may happen to animals if the plants in a forest stop producing fruits?', [
        'Animals that eat fruits may not have enough food', 'Animals will have more food', 'Nothing will change',
      ], 0, 'Many animals depend on plants for food. If plant growth is disrupted, food becomes scarce.', { visual: emoji('🐒') }),
    ]),

    activity(5, 4, {
      title: 'Unit 5 Assessment',
      skill: 'Show what you know',
      instructions: 'Answer all the questions. Do your best!',
      standards: ['5.1.1', '5.1.2', '5.1.3', '5.1.4', '5.1.5'],
    }, [
      multi('Why are plants important? Choose ALL correct answers.', ['food', 'medicine', 'air to breathe', 'plastic toys'], [0, 1, 2],
        'Plants give us food, medicine, air and habitats.'),
      fill('Complete the sentence.', 'Seeds need water, ___ and a suitable ___ to germinate.', ['air', 'temperature'], ['sunlight', 'soil'],
        'Seeds need water, air and a suitable temperature.'),
      sequence('Arrange the growth stages of a sunflower plant.', ['seed', 'germination of seed', 'young plant', '🌻 produce flowers'],
        'Seed → germination → young plant → flowers.'),
      multi('What changes can we observe as a plant grows? Choose ALL correct answers.', [
        'more leaves', 'bigger leaves', 'taller plant', 'stem becomes thinner',
      ], [0, 1, 2], 'Plants get more and bigger leaves, grow taller and their stems become thicker.'),
      mcq('What are the basic needs for a plant to grow?', ['water, air and sunlight', 'sand, salt and wind', 'milk, juice and rice'], 0,
        'Plants need water, air and sunlight to grow.'),
      yesno('Fertilizer gives nutrients that help plants grow healthy.', true, 'Yes! Nutrients from fertilizer or soil help plants grow.'),
    ]),
  ],
};
