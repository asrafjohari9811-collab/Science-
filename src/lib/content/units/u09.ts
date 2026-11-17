import { activity, emoji, fill, match, mcq, multi, sequence, sort, yesno } from '../builders';
import type { Unit } from '../types';

export const unit09: Unit = {
  id: 9,
  slug: 'earth',
  title: 'Earth',
  theme: 'Earth and Space',
  intro: 'Water and air are needed for life on Earth. In this unit you will learn where water comes from, how it flows, and what air does.',
  objectives: [
    'State natural sources of water.',
    'State that water flows from high places to low places.',
    'Arrange the natural water cycle.',
    'State that air is around us and contains oxygen and carbon dioxide.',
    'Describe how moving air (wind) helps us and can harm us.',
  ],
  notes: [
    { heading: 'Sources of water', emoji: '🌧️', body: 'Natural sources of water are rain, rivers, lakes, seas and springs.' },
    { heading: 'Water flows', emoji: '⛰️', body: 'Water flows from high places to low places. Rivers and waterfalls flow down to the sea.' },
    { heading: 'Water cycle', emoji: '🔄', body: 'Water → water vapour → clouds → rain, which flows back to rivers and seas.' },
    { heading: 'Air', emoji: '💨', body: 'Air is all around us, even in water and soil. Air has gases such as oxygen and carbon dioxide. Living things need air to breathe.' },
    { heading: 'Wind', emoji: '🪁', body: 'Moving air is called wind. We cannot see it but we can feel it. Wind flies kites, moves sailing boats, turns windmills and dries clothes.' },
    { heading: 'Strong winds', emoji: '🌪️', body: 'Strong winds can cause big waves, harm people and damage property.' },
    { heading: 'Care for water', emoji: '🚰', body: 'Keep rivers clean and do not waste water, so everyone has clean water.' },
  ],
  standards: ['9.1.1', '9.1.2', '9.1.3', '9.1.4', '9.1.5', '9.2.1', '9.2.2', '9.2.3', '9.2.4', '9.2.5', '9.2.6'],
  activities: [
    activity(9, 1, {
      title: 'Water and Air Around Us',
      skill: 'Identify and match',
      instructions: 'Look and choose the answer.',
      standards: ['9.1.1', '9.1.2', '9.2.1', '9.2.3'],
    }, [
      multi('Which are natural sources of water? Choose ALL correct answers.', ['🌧️ rain', '🏞️ river', '🌊 sea', '🚰 water tap'], [0, 1, 2],
        'Rain, rivers and seas are natural sources of water. A tap brings water through pipes made by people.'),
      match('Match each word to its meaning.', [
        ['lake', 'a large area of water surrounded by land'],
        ['spring', 'water flowing out from under the ground'],
        ['sea', 'a large area of salt water'],
      ], 'Lakes are surrounded by land, springs come from underground and seas are salty.'),
      mcq('Which way does water flow?', ['from a low place to a high place', 'from a high place to a low place'], 1,
        'Water always flows from a high place to a low place.', { visual: emoji('⛰️') }),
      yesno('We can feel moving air even though we cannot see it.', true, 'Yes! Moving air is called wind. We feel it on our skin.', { visual: emoji('🍃') }),
      mcq('What do living things need to breathe?', ['💨 air', '🧃 juice', '🪨 rocks'], 0,
        'Humans, animals and plants all need air to breathe.'),
      mcq('Which one is moved by the wind?', ['🪁 a kite', '🏠 a house', '⛰️ a mountain'], 0,
        'Wind pushes the kite up into the sky.'),
    ]),

    activity(9, 2, {
      title: 'The Water Cycle',
      skill: 'Sequence and classify',
      instructions: 'Put the cycle in order and sort the ideas.',
      standards: ['9.1.3', '9.1.4', '9.2.2', '9.2.4'],
    }, [
      sequence('Arrange the natural water cycle, starting with water in the sea.', ['🌊 water', '♨️ water vapour', '☁️ clouds', '🌧️ rain'],
        'Water turns into water vapour and rises, the vapour cools to form clouds, then clouds fall as rain.'),
      fill('Complete the sentence.', 'Water vapour cools and forms ___. Heavy clouds fall as ___.', ['clouds', 'rain'], ['snowmen', 'sand'],
        'Cooled water vapour forms clouds, and heavy clouds produce rain.'),
      sort('How does wind affect us?', {
        'Helpful': ['🪁 flying a kite', '⛵ moving a sailing boat', '👕 drying clothes'],
        'Harmful': ['🌊 big waves', '🌳 falling trees', '🏚️ damaged roofs'],
      }, 'Gentle wind helps us in many ways. Strong winds can cause damage and danger.'),
      fill('Complete the sentence.', 'Air has gases such as ___ and carbon dioxide.', ['oxygen'], ['sugar', 'salt'],
        'Air contains gases such as oxygen and carbon dioxide.'),
      sequence('A river starts on a mountain. Put the places in order as the water flows.', ['⛰️ mountain', 'waterfall', 'lowland river', '🌊 sea'],
        'Water flows from high places down to low places, ending in the sea.'),
      mcq('Air is found in ___.', ['water and soil, and all around us', 'only in balloons', 'only in the sky'], 0,
        'Air is everywhere, even in water and soil. Fish and earthworms use it to breathe.'),
    ]),

    activity(9, 3, {
      title: 'Earth Thinkers',
      skill: 'Predict and apply',
      instructions: 'Use what you know to answer real-life questions.',
      standards: ['9.1.2', '9.1.3', '9.1.5', '9.2.3', '9.2.4', '9.2.5'],
    }, [
      mcq('One end of a tray of coloured water is lifted up. Where does the water go?', [
        'It flows to the lower end', 'It flows to the higher end', 'It stays in the middle',
      ], 0, 'Water flows from high to low, so it moves to the lower end of the tray.', { visual: emoji('🧪') }),
      mcq('After heavy rain, where will a puddle MOST likely form?', [
        'in a low hole in the road', 'on top of a hill', 'on a roof that slopes',
      ], 0, 'Water flows down and collects in the lowest place.', { visual: emoji('🌧️') }),
      mcq('People throw rubbish into a river. What might happen?', [
        'The river becomes dirty and the water flow can be blocked', 'The river becomes cleaner', 'More fish will live there',
      ], 0, 'Rubbish pollutes the water and can block it. We should keep rivers clean.', { visual: emoji('🏞️') }),
      mcq('Siti made a paper wind rocket. How can she make it fly?', [
        'Blow air through the straw', 'Pour water on it', 'Put it in a box',
      ], 0, 'Moving air from her breath pushes the rocket forward.', { visual: emoji('🚀') }),
      mcq('Which is the BEST day to dry clothes outside?', ['a sunny, windy day', 'a rainy, still day', 'a dark, foggy night'], 0,
        'Sunlight and wind help water evaporate from clothes faster.', { visual: emoji('👕') }),
    ]),

    activity(9, 4, {
      title: 'Unit 9 Assessment',
      skill: 'Show what you know',
      instructions: 'Answer all the questions. Do your best!',
      standards: ['9.1.1', '9.1.2', '9.1.4', '9.2.1', '9.2.3', '9.2.4'],
    }, [
      multi('Which of these are NATURAL sources of water? Choose ALL correct answers.', ['lake', 'river', 'spring', 'swimming pool'], [0, 1, 2],
        'Lakes, rivers and springs are natural. A swimming pool is made by people.'),
      yesno('Water flows from low areas to high areas.', false, 'Water flows from high areas to low areas.'),
      sequence('Complete the water cycle.', ['water', 'water vapour', 'clouds', 'rain'],
        'Water → water vapour → clouds → rain.'),
      mcq('What is moving air called?', ['wind', 'rain', 'cloud'], 0, 'Moving air is called wind.'),
      multi('How does wind help humans? Choose ALL correct answers.', ['dries clothes', 'flies kites', 'turns windmills', 'makes rice cook'], [0, 1, 2],
        'Wind dries clothes, flies kites and turns windmills.'),
      mcq('Give one effect of a strong wind.', ['It can cause big waves', 'It makes plants grow faster', 'It cleans rivers'], 0,
        'Strong winds can cause big waves and damage.'),
    ]),
  ],
};
