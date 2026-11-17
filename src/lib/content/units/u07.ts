import { activity, emoji, fill, match, mcq, multi, sequence, sort, yesno } from '../builders';
import type { Unit, Visual } from '../types';

const circuit = (switchClosed: boolean | null, opts: Partial<Extract<Visual, { kind: 'circuit' }>> = {}): Visual => ({
  kind: 'circuit', cell: true, bulb: true, switchClosed, bulbOn: switchClosed === true && !opts.gap, ...opts,
});

export const unit07: Unit = {
  id: 7,
  slug: 'electricity',
  title: 'Electricity',
  theme: 'Physical Science',
  intro: 'Electricity lights up bulbs and makes things move. In this unit you will learn the parts of a circuit and build one yourself.',
  objectives: [
    'Identify a dry cell, bulb, switch and connecting wires.',
    'Explain what each component does.',
    'Build a complete electric circuit.',
    'Predict why a bulb does not light up.',
    'Classify objects as conductors or insulators.',
  ],
  notes: [
    { heading: 'Components', emoji: '🔋', body: 'A circuit uses a dry cell, a bulb, a switch and connecting wires.' },
    { heading: 'What they do', emoji: '💡', body: 'Dry cell: supplies electrical energy. Bulb: produces light. Switch: completes and breaks the circuit. Wires: connect the components.' },
    { heading: 'Complete circuit', emoji: '✅', body: 'When the switch is closed, the circuit is complete and the bulb lights up. When the switch is open, the bulb does not light up.' },
    { heading: 'Bulb not lighting?', emoji: '🔍', body: 'The switch may be open, the dry cell may be used up, the bulb may be damaged or loose, or a wire may not be connected.' },
    { heading: 'Conductors and insulators', emoji: '🥄', body: 'Conductors let electric current flow (metal spoon, nail, coin). Insulators do not (rubber, plastic, cloth, wood).' },
  ],
  standards: ['7.1.1', '7.1.2', '7.1.3', '7.1.4', '7.1.5', '7.1.6', '7.1.7'],
  activities: [
    activity(7, 1, {
      title: 'Circuit Parts',
      skill: 'Identify components',
      instructions: 'Name the parts of an electric circuit.',
      standards: ['7.1.1', '7.1.2'],
    }, [
      match('Match each component to its name.', [
        ['🔋', 'dry cell'], ['💡', 'bulb'], ['🔘', 'switch'], ['〰️', 'connecting wire'],
      ], 'A circuit is made of a dry cell, a bulb, a switch and connecting wires.'),
      mcq('Which component supplies electrical energy?', ['🔋 dry cell', '💡 bulb', '🔘 switch'], 0,
        'The dry cell supplies electrical energy to the circuit.'),
      mcq('What does a bulb do?', ['produces light', 'supplies energy', 'cuts the wire'], 0,
        'A bulb produces light when electric current flows through it.'),
      yesno('Look at the circuit. The switch is closed. Will the bulb light up?', true,
        'Yes! A closed switch makes a complete circuit, so the bulb lights up.', { visual: circuit(true) }),
      yesno('Look at the circuit. The switch is open. Will the bulb light up?', false,
        'An open switch breaks the circuit, so electricity cannot flow and the bulb stays off.', { visual: circuit(false) }),
      mcq('What joins all the components together?', ['connecting wires', 'string', 'sticky tape'], 0,
        'Connecting wires join the components to make a circuit.'),
    ]),

    activity(7, 2, {
      title: 'Conductor or Insulator?',
      skill: 'Classify and complete',
      instructions: 'Sort the objects and complete the sentences.',
      standards: ['7.1.2', '7.1.3', '7.1.5', '7.1.6'],
    }, [
      sort('Replace the switch with each object. Sort them by whether the bulb lights up.', {
        'Bulb lights up (conductor)': ['📎 paper clip', '🥄 metal spoon', '🪙 coin'],
        'Bulb does not light up (insulator)': ['rubber eraser', '🥤 plastic straw', 'ice cream stick'],
      }, 'Metal objects like paper clips, spoons and coins are conductors. Rubber, plastic and wood are insulators.'),
      fill('Complete the sentence.', 'The bulb lights up when the switch is ___. The bulb does not light up when the switch is ___.', ['closed', 'open'], ['wet', 'heavy'],
        'A closed switch completes the circuit. An open switch breaks it.'),
      match('Match each component to its function.', [
        ['🔋 dry cell', 'supplies electrical energy'],
        ['💡 bulb', 'produces light'],
        ['🔘 switch', 'completes and breaks the circuit'],
      ], 'Dry cell gives energy, bulb gives light, switch turns the circuit on and off.'),
      sequence('Put the steps to build a circuit in order.', [
        '💡 Fasten the bulb onto the bulb holder',
        '🔋 Put the dry cell into the dry cell holder',
        '〰️ Connect all components with wires',
        '🔘 Close the switch and observe',
      ], 'Prepare the bulb and dry cell, connect them with wires, then close the switch to test.'),
      fill('Complete the sentence.', 'A material that allows electric current to flow through it is called a ___.', ['conductor'], ['insulator', 'switch'],
        'A conductor allows electric current to flow. An insulator does not.'),
      mcq('Which circuit is COMPLETE?', ['A circuit with a closed switch', 'A circuit with an open switch', 'A circuit with a cut wire'], 0,
        'Only a circuit with a closed switch and no gaps is complete.'),
    ]),

    activity(7, 3, {
      title: 'Junior Electrician',
      skill: 'Troubleshoot and reason',
      instructions: 'Find out why the circuit is not working.',
      standards: ['7.1.3', '7.1.4', '7.1.6', '7.1.7'],
    }, [
      mcq('The switch is closed, but the bulb does not light up. Kugan changed the bulb and the dry cell, and it still does not work. What should he check next?', [
        'Whether the wires are connected properly', 'The colour of the switch', 'The weather outside',
      ], 0, 'If the bulb and dry cell are fine, a loose or unconnected wire could be breaking the circuit.', { visual: circuit(true, { gap: true }) }),
      multi('Why might a bulb NOT light up in a circuit? Choose ALL correct answers.', [
        'the dry cell has no energy left', 'the bulb is damaged', 'the switch is open', 'the wires are a nice colour',
      ], [0, 1, 2], 'A used-up dry cell, a damaged bulb or an open switch can all stop the bulb from lighting.'),
      mcq('A circuit is left switched on for one whole day. What will happen to the bulb\'s brightness?', [
        'It becomes dimmer because the dry cell runs out of energy', 'It becomes brighter', 'It changes colour',
      ], 0, 'The dry cell slowly uses up its energy, so the bulb becomes dimmer.'),
      mcq('Why are electrical wires covered with plastic or rubber?', [
        'Plastic and rubber are insulators, so they protect us', 'To make the wires heavier', 'Because plastic is a conductor',
      ], 0, 'Plastic and rubber are insulators. They stop electric current from flowing into our hands.', { visual: emoji('🔌') }),
      mcq('You want to replace the bulb with something that makes a sound. Which component should you use?', ['buzzer', 'eraser', 'ruler'], 0,
        'A buzzer produces sound when it is in a complete circuit.', { visual: emoji('🔔') }),
    ]),

    activity(7, 4, {
      title: 'Unit 7 Assessment',
      skill: 'Show what you know',
      instructions: 'Answer all the questions. Do your best!',
      standards: ['7.1.1', '7.1.2', '7.1.4', '7.1.6'],
    }, [
      mcq('What is the function of a switch?', ['to complete and break the circuit', 'to produce light', 'to supply energy'], 0,
        'A switch completes the circuit when closed and breaks it when open.'),
      yesno('Look at the circuit. There is a gap in the wire. Will the bulb light up?', false,
        'A gap in the wire makes the circuit incomplete, so the bulb does not light up.', { visual: circuit(true, { gap: true }) }),
      sort('Classify these objects.', {
        'Conductors': ['🔩 nail', '🍴 metal fork'],
        'Insulators': ['🧵 thread', '🍃 leaf'],
      }, 'Metal objects like nails and forks are conductors. Thread and leaves are insulators.'),
      fill('Complete the sentence.', 'An ___ is a material that does NOT allow electric current to flow through it.', ['insulator'], ['conductor', 'bulb'],
        'An insulator does not allow electric current to flow.'),
      multi('Which components are needed to build a complete circuit? Choose ALL correct answers.', [
        'dry cell', 'bulb', 'connecting wires', 'magnifying glass',
      ], [0, 1, 2], 'A dry cell, a bulb and connecting wires make a circuit. A switch helps turn it on and off.'),
      mcq('The bulb is not tightly fastened in its holder. What happens?', ['The bulb may not light up', 'The bulb becomes brighter', 'The dry cell gets bigger'], 0,
        'A loose bulb breaks the circuit, so it may not light up.'),
    ]),
  ],
};
