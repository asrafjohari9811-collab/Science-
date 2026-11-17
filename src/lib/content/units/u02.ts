import { activity, emoji, fill, match, mcq, multi, sequence, sort, yesno } from '../builders';
import type { Unit } from '../types';

export const unit02: Unit = {
  id: 2,
  slug: 'science-room-rules',
  title: 'Science Room Rules',
  theme: 'Inquiry in Science',
  intro: 'The Science Room is a special place. Rules keep everyone safe and keep the room clean and tidy.',
  objectives: [
    'State the Science Room rules.',
    'Tell safe actions from unsafe actions.',
    'Explain why we must follow the rules.',
    'Know what to do when something goes wrong.',
  ],
  notes: [
    { heading: 'Keep it clean and safe', emoji: '🧼', body: 'Make sure the Science Room is clean and safe at all times.' },
    { heading: 'Clean and store', emoji: '🧺', body: 'Clean all tools and apparatus after use. Put them back in their original places.' },
    { heading: 'Throw away waste correctly', emoji: '🗑️', body: 'Solid waste goes into the waste container. Liquid waste goes into the sink.' },
    { heading: 'Tell the teacher', emoji: '🙋', body: 'Tell the teacher at once if someone is hurt or if any tool or apparatus is broken.' },
    { heading: 'Bring only what you need', emoji: '📚', body: 'Only bring books and stationery. Leave your school bag outside.' },
  ],
  standards: ['2.1.1'],
  activities: [
    activity(2, 1, {
      title: 'Safe or Not Safe?',
      skill: 'Identify safe behaviour',
      instructions: 'Look at each action. Is it safe?',
      standards: ['2.1.1'],
    }, [
      yesno('Kanang leaves his school bag outside before entering the Science Room. Is this correct?', true,
        'Yes! Bags can block the way and make people trip. We only bring books and stationery.', { visual: emoji('🎒') }),
      yesno('Azrai pours liquid waste into the dustbin. Is this correct?', false,
        'Liquid waste should go into the sink, not the dustbin. In the dustbin it can leak onto the floor.', { visual: emoji('🗑️') }),
      yesno('Mei Ling washes the beaker after using it. Is this correct?', true,
        'Yes! We clean all apparatus after use so it is ready for the next person.', { visual: emoji('🧪') }),
      mcq('Where should we throw used paper towels?', ['🗑️ waste container', '🚰 sink', '🪟 out of the window'], 0,
        'Paper towels are solid waste. Solid waste goes into the waste container.'),
      yesno('Running and playing in the Science Room is safe.', false,
        'Running can cause accidents, like knocking over glass apparatus. We walk carefully.', { visual: emoji('🏃') }),
      mcq('A beaker breaks on the floor. What should you do first?', ['Pick up the glass with bare hands', 'Tell the teacher at once', 'Hide it under the table'], 1,
        'Broken glass is sharp. Tell the teacher at once so it can be cleaned up safely.', { visual: emoji('💥') }),
    ]),

    activity(2, 2, {
      title: 'Rule Detectives',
      skill: 'Classify and complete rules',
      instructions: 'Sort the actions and complete the rules.',
      standards: ['2.1.1'],
    }, [
      sort('Sort these actions.', {
        '✅ Follow the rules': ['🧽 cleaning the table after work', '🙋 telling the teacher about a cut finger', '🧺 storing tools in their place'],
        '❌ Break the rules': ['🍫 eating snacks during an experiment', '🎒 bringing a school bag inside', '🤐 hiding a broken test tube'],
      }, 'Cleaning, telling the teacher and storing tools follow the rules. Eating, bringing bags and hiding broken apparatus break the rules.'),
      fill('Complete the rule.', 'Throw solid waste into the ___ and liquid waste into the ___.', ['waste container', 'sink'], ['drawer', 'bag'],
        'Solid waste goes into the waste container. Liquid waste goes into the sink.'),
      match('Match each problem to the right action.', [
        ['🩸 A friend cuts a finger', 'Tell the teacher at once'],
        ['💧 Water spills on the floor', 'Wipe it up so no one slips'],
        ['🧪 You finish with a test tube', 'Wash it and store it'],
      ], 'Tell the teacher about injuries, clean up spills quickly and always wash and store apparatus.'),
      sequence('Put these steps in order for when you finish an activity.', [
        '🧽 Clean the apparatus',
        '🧺 Store it in its original place',
        '🧹 Clean your table',
        '🧼 Wash your hands',
      ], 'Clean the apparatus, store it, tidy the table and finally wash your hands.'),
      fill('Complete the sentence.', 'Tell the ___ if any apparatus is ___.', ['teacher', 'broken'], ['friend', 'clean'],
        'Always tell the teacher about broken apparatus so no one gets hurt.'),
      mcq('Which item may you bring into the Science Room?', ['⚽ football', '✏️ pencil', '🎮 game console'], 1,
        'Only books and stationery, like pencils, are allowed in the Science Room.'),
    ]),

    activity(2, 3, {
      title: 'What Should They Do?',
      skill: 'Reason about rules',
      instructions: 'Read the story. Choose the best idea and the best reason.',
      standards: ['2.1.1'],
    }, [
      mcq('Kanang broke a beaker. His friend says, "Do not tell the teacher, you will be scolded." What is the BEST thing to do?', [
        'Keep it a secret', 'Tell the teacher at once so the glass is cleared safely', 'Throw the pieces in the sink',
      ], 1, 'Being honest keeps everyone safe. The teacher can clear the sharp glass properly.', { visual: emoji('🫙') }),
      mcq('Why must we put tools back in their original places?', [
        'So the next person can find them easily', 'So the room looks empty', 'So we can take them home',
      ], 0, 'When tools are stored in the right place, everyone can find them quickly and safely.'),
      mcq('Sand from an activity was poured into the sink. What might happen?', [
        'The sink becomes clogged', 'The sand dissolves', 'Nothing happens',
      ], 0, 'Sand is solid waste. It does not dissolve and can block the sink, so it goes into the waste container.'),
      multi('Why do we need Science Room rules? Choose ALL correct answers.', [
        'To keep pupils safe', 'To keep apparatus from breaking', 'To keep the room clean and tidy', 'To make science boring',
      ], [0, 1, 2], 'Rules keep us safe, protect the apparatus and keep the room clean so experiments can run smoothly.'),
      mcq('Your friend is about to taste a liquid during an experiment. What should you say?', [
        '"Go ahead, it looks like water."', '"Stop! Do not taste anything unless the teacher says it is safe."', '"Smell it first, then drink it."',
      ], 1, 'Some liquids can be harmful even if they look like water. Never taste anything unless the teacher says it is safe.', { visual: emoji('⚠️') }),
    ]),

    activity(2, 4, {
      title: 'Unit 2 Assessment',
      skill: 'Show what you know',
      instructions: 'Answer all the questions. Do your best!',
      standards: ['2.1.1'],
    }, [
      yesno('We should report all accidents to the teacher immediately.', true,
        'Yes! The teacher can help quickly when someone is hurt.'),
      mcq('Where should liquid waste go?', ['into the dustbin', 'into the sink', 'onto the floor'], 1,
        'Liquid waste goes into the sink.'),
      multi('Which of these follow the Science Room rules? Choose ALL correct answers.', [
        '🧽 washing the beaker after use', '🎒 leaving bags outside', '🍔 eating during an experiment', '🧺 storing tools neatly',
      ], [0, 1, 3], 'Washing apparatus, leaving bags outside and storing tools neatly all follow the rules. We never eat during experiments.'),
      mcq('Why should we leave school bags outside the Science Room?', [
        'Bags can get in the way and make people trip', 'Bags are too heavy to lift', 'Bags make the room cold',
      ], 0, 'School bags take up space and can block people moving around.'),
      fill('Complete the rule.', 'Clean all tools after use and ___ them in their original places.', ['store'], ['throw', 'hide'],
        'We clean tools and store them in their original places.'),
      yesno('It is fine to hide a broken thermometer so nobody knows.', false,
        'We must tell the teacher about broken apparatus so it can be cleared away safely.'),
    ]),
  ],
};
