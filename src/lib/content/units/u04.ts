import { activity, emoji, fill, match, mcq, multi, sequence, sort, yesno } from '../builders';
import type { Unit } from '../types';

export const unit04: Unit = {
  id: 4,
  slug: 'animals',
  title: 'Animals',
  theme: 'Life Science',
  intro: 'Some animals lay eggs and some give birth. In this unit you will discover how animals reproduce, care for their young and change as they grow.',
  objectives: [
    'State animals that lay eggs and animals that give birth.',
    'Classify animals by the way they reproduce.',
    'Give examples of animals that have a few or many eggs or young.',
    'Arrange the stages in animal life cycles.',
    'Tell which young animals look like their parents.',
  ],
  notes: [
    { heading: 'Two ways to reproduce', emoji: '🥚', body: 'Some animals lay eggs, like chickens, frogs and crocodiles. Some animals give birth, like cats, cows and dolphins.' },
    { heading: 'A few or many eggs', emoji: '🐸', body: 'Chickens, swans and penguins lay a few eggs and look after them. Fish, frogs and ants lay many eggs, because many eggs get eaten.' },
    { heading: 'A few or many young', emoji: '🐇', body: 'Elephants, dolphins and pangolins give birth to a few young. Cats, rabbits and porcupines give birth to many young.' },
    { heading: 'Looking after young', emoji: '🐘', body: 'Animals that give birth feed their young with milk and protect them.' },
    { heading: 'Life cycles', emoji: '🦋', body: 'Frog: egg → tadpole → froglet → frog. Butterfly: egg → larva (caterpillar) → pupa → butterfly.' },
    { heading: 'Like their parents?', emoji: '🐄', body: 'Young cows, tigers and grasshoppers look like their parents. Young frogs, butterflies and mosquitoes do not.' },
  ],
  standards: ['4.1.1', '4.1.2', '4.1.3', '4.1.4', '4.1.5', '4.1.6', '4.1.7'],
  activities: [
    activity(4, 1, {
      title: 'Eggs or Babies?',
      skill: 'Identify and match',
      instructions: 'Look at the animals. Choose the answer.',
      standards: ['4.1.1', '4.1.6'],
    }, [
      mcq('How does a chicken reproduce?', ['🥚 lays eggs', '🍼 gives birth'], 0,
        'A chicken lays eggs. Chicks hatch from the eggs.', { visual: emoji('🐔') }),
      mcq('How does a cat reproduce?', ['🥚 lays eggs', '🍼 gives birth'], 1,
        'A cat gives birth to kittens and feeds them with milk.', { visual: emoji('🐈') }),
      yesno('A crocodile lays eggs.', true, 'Yes! Crocodiles lay eggs. Baby crocodiles hatch from them.', { visual: emoji('🐊') }),
      yesno('A dolphin lays eggs.', false, 'A dolphin lives in the sea but it gives birth to its young, like a cow or a cat.', { visual: emoji('🐬') }),
      match('Match each young animal to its parent.', [
        ['🐣 chick', 'hen'], ['🐱 kitten', 'cat'], ['🐄 calf', 'cow'], ['🐛 caterpillar', 'butterfly'],
      ], 'A chick grows into a hen, a kitten into a cat, a calf into a cow and a caterpillar into a butterfly.'),
      mcq('Which young animal looks like its parent?', ['🐯 tiger cub', '🐛 caterpillar', '🐸 tadpole'], 0,
        'A tiger cub looks like an adult tiger. Caterpillars and tadpoles look very different from their parents.'),
    ]),

    activity(4, 2, {
      title: 'Animal Groups and Life Cycles',
      skill: 'Classify and sequence',
      instructions: 'Sort the animals and put the life cycles in order.',
      standards: ['4.1.2', '4.1.3', '4.1.4', '4.1.5'],
    }, [
      sort('Classify these animals by how they reproduce.', {
        'Lay eggs': ['🐍 snake', '🐜 ant', '🦗 grasshopper', '🦂 scorpion'],
        'Give birth': ['🐘 elephant', '🐒 chimpanzee', '🦁 lion', '🐎 horse'],
      }, 'Snakes, ants, grasshoppers and scorpions lay eggs. Elephants, chimpanzees, lions and horses give birth.'),
      sequence('Put the life cycle of a frog in order.', ['🥚 egg', 'tadpole', 'froglet', '🐸 adult frog'],
        'A frog starts as an egg, hatches into a tadpole, becomes a froglet and grows into an adult frog.'),
      sequence('Put the life cycle of a butterfly in order.', ['🥚 egg', '🐛 larva (caterpillar)', 'pupa', '🦋 butterfly'],
        'Egg → larva (caterpillar) → pupa → butterfly.'),
      sort('Which animals lay a few eggs and which lay many eggs?', {
        'A few eggs': ['🐔 chicken', '🦢 swan', '🐧 penguin'],
        'Many eggs': ['🐟 fish', '🐸 frog', '🐜 ant'],
      }, 'Chickens, swans and penguins lay a few eggs. Fish, frogs and ants lay many eggs.'),
      sort('Which animals give birth to a few young and which to many young?', {
        'A few young': ['🐘 elephant', '🐬 dolphin', 'pangolin'],
        'Many young': ['🐈 cat', '🐇 rabbit', 'porcupine'],
      }, 'Elephants, dolphins and pangolins have a few young. Cats, rabbits and porcupines have many young.'),
      sequence('Put the life cycle of a cow in order.', ['calf', 'yearling', '🐄 cow'],
        'A cow gives birth to a calf. The calf grows into a yearling and then an adult cow.'),
    ]),

    activity(4, 3, {
      title: 'Animal Detectives',
      skill: 'Explain and reason',
      instructions: 'Think about why animals do what they do.',
      standards: ['4.1.3', '4.1.4', '4.1.6', '4.1.7'],
    }, [
      mcq('A fish lays hundreds of eggs. Why does it lay so many?', [
        'Many eggs are eaten by other animals, so some can still survive', 'Fish eggs are too small to see', 'Fish like to count eggs',
      ], 0, 'Fish do not look after their eggs. Many eggs are eaten, so laying many means some young can survive.', { visual: emoji('🐟') }),
      mcq('A bird builds its nest high on a tree branch. Why?', [
        'To protect its eggs from animals on the ground', 'To keep the eggs wet', 'Because it cannot fly',
      ], 0, 'A high nest keeps eggs away from animals on the ground that might eat them.', { visual: emoji('🪺') }),
      mcq('A chicken lays only a few eggs at a time. What does the hen do?', [
        'She sits on and looks after her eggs', 'She leaves the eggs in the river', 'She buries them and leaves forever',
      ], 0, 'Animals that lay a few eggs usually look after them carefully.'),
      multi('Which young animals do NOT look like their parents? Choose ALL correct answers.', [
        '🐛 caterpillar', '🐸 tadpole', '🐻 bear cub', 'mosquito larva',
      ], [0, 1, 3], 'Caterpillars, tadpoles and mosquito larvae look different from their parents. A bear cub looks like an adult bear.'),
      mcq('A bat flies like a bird. It gives birth and feeds its young with milk. In which group does a bat belong?', [
        'Animals that give birth', 'Animals that lay eggs',
      ], 0, 'Even though a bat can fly, it gives birth to its young. We classify by how the animal reproduces.', { visual: emoji('🦇') }),
    ]),

    activity(4, 4, {
      title: 'Unit 4 Assessment',
      skill: 'Show what you know',
      instructions: 'Answer all the questions. Do your best!',
      standards: ['4.1.1', '4.1.2', '4.1.3', '4.1.5', '4.1.6'],
    }, [
      sort('Complete the classification.', {
        'Lay eggs': ['🦎 lizard', '🦀 crab'],
        'Give birth': ['🦇 bat', '🦌 deer'],
      }, 'Lizards and crabs lay eggs. Bats and deer give birth.'),
      sequence('Number the growth stages of a chicken in the correct order.', ['🥚 egg', 'hatchling', '🐤 chick', '🐔 chicken'],
        'Egg → hatchling → chick → chicken.'),
      mcq('Which animal gives birth to many young at one time?', ['🐇 rabbit', '🐘 elephant', '🐬 dolphin'], 0,
        'A rabbit can give birth to many young at once. Elephants and dolphins usually have one.'),
      multi('Choose the young animals that look like their parents. Choose ALL correct answers.', [
        'young squirrel', '🦆 duckling', '🐛 caterpillar', 'tadpole',
      ], [0, 1], 'Young squirrels and ducklings look like their parents. Caterpillars and tadpoles do not.'),
      fill('Complete the sentence.', 'Animals that give birth feed their young with ___.', ['milk'], ['leaves', 'sand'],
        'Mother animals that give birth feed their young with milk.'),
      mcq('What comes after the egg in a mosquito\'s life cycle?', ['larva', 'adult', 'pupa'], 0,
        'A mosquito\'s life cycle is egg → larva → pupa → adult.', { visual: emoji('🦟') }),
    ]),
  ],
};
