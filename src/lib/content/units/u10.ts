import { activity, emoji, fill, match, mcq, multi, sequence, sort, yesno } from '../builders';
import type { Unit } from '../types';

export const unit10: Unit = {
  id: 10,
  slug: 'technology',
  title: 'Technology',
  theme: 'Technology and Sustainability of Life',
  intro: 'Engineers follow plans and build new things. In this unit you will use a building set, follow an illustrated manual and create your own model.',
  objectives: [
    'Choose a model to build from a building set.',
    'Identify components using the illustrated manual.',
    'Assemble a model by following the manual.',
    'Create a new model that is not in the manual.',
    'Disassemble models in sequence and store the components neatly.',
  ],
  notes: [
    { heading: 'Building set', emoji: '🧱', body: 'A building set has components that can build many different models. It comes with an illustrated manual.' },
    { heading: 'Illustrated manual', emoji: '📘', body: 'The manual is a guide with pictures. It shows which components you need and the steps to assemble a model correctly.' },
    { heading: 'Shapes of components', emoji: '🔷', body: 'Components come in shapes like cubes, prisms and cylinders, and in different colours.' },
    { heading: 'Be creative', emoji: '💡', body: 'You can build a new model that is not in the manual. Plan and sketch it first.' },
    { heading: 'Disassemble and store', emoji: '📦', body: 'Take the model apart starting from the last step. Sort components by shape and colour, count them, and store them in the box.' },
  ],
  standards: ['10.1.1', '10.1.2', '10.1.3', '10.1.4', '10.1.5', '10.1.6'],
  activities: [
    activity(10, 1, {
      title: 'Meet the Building Set',
      skill: 'Identify components',
      instructions: 'Look at the components and choose.',
      standards: ['10.1.1', '10.1.2'],
    }, [
      match('Match each component to its shape.', [
        ['🎲', 'cube'], ['🔺', 'prism'], ['🥫', 'cylinder'],
      ], 'Building set components come in shapes such as cubes, prisms and cylinders.'),
      mcq('What helps you build a model correctly?', ['📘 the illustrated manual', '📺 a cartoon', '🍪 a snack'], 0,
        'The illustrated manual shows the components and steps to build a model.'),
      yesno('A building set can build many different models.', true,
        'Yes! The same components can be put together in many ways.', { visual: emoji('🧱') }),
      mcq('Which of these can you build with a building set?', ['🚁 a model helicopter', '🍌 a real banana', '🐶 a real puppy'], 0,
        'Building sets make models, such as helicopters, cranes and lorries.'),
      yesno('Before building, we should check the manual to find the components we need.', true,
        'Yes! The manual tells us which components to take out of the box.'),
      mcq('What is an illustrated manual?', ['a guide with pictures and steps', 'a box of crayons', 'a type of component'], 0,
        'An illustrated manual is a guide that uses pictures to show how to build a model.', { visual: emoji('📘') }),
    ]),

    activity(10, 2, {
      title: 'Junior Engineer',
      skill: 'Sequence and classify',
      instructions: 'Follow the steps and sort the components.',
      standards: ['10.1.2', '10.1.3', '10.1.5'],
    }, [
      sequence('Put the steps for building a model helicopter in order.', [
        '📘 Read and understand the manual',
        '🧱 Take out the components needed',
        '🔧 Build the head, body, tail and blade sections',
        '🚁 Join the sections together',
      ], 'First read the manual, then gather components, build each section and finally join them.'),
      sort('Sort the components by shape.', {
        'Cube': ['🟥 red cube', '🟩 green cube'],
        'Cylinder': ['red cylinder', 'blue cylinder'],
        'Prism': ['yellow prism', 'green prism'],
      }, 'Sorting components by shape makes it easier to count and store them.'),
      sequence('Put the steps for putting the building set away in order.', [
        '🔧 Disassemble the model, starting from the last step',
        '🗂️ Sort the components by shape and colour',
        '🔢 Count the components',
        '📦 Store them in the correct compartments of the box',
      ], 'Take it apart in reverse order, sort, count, then store neatly.'),
      fill('Complete the sentence.', 'When we disassemble a model, we start from the ___ step of building.', ['last'], ['first', 'middle'],
        'We take a model apart in reverse, starting from the last step.'),
      mcq('The manual says you need six green cubes. You count only five. What should you do?', [
        'Tell the teacher that one component is missing', 'Use a pencil instead', 'Hide the box',
      ], 0, 'If a component is missing, tell the teacher. A model may not be complete without all its parts.'),
      fill('Complete the sentence.', 'A building set comes with an ___ manual.', ['illustrated'], ['invisible', 'edible'],
        'An illustrated manual shows the steps with pictures.'),
    ]),

    activity(10, 3, {
      title: 'Creative Builder',
      skill: 'Design and evaluate',
      instructions: 'Think like an engineer. Plan, build and check.',
      standards: ['10.1.3', '10.1.4', '10.1.6'],
    }, [
      mcq('What may happen if you build a model WITHOUT looking at the manual?', [
        'It may take a long time and the model may be wrong', 'It will always be perfect', 'The components will disappear',
      ], 0, 'Without the manual, it is easy to make mistakes and take much longer.'),
      sequence('You want to build a windmill that is NOT in the manual. Put your plan in order.', [
        '💭 Think of an idea',
        '✏️ Sketch the model',
        '🧱 Choose the components',
        '🔧 Build the model',
        '🗣️ Explain your model to the class',
      ], 'Engineers plan, sketch, choose materials, build and then share their work.'),
      mcq('Your friend built a crane but it looks different from the manual picture. What should you do FIRST to check it?', [
        'Compare each step in the manual with the model', 'Throw the model away', 'Say it is wrong without checking',
      ], 0, 'We check a model by comparing it with the manual, step by step.'),
      mcq('Why do we sort components by shape and colour before storing them?', [
        'So we can count them easily and know if any are missing', 'So the box becomes heavier', 'So we cannot find them next time',
      ], 0, 'Sorting helps us count components, find missing pieces and keep the set tidy.'),
      multi('You have 10 cubes, 10 cylinders and 10 prisms. Which models could you try to build? Choose ALL that could work.', [
        'a tower', 'a bridge', 'a simple car', 'a real ice cream',
      ], [0, 1, 2], 'With cubes, cylinders and prisms you can design many models, like towers, bridges and cars. Be creative!'),
    ]),

    activity(10, 4, {
      title: 'Unit 10 Assessment',
      skill: 'Show what you know',
      instructions: 'Answer all the questions. Do your best!',
      standards: ['10.1.1', '10.1.2', '10.1.3', '10.1.5'],
    }, [
      mcq('What is a building set?', [
        'A set of components to build many models, with an illustrated manual', 'A set of pencils', 'A box of food',
      ], 0, 'A building set has components to build many models and includes an illustrated manual.'),
      match('Name the shape of each component.', [['🎲', 'cube'], ['🥫', 'cylinder'], ['🔺', 'prism']],
        'Cubes, cylinders and prisms are common component shapes.'),
      yesno('We should store building set components neatly after use.', true,
        'Yes! Neat storage helps us find components and see if any are missing.'),
      mcq('The components are all mixed up in the box. What should you do?', [
        'Arrange them by shape, size and colour', 'Shake the box harder', 'Leave them for someone else',
      ], 0, 'Arranging components by shape, size and colour keeps the set organised.'),
      mcq('Which do we use to assemble a model correctly?', ['the illustrated manual', 'a ruler', 'a magnet'], 0,
        'The illustrated manual guides us to assemble a model correctly.'),
      mcq('Can you build a new model that is not in the manual?', ['Yes, by being creative with the components', 'No, never'], 0,
        'Yes! Components can be put together in new ways to create your own model.'),
    ]),
  ],
};
