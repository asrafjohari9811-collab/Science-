import { activity, emoji, fill, match, mcq, multi, sequence, sort, yesno } from '../builders';
import type { Unit } from '../types';

export const unit01: Unit = {
  id: 1,
  slug: 'scientific-skills',
  title: 'Scientific Skills',
  theme: 'Inquiry in Science',
  intro: 'Scientists use special skills to find out about the world. In this unit you will observe, classify, measure and share what you find.',
  objectives: [
    'Name the senses we use to observe.',
    'Group objects by how they are the same and different.',
    'Choose the right tool to measure.',
    'Share information using tables, pictures and charts.',
    'Handle science tools and living things carefully.',
  ],
  notes: [
    { heading: 'Observe', emoji: '👀', body: 'We observe with our five senses: we see, hear, smell, taste and touch. In the Science Room, we only taste when the teacher says it is safe.' },
    { heading: 'Classify', emoji: '🗂️', body: 'To classify, we look for things that are the same and things that are different. Then we separate and group them.' },
    { heading: 'Measure and use numbers', emoji: '📏', body: 'We use a ruler or measuring tape to measure length in centimetres (cm). We use a weighing scale to measure weight in kilograms (kg).' },
    { heading: 'Communicate', emoji: '📊', body: 'We share information by writing, talking, or using tables, pictures, charts, graphs and models.' },
    { heading: 'Manipulative skills', emoji: '🧪', body: 'Use and handle apparatus correctly, handle living things gently, sketch carefully, clean apparatus after use and store it safely.' },
  ],
  standards: ['1.1.1', '1.1.2', '1.1.3', '1.1.4', '1.2.1', '1.2.2', '1.2.3', '1.2.4', '1.2.5'],
  activities: [
    activity(1, 1, {
      title: 'My Five Senses',
      skill: 'Identify and match',
      instructions: 'Look at the pictures. Choose the best answer.',
      standards: ['1.1.1', '1.1.3'],
    }, [
      match('Match each sense to the body part we use.', [
        ['👁️ see', 'eyes'], ['👂 hear', 'ears'], ['👃 smell', 'nose'], ['👅 taste', 'tongue'], ['✋ touch', 'skin'],
      ], 'We see with our eyes, hear with our ears, smell with our nose, taste with our tongue and feel with our skin.'),
      mcq('Nisa smells bread baking in the oven. Which sense is she using?', ['👁️ sight', '👃 smell', '👂 hearing'], 1,
        'We use our nose to smell. The smell of baking bread reaches our nose.', { visual: emoji('🍞') }),
      mcq('The oven timer rings. Which sense tells us?', ['✋ touch', '👅 taste', '👂 hearing'], 2,
        'A ringing sound is heard with our ears, so we use our sense of hearing.', { visual: emoji('⏰') }),
      mcq('Which tool helps us see a tiny ant more clearly?', ['🔍 magnifying glass', '⚖️ weighing scale', '📏 ruler'], 0,
        'A magnifying glass makes small things look bigger, so we can see them clearly.', { visual: emoji('🐜') }),
      mcq('Which tool do we use to measure our body weight?', ['📏 ruler', '⚖️ weighing scale', '🔍 magnifying glass'], 1,
        'A weighing scale measures weight in kilograms (kg).'),
      yesno('We use a ruler to measure how long a pencil is. Is this correct?', true,
        'Yes! A ruler measures length. We write the length in centimetres (cm).', { visual: emoji('✏️') }),
    ]),

    activity(1, 2, {
      title: 'Sort It Out!',
      skill: 'Classify, compare and communicate',
      instructions: 'Group the things, put steps in order and fill in the blanks.',
      standards: ['1.1.2', '1.1.3', '1.1.4', '1.2.4'],
    }, [
      sort('Classify these animals. Do they have wings?', {
        'With wings': ['🦆 duck', '🦅 eagle', '🐧 penguin'],
        'Without wings': ['🐅 tiger', '🐐 goat', '🐊 crocodile'],
      }, 'Ducks, eagles and penguins have wings. Tigers, goats and crocodiles do not have wings.'),
      sort('Classify these plants. Do they have flowers?', {
        'Flowering plants': ['🌺 hibiscus', '🌻 sunflower', '🌹 rose'],
        'Non-flowering plants': ['🌿 fern', '🌲 pine tree', 'moss'],
      }, 'Hibiscus, sunflowers and roses have flowers. Ferns, pine trees and moss do not have flowers.'),
      fill('Complete the sentence.', 'Nurul is 120 ___ tall and her weight is 25 ___.', ['cm', 'kg'], ['ml', 'km'],
        'Height is measured in centimetres (cm). Weight is measured in kilograms (kg).'),
      mcq('Kanang weighs 35 kg. Nurul weighs 24 kg. Who is heavier?', ['Nurul', 'Kanang', 'They weigh the same'], 1,
        '35 kg is more than 24 kg, so Kanang is heavier.', { visual: emoji('⚖️') }),
      sequence('Put the steps for washing a test tube in order.', [
        '💧 Rinse the test tube with water',
        '🧽 Scrub inside with a test tube brush',
        '🚿 Rinse it again with clean water',
        '🧺 Turn it upside down on a rack to dry',
      ], 'First rinse, then scrub with a brush, rinse again, and leave it upside down to dry.'),
      mcq('The class wants to share how many leaves a plant grows each week. Which is the best way?', ['📋 a table', '🎵 a song', '🤫 keep it secret'], 0,
        'A table shows numbers clearly, week by week. Tables, charts and graphs help us communicate.'),
    ]),

    activity(1, 3, {
      title: 'Think Like a Scientist',
      skill: 'Apply skills to new situations',
      instructions: 'Read each situation. Think carefully, then choose.',
      standards: ['1.1.1', '1.1.2', '1.1.3', '1.2.2', '1.2.5'],
    }, [
      mcq('There is a sealed box with holes in the lid. You cannot open it. Which senses can you SAFELY use to guess what is inside?', [
        'Taste only', 'Smell and hearing (shake it gently)', 'No senses at all',
      ], 1, 'You can smell through the holes and shake the box to hear the sound. We never taste unknown things in the Science Room.', { visual: emoji('📦') }),
      mcq('Aina measured her friend\'s height. She put the ruler at the shoulders, not the top of the head. What happens?', [
        'The height will be too short', 'The height will be too tall', 'Nothing changes',
      ], 0, 'Measuring from the shoulders misses the head, so the number is too small. We must measure correctly, from the floor to the top of the head.'),
      mcq('After observing a garden snail, what should you do with it?', [
        'Keep it in your bag', 'Release it back to where you found it', 'Leave it on the table',
      ], 1, 'A snail is a living thing. We handle it gently and return it to its home so it can stay alive.', { visual: emoji('🐌') }),
      multi('Ali grouped a duck, an eagle and a chicken together. Which of these could be his reason? Choose ALL correct answers.', [
        'They have wings', 'They have two legs', 'They have four legs', 'They live only in water',
      ], [0, 1], 'Ducks, eagles and chickens all have wings and two legs. There can be more than one way to classify.'),
      mcq('You finished using a magnifying glass. What is the correct way to store it?', [
        'Drop it into a box of beakers', 'Clean it and put it back in its own place', 'Leave it in the sun on the window',
      ], 1, 'We clean apparatus and store it in its own place so it does not break and others can find it.'),
    ]),

    activity(1, 4, {
      title: 'Unit 1 Assessment',
      skill: 'Show what you know',
      instructions: 'Answer all the questions. Do your best!',
      standards: ['1.1.1', '1.1.2', '1.1.3', '1.1.4', '1.2.1', '1.2.3'],
    }, [
      mcq('A doctor listens to your heartbeat with a stethoscope. Which sense is used?', ['hearing', 'sight', 'smell'], 0,
        'A stethoscope helps the doctor hear sounds inside the body.', { visual: emoji('🩺') }),
      yesno('Classifying means grouping things by their similarities and differences.', true,
        'Yes! We look at how things are the same and different, then group them.'),
      sort('Which tool measures what?', {
        'Ruler or measuring tape (length)': ['📏 length of a table', '🎀 length of a ribbon'],
        'Weighing scale (weight)': ['🍉 weight of a watermelon', '🧒 your body weight'],
      }, 'Length is measured with a ruler or measuring tape. Weight is measured with a weighing scale.'),
      mcq('Which of these is a way to communicate information?', ['📈 drawing a graph', '😴 sleeping', '🙈 closing your eyes'], 0,
        'Graphs, tables, charts, pictures and models all help us communicate.'),
      mcq('Dina is drawing a hibiscus flower carefully in her science book. Which skill is she practising?', [
        'Sketching a specimen', 'Cleaning apparatus', 'Storing apparatus',
      ], 0, 'Drawing a specimen carefully is called sketching. It is a manipulative skill.', { visual: emoji('🌺') }),
      mcq('Which unit do we use for body weight?', ['centimetre (cm)', 'kilogram (kg)', 'litre (l)'], 1,
        'Weight is measured in kilograms (kg). Length is measured in centimetres (cm).'),
    ]),
  ],
};
