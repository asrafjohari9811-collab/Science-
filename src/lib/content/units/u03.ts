import { activity, emoji, fill, match, mcq, multi, sequence, sort, yesno } from '../builders';
import type { Unit } from '../types';

export const unit03: Unit = {
  id: 3,
  slug: 'humans',
  title: 'Humans',
  theme: 'Life Science',
  intro: 'You have grown a lot since you were a baby! In this unit you will learn how humans reproduce, grow and inherit features from their families.',
  objectives: [
    'State that humans reproduce by giving birth.',
    'Arrange the stages of human growth.',
    'Describe changes in size, height and weight.',
    'Explain that people of the same age grow differently.',
    'Give examples of features inherited from parents or ancestors.',
  ],
  notes: [
    { heading: 'Humans give birth', emoji: '👶', body: 'Humans reproduce by giving birth to babies.' },
    { heading: 'Stages of growth', emoji: '📈', body: 'We grow in stages: infant → child → teenager → adult.' },
    { heading: 'Changes as we grow', emoji: '📏', body: 'Since birth, we grow bigger in size, taller in height and heavier in weight.' },
    { heading: 'Everyone is different', emoji: '🧒', body: 'Children of the same age can have different heights, weights and palm sizes.' },
    { heading: 'Inheritance', emoji: '👪', body: 'Children inherit features from their parents or ancestors, such as iris colour, skin colour and hair type.' },
  ],
  standards: ['3.1.1', '3.1.2', '3.1.3', '3.1.4', '3.1.5', '3.1.6'],
  activities: [
    activity(3, 1, {
      title: 'I Am Growing',
      skill: 'Identify and match',
      instructions: 'Look carefully and choose the answer.',
      standards: ['3.1.1', '3.1.2'],
    }, [
      mcq('How do humans reproduce?', ['🥚 by laying eggs', '👶 by giving birth', '🌱 from seeds'], 1,
        'Humans reproduce by giving birth to babies.', { visual: emoji('🤱') }),
      match('Match each picture to its growth stage.', [
        ['👶', 'infant'], ['🧒', 'child'], ['🧑‍🎓', 'teenager'], ['🧔', 'adult'],
      ], 'We grow from an infant, to a child, to a teenager and then an adult.'),
      yesno('As we grow, our height increases.', true, 'Yes! We become taller as we grow.', { visual: emoji('📏') }),
      mcq('Your old shirt is now too tight. Why?', ['You have grown bigger', 'The shirt grew bigger', 'You became smaller'], 0,
        'Our body size increases as we grow, so old clothes become tight.', { visual: emoji('👕') }),
      mcq('Which stage are YOU at now?', ['infant', 'child', 'adult'], 1,
        'Year 2 pupils are children. You will become a teenager and then an adult.'),
      yesno('A baby weighs more than his father.', false,
        'A baby is small. We gain weight as we grow, so the father weighs more.'),
    ]),

    activity(3, 2, {
      title: 'Same or Different?',
      skill: 'Sequence, compare and classify',
      instructions: 'Put things in order, compare and sort.',
      standards: ['3.1.2', '3.1.3', '3.1.5'],
    }, [
      sequence('Put the stages of human growth in order.', ['👶 infant', '🧒 child', '🧑 teenager', '🧓 adult'],
        'Infant → child → teenager → adult.'),
      fill('Complete the sentence.', 'Since birth, we change in size, ___ and ___.', ['height', 'weight'], ['colour', 'name'],
        'We change in size, height and weight since birth.'),
      mcq('Kugan and Kanang are both 8 years old. Kanang is taller. What can we say?', [
        'Children of the same age grow differently', 'Kugan is younger', 'Kanang is an adult',
      ], 0, 'People of the same age can have different heights. Growth is different for each person.'),
      sort('Sort these features. Can they be inherited from parents?', {
        'Inherited': ['👁️ iris colour', '✋ skin colour', '🌀 curly hair type'],
        'Not inherited': ['🩹 a scar on the knee', '💇 a short haircut', '🚲 knowing how to cycle'],
      }, 'Iris colour, skin colour and hair type are inherited. A scar, a haircut and a skill like cycling are not inherited.'),
      mcq('Look at the table. Who is the heaviest?\nNisa 24 kg · Kugan 30 kg · Kanang 27 kg', ['Nisa', 'Kugan', 'Kanang'], 1,
        '30 kg is the largest number, so Kugan is the heaviest.'),
      fill('Complete the sentence.', 'Children inherit features from their ___ or ___.', ['parents', 'ancestors'], ['teachers', 'friends'],
        'Features such as iris colour come from our parents or ancestors, like grandparents.'),
    ]),

    activity(3, 3, {
      title: 'Family Features',
      skill: 'Analyse and predict',
      instructions: 'Read each clue. Think like a scientist!',
      standards: ['3.1.3', '3.1.4', '3.1.5', '3.1.6'],
    }, [
      mcq('Kugan has curly hair. His mother and father have straight hair. His grandfather has curly hair. Why?', [
        'He inherited his hair type from his grandfather (an ancestor)', 'He curls his hair every morning', 'Hair type cannot be inherited',
      ], 0, 'Features can come from ancestors such as grandparents, not only from parents.', { visual: emoji('👴') }),
      mcq('A mother has brown eyes and black curly hair. Which feature might her child inherit?', [
        'Brown iris colour', 'The mother\'s favourite food', 'The mother\'s job',
      ], 0, 'Iris colour can be inherited. Favourite foods and jobs are not inherited.'),
      multi('Which of these can be inherited from parents? Choose ALL correct answers.', [
        'skin colour', 'iris colour', 'hair type', 'a broken arm',
      ], [0, 1, 2], 'Skin colour, iris colour and hair type are inherited. A broken arm comes from an accident.'),
      mcq('Twins Adam and Aiman are the same age but Aiman is taller. Which statement is TRUE?', [
        'Growth among individuals is different', 'They are not really twins', 'Adam will never grow',
      ], 0, 'Even children born on the same day can grow differently. Food, exercise and inheritance can make a difference.'),
      mcq('Mira measures her palm in Year 1 and again in Year 2. What will she most likely find?', [
        'Her palm is bigger in Year 2', 'Her palm is smaller in Year 2', 'Her palm has disappeared',
      ], 0, 'As we grow, our body parts grow bigger in size.', { visual: emoji('✋') }),
    ]),

    activity(3, 4, {
      title: 'Unit 3 Assessment',
      skill: 'Show what you know',
      instructions: 'Answer all the questions. Do your best!',
      standards: ['3.1.1', '3.1.2', '3.1.3', '3.1.5'],
    }, [
      yesno('Humans reproduce by laying eggs.', false, 'Humans reproduce by giving birth.'),
      sequence('Arrange the growth stages, from youngest to oldest.', ['infant', 'child', 'teenager', 'adult'],
        'Infant → child → teenager → adult.'),
      mcq('Which change happens as a child grows?', ['height increases', 'height decreases', 'weight goes to zero'], 0,
        'As we grow, our height, size and weight increase.'),
      fill('Complete the sentence.', 'Although they are the ___ age, growth among individuals is ___.', ['same', 'different'], ['old', 'equal'],
        'People of the same age can grow differently.'),
      mcq('Which is an inherited feature?', ['iris colour', 'a painted nail', 'a sticker on your hand'], 0,
        'Iris colour is inherited from parents or ancestors.'),
      match('Match the feature to an example.', [
        ['hair type', 'curly or straight'], ['iris colour', 'brown or black'], ['skin colour', 'fair or dark'],
      ], 'Hair type, iris colour and skin colour are features we inherit.'),
    ]),
  ],
};
