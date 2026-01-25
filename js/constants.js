// Wyrd Workout - Constants and Data Model

export const DIE_SIZES = [4, 6, 8, 10, 12, 14, 16, 18, 20];

export const HP_RECOMMENDATIONS = {
  4: 100,
  6: 150,
  8: 250,
  10: 350,
  12: 450,
  14: 475,
  16: 500,
  18: 525,
  20: 550
};

// Interpolate/extrapolate HP for any die size
export function getRecommendedHP(dieSize) {
  if (HP_RECOMMENDATIONS[dieSize]) {
    return HP_RECOMMENDATIONS[dieSize];
  }

  const sizes = Object.keys(HP_RECOMMENDATIONS).map(Number).sort((a, b) => a - b);
  const minSize = sizes[0];
  const maxSize = sizes[sizes.length - 1];

  // Extrapolate below minimum
  if (dieSize < minSize) {
    const ratio = (HP_RECOMMENDATIONS[sizes[1]] - HP_RECOMMENDATIONS[sizes[0]]) / (sizes[1] - sizes[0]);
    return Math.max(50, Math.round(HP_RECOMMENDATIONS[minSize] + ratio * (dieSize - minSize)));
  }

  // Extrapolate above maximum
  if (dieSize > maxSize) {
    const ratio = (HP_RECOMMENDATIONS[sizes[sizes.length - 1]] - HP_RECOMMENDATIONS[sizes[sizes.length - 2]]) / (sizes[sizes.length - 1] - sizes[sizes.length - 2]);
    return Math.round(HP_RECOMMENDATIONS[maxSize] + ratio * (dieSize - maxSize));
  }

  // Linear interpolation for intermediate values
  for (let i = 0; i < sizes.length - 1; i++) {
    if (dieSize > sizes[i] && dieSize < sizes[i + 1]) {
      const ratio = (dieSize - sizes[i]) / (sizes[i + 1] - sizes[i]);
      return Math.round(
        HP_RECOMMENDATIONS[sizes[i]] +
        ratio * (HP_RECOMMENDATIONS[sizes[i + 1]] - HP_RECOMMENDATIONS[sizes[i]])
      );
    }
  }

  return HP_RECOMMENDATIONS[6]; // Default fallback
}

export const CATEGORIES = [
  'Push',
  'Pull',
  'Squat/Hinge',
  'Lunge',
  'Core',
  'Cardio'
];

// Shared Core exercises used by multiple subclasses
const SHARED_CORE_EXERCISES = [
  'Bodyweight Knee Shield Block',
  'Bodyweight Sit Up',
  'Bodyweight Knee Raise',
  'Bodyweight Lower Back Extensions',
  'Bodyweight Upper Back Extensions',
  'Bodyweight Bench V-sit ups',
  'Bodyweight Bench Mountain Climbers', 
  'Bodyweight Crossover Sit Up',
  'Bodyweight Flutter Kicks',
  'Bodyweight Sit Up Twist',
  'Bodyweight Sit Up Jab Cross',
  'Bodyweight Bicycle Sit Up',
  'Bodyweight Leg Raise',
  'Bodyweight Big Step Mountain Climbers',
  'Bodyweight Side to Side Mountain Climbers',
  'Bodyweight Full Row Sit Up',
  'Bodyweight V-Sit Up',
  'Bodyweight Hanging Knee Raise',
  'Bodyweight Hanging Oblique Raise',
  'Bodyweight Hanging Leg Raise'
];

// Subclass definitions
export const SUBCLASSES = {
  ranger: {
    name: 'Ranger',
    equipment: 'Bodyweight',
    exercises: {
      Push: [
        'Bodyweight Bench Push Up',
        'Bodyweight Push Up',
        'Bodyweight Close Grip Push Up',
        'Bodyweight Side to Side Push Ups',
        'Bodyweight Blast Off Push Up',
        'Push Up with Forward Reach',
        'T-Push Up',
        'Bodyweight Shoulder Press Push Up',
        'Bodyweight Ring Push Up',
        'Bodyweight Ring Skull Crusher',
        'Bodyweight Ring Chest Flys',
        'Bodyweight Dive Bomber Push Up'
      ],
      Pull: [
        'Bodyweight Dead Hangs',
        'Bodyweight Ring Neutral Grip Row',
        'Bodyweight Ring Pronated Row',
        'Bodyweight Ring Supinated Row',
        'Bodyweight Ring Mixed Grip Row',
        'Bodyweight Ring Reverse Fly',
        'Scapular Pull Up',
        'Bodyweight Ring Face Curls',
        'Bodyweight Ring Face Pulls',
        'Bodyweight Chin Ups',
        'Bodyweight Pull Ups',
        'Bodyweight Mixed Grip Pull Ups'
      ],
      'Squat/Hinge': [
        'Bodyweight Bench Squat',
        'Bodyweight Squat',
        'Bodyweight Single RDL',
        'Bodyweight Cardio Ski Squats',
        'Bodyweight Squat with Diagonal Punch', 
        'Bodyweight Squat with Rotation Jump', 
        'Bodyweight Squat Duck Unders',
        'Bodyweight Hammar Squat',
        'Bodyweight Squat with Knee Strike',
        'Bodyweight Split Squat',
        'Bodyweight Single RDL with Knee Strike', 
        'Bodyweight Squat Jumps'
      ],
      Lunge: [
        'Bodyweight Reverse Lunge',
        'Bodyweight Forward Lunge',
        'Bodyweight Lateral Lunge',
        'Bodyweight Bench Step Ups',
        'Bodyweight Cardio Running Start Lunge', 
        'Bodyweight Rotation Lunge with Punch', 
        'Bodyweight Reverse Lunge With Punch',
        'Bodyweight Forward Lunge With Punch',
        'Bodyweight Rotation Lunge with Punch', // Duplicate!!
        'Bodyweight Reverse Lunge with Knee Strike',
        'Bodyweight Forward Lunge With Knee Strike',
        'Bodyweight Alternating Lunge Jumps'
      ],
      Core: SHARED_CORE_EXERCISES
    }
  },
  barbarian: {
    name: 'Barbarian',
    equipment: 'Hammer/Mace',
    exercises: {
      Push: [
        'Hammer Floor Press',
        'Hammer Vertical Strike',
        'Hammer Shoulder Press',
        'Hammer Lateral Raise',
        'Hammer Single Arm Press',
        'Hammer Pronated Grip Push Up',
        'Hammer Head Push Up',
        'Hammer Grip Push Up',
        'Hammer Mixed Grip Push Up',
        'Hammer Push up to Pass Over',
        'Hammer Head Side to Side Push Up',
        'Hammer Push Up to Renegade Row',
        'Hammer Push Up to T-Raise',
        'Hammer Grip side to Side Push Up'
      ],
      Pull: [
        'Hammer Supinated Curl',
        'Hammer Slams',
        'Hammer Oared Row',
        'Hammer Alternating 3 Curl',
        'Hammer Alternating Rotation',
        'Hammer Upright Row',
        'Hammer Cross Body Row',
        'Hammer Pendulum Swing',
        'Hammer Alternating Upright Row',
        'Hammer Rotation Strike',
        'Hammer Upwards Strike',
        'Hammer Uppercut Strike',
        'Hammer Alternating Up Strike',
        'Hammer Rotation Strike'
      ],
      'Squat/Hinge': [
        'Hammer Deadlift',
        'Hammer Alternating Deadlift Pass',
        'Hammer Shouldered Squat',
        'Hammer Single Leg Deadlift',
        'Hammer Single Leg Deadlift Clean',
        'Hammer Front Hold Squat',
        'Hammer Squat w/ Vertical Strike',
        'Hammer Snatch',
        'Hammer Squat w/ rotation',
        'Hammer Single Leg Deadlift Clean',
        'Hammer Strike Squat',
        'Hammer Alternating Ready Pass Squat', 
        'Hammer Alternating Pass Squat'
      ],
      Lunge: [
        'Hammer Shouldered Reverse Lunge',
        'Hammer Shouldered Forward Lunge',
        'Hammer Shouldered Side Lunge',
        'Hammer Hold Forward Lunge',
        'Hammer Hold Side Lunge',
        'Hammer Ready Pass Forward Lunge',
        'Hammer Ready Pass Side Lunge',
        'Hammer Pass Forward Lunge',
        'Hammer Pass Reverse Lunge',
        'Hammer Alternating Pass Forward Lunge', 
        'Hammer Floor Strike Pass Side Lunge',
        'Hammer Front Hold Reverse Lunge',
        'Hammer Front Hold Forward Lunge',
        'Hammer Front Hold Side Lunge',
        'Hammer Strike Reverse Lunge',
        'Hammer Strike Forward Lunge',
        'Hammer Reverse Lunge w/ Rotation',
        'Hammer Forward Lunge w/ Rotation',
        'Hammer Reverse Lunge w/ Vertical Strike',
        'Hammer Forward Lunge w/ Vertical Strike'
      ],
      Core: SHARED_CORE_EXERCISES
    }
  },
  fighter: {
    name: 'Fighter',
    equipment: 'Single Dumbbell',
    exercises: {
      Push: [
        'Single Dumbbell Chest Press Bash',
        'Single Dumbbell Overhead Press',
        'Two Arm Standing Dumbbell Tricep Extension', 
        'Single Dumbbell Halos',
        'Single Dumbbell Close Grip Push Up',
        'Standing One Arm Dumbbell Tricep Extension', 
        'Single Dumbbell Push Up to Weapon Pass',
        'Single Dumbbell Side to Side Push Up',
        'Dumbbell Sit Up Press',
        'Single Dumbbell Push Up to Forward Reach',
        'Single Dumbbell Push Up to Renegade Row', 
        'Single Dumbbell Push Up to T-Raise'
      ],
      Pull: [
        'Single Dumbbell Alternating Bicep Curl',
        'Single Dumbbell Alternating Bent Over Row',
        'Single Dumbbell Horizontal Rotation',
        'Single Dumbbell Cross Body Swing',
        'Single Dumbbell Diagonal Rotation Strike',
        'Single Dumbbell High Face Pulls',
        'Single Dumbbell Oared Row',
        'Single Dumbbell Alternating Bent Over Row Catch',
        'Single Dumbbell High Row',
        'Single Dumbbell Alternating Reverse Fly',
        'Single Dumbbell Alternating Lateral Raise',
        'Single Dumbbell Alternating Snatch'
      ],
      'Squat/Hinge': [
        'Single Dumbbell Swing',
        'Single Dumbbell Goblet Squat',
        'Single Dumbbell Alternating Swing',
        'Single Dumbbell Alternating RDL',
        'Single Dumbbell Alternating Power Cleans',
        'Single Dumbbell Loot Carry Squat',
        'Single Dumbbell Hammer Squat',
        'Single Dumbbell RDL Clean',
        'Single Dumbbell Halo Squat',
        'Single Dumbbell Loot Carry Squat w/ Rotation',
        'Single Dumbbell Loot Carry Squat w/ Knee Strike',
        'Single Dumbbell Chest Thruster'
      ],
      Lunge: [
        'Single Dumbbell Pass Alternating Reverse Lunge',
        'Single Dumbbell Pass Alternating Forward Lunge',
        'Single Dumbbell Alternating Side Lunge',
        'Single Dumbbell Loot Carry Reverse Lunge',
        'Single Dumbbell Loot Carry Forward Lunge',
        'Single Dumbbell Loot Carry Alternating Side Lunge',
        'Single Dumbbell Loot Carry Forward Lunge w/ Rotation',
        'Single Dumbbell Loot Carry Reverse Lunge w/ Rotation',
        'Single Dumbbell Reverse Lunge w/ Knee Strike',
        'Single Dumbbell Forward Lunge w/ Knee Strike',
        'Single Dumbbell Overhead Reverse Lunge',
        'Single Dumbbell Overhead Forward Lunge'
      ],
      Core: SHARED_CORE_EXERCISES
    }
  },
  grappler: {
    name: 'Grappler',
    equipment: 'Sandbag',
    exercises: {
      Push: [
        'Sandbag Floor Press',
        'Sandbag Crusher Grip Floor Press',
        'Sandbag Overhead Press',
        'Sandbag Neutral Grip Press',
        'Sandbag Alternating Shouldered Press',
        'Sandbag Neutral Grip Push Up',
        'Sandbag Crusher Grip Push Up',
        'Sandbag Overhead Tricep Extension',
        'Sandbag Skull Crusher',
        'Sandbag Side to Side Push Up',
        'Sandbag Push Up to Drag Over',
        'Sandbag Hit the Deck Up'
      ],
      Pull: [
        'Sandbag Pull Over',
        'Sandbag Pronated Grip Bent Over Row',
        'Sandbag Bent Over Neutral Grip Row',
        'Sandbag Wide Grip Bent Over Row',
        'Sandbag Upright Row',
        'Sandbag Oared Row',
        'Sandbag Zercher Curls',
        'Sandbag Hammer Curl',
        'Sandbag Supinated Bicep Curl',
        'Sandbag Crusher Grip Curl',
        'Sandbag Push Up to Bent Over Row',
        'Sandbag Hit the Deck Up Power Clean'
      ],
      'Squat/Hinge': [
        'Sandbag Swing',
        'Sandbag Deadlift',
        'Sandbag Zercher Good Morning',
        'Sandbag Back Squat',
        'Sandbag Zercher Squat',
        'Sandbag Crusher Grip Swing',
        'Sandbag Bearhug Good Morning',
        'Sandbag Shouldered Squat',
        'Sandbag Front Squat',
        'Sandbag Back Rack Good Morning',
        'Sandbag Bearhug Squat',
        'Sandbag Squat Clean'
      ],
      Lunge: [
        'Sandbag Back Rack Reverse Lunges',
        'Sandbag Back Rack Forward Lunge',
        'Sandbag Back Rack Forward Lunge',
        'Sandbag Back Rack Side Lunge',
        'Sandbag Front Rack Forward Lunge',
        'Sandbag Front Rack Reverse Lunge',
        'Sandbag Shouldered Forward Lunge',
        'Sandbag Front Rack Side Lunges (1)',
        'Sandbag Shouldered Reverse Lunge',
        'Sandbag Zercher Reverse Lunge',
        'Sandbag Zercher Forward Lunge',
        'Sandbag Zercher Side Lunge',
        'Sandbag Bearhug Forward Lunge',
        'Sandbag Bearhug Reverse Lunge'
      ],
      Core: SHARED_CORE_EXERCISES
    }
  },
  guardian: {
    name: 'Guardian',
    equipment: 'Weight Plate',
    exercises: {
      Push: [
        'Shield Chest Bash',
        'Shield Overhead Press',
        'Shield Overhead Tricep Extension',
        'Shield Ship Turners',
        'Shield Side Raise',
        'Shield Rotation Bash',
        'Shield Diagonal Bash',
        'Shield Single Arm Shoulder Press',
        'Shield Push Ups',
        'Shield Side to Side Push Ups',
        'Shield Weighted Push Up',
        'Shield Plate to Ground Push Up'
      ],
      Pull: [
        'Shield Bent Over Row',
        'Shield Bicep Curl',
        'Shield Supinated Grip Curl',
        'Shield Halos',
        'Shield Alternating Bent Over Row',
        'Shield Hold Rotation',
        'Shield Single Arm Bent Over Row',
        'Shield Single Arm Bicep Curl',
        'Shield Bent over Rear Fly',
        'Shield Renegade Row',
        'Shield Renegade Iso Row Hold',
        'Shield Renegade Rear Delt Fly'
      ],
      'Squat/Hinge': [
        'Shield Deadlift',
        'Shield Half Swing',
        'Shield Back Squat',
        'Shield Full Swing',
        'Shield Hip Thrust',
        'Shield Hold Squat',
        'Shield Single Leg RDL',
        'Shield Back Rack Single Leg RDL',
        'Shield Ground to Overhead',
        'Shield Squat w/ Knee Strike',
        'Shield Squat w/ Twist Hop',
        'Shield Thruster'
      ],
      Lunge: [
        'Shield Back Rack Reverse Lunge',
        'Shield Back Rack Forward Lunge',
        'Shield Back Rack Side Lunge',
        'Shield Side Hold Forward Lunge',
        'Shield Side Hold Reverse Lunge',
        'Shield Single Arm Side Lunge',
        'Shield Hold Reverse Lunge',
        'Shield Hold Forward Lunge',
        'Shield Reverse Lunge w/ knee Strike',
        'Shield Reverse Lunge w/ rotation',
        'Shield Slam Reverse Lunge',
        'Shield Slam Forward Lunge'
      ],
      Core: SHARED_CORE_EXERCISES
    }
  },
  berserker: {
    name: 'Berserker',
    equipment: 'Kettlebell',
    exercises: {
      Push: [
        'Kettlebell Floor Press', 
        'Kettlebell Seated Overhead Tricep Extension',
        'Kettlebell Crusher Grip Push Up',
        'Kettlebell Single Arm Press',
        'Kettlebell Power Clean and Press',
        'Kettlebell Skull Crusher',
        'Kettlebell Push Press',
        'Kettlebell Kneeling Press',
        'Kettlebell Seated Press',
        'Kettlebell Push Up',
        'Kettlebell Push Up w/ Pass Through',
        'Kettlebell Lift Off Push Up'
      ],
      Pull: [
        'Kettlebell Pull Over',
        'Kettlebell Crusher Grip Curl',
        'Kettlebell Hammer Curl',
        'Kettlebell Face Curl Swing',
        'Kettlebell High Row',
        'Kettlebell Oared Row',
        'Kettlebell Crusher Grip Row',
        'Kettlebell Alternating Bent Over Row',
        'Kettlebell Single Arm High Row',
        'Kettlebell Kneeling High Row',
        'Kettlebell Single Arm Power Clean',
        'Kettlebell Single Arm Snatch'
      ],
      'Squat/Hinge': [
        'Kettlebell Crusher Grip Thruster',
        'Kettlebell Thruster',
        'Kettlebell Full Swing',
        'Kettlebell Swing',
        'Kettlebell Deadlift',
        'Kettlebell Alternating Single Arm Swing',
        'Kettlebell Alternating High Row Catch',
        'Kettlebell Goblet Squat',
        'Kettlebell Front Rack Squat',
        'Kettlebell Single Arm Squat Clean',
        'Kettlebell Loot Carry RDL',
        'Kettlebell Thruster'
      ],
      Lunge: [
        'Kettlebell Alternating Forward Lunge',
        'Kettlebell Alternating Reverse Lunge',
        'Kettlebell Alternating Side Lunge',
        'Kettlebell Goblet Reverse Lunge',
        'Kettlebell Goblet Forward Lunge',
        'Kettlebell Goblet Side Lunge',
        'Kettlebell Front Rack Reverse Lunge',
        'Kettlebell Front Rack Forward Lunge',
        'Kettlebell Crusher Grip Reverse Lunge',
        'Kettlebell Crusher Grip Forward Lunge',
        'Kettlebell Crusher Grip Reverse Lunge w/ Knee'
      ],
      Core: SHARED_CORE_EXERCISES
    }
  },
  wheelchair: {
    name: 'Combat Wheelchair',
    equipment: 'DB/Band/Weapon',
    defaultTemplate: [
      { category: 'Push', count: 2 },
      { category: 'Pull', count: 2 },
      { category: 'Cardio', count: 1 }
    ],
    exercises: {
      Push: [
        'Seated Dumbbell Overhead Tricep Extension',
        'Seated Dumbbell Lateral Raise',
        'Seated Dumbbell Skull Crusher',
        'Seated Dumbbell Wide Grip Shoulder Press',
        'Seated Dumbbell Narrow Grip Shoulder Press',
        'Seated Dumbbell Arnold Press',
        'Seated Dumbbell Rotation Press',
        'Seated Banded Front Tricep Push Down',
        'Seated Banded Downward Fly',
        'Seated Banded Shoulder External Rotation',
        'Seated Banded Chest Fly',
        'Seated Banded Chest Press'
      ],
      Pull: [
        'Seated Dumbbell Hammer Curl',
        'Seated Dumbbell Reverse Curl',
        'Seated Dumbbell Supinated Curl',
        'Seated Neutral Grip Sword and Shield Curls',
        'Seated Dumbbell Neutral Grip Snatch',
        'Seated Dumbbell Pronated Grip Snatch',
        'Seated Banded Pronated Grip Row',
        'Seated Banded Supinated Grip Row',
        'Seated Banded Neutral Grip Row',
        'Seated Banded Rear Delt Fly',
        'Seated Banded Ski Pull Downs',
        'Seated Banded Reverse Fly'
      ],
      'Squat/Hinge': [],  // No leg exercises for wheelchair
      Lunge: [],  // No leg exercises for wheelchair
      Core: [],  // No core for wheelchair
      Cardio: [
        'Seated Weapon Up Down Diagonal Strike',
        'Seated Weapon Alternating High Strike',
        'Seated Weapon Alternating Overhead Side Strike',
        'Seated Weapon Alternating Side Strike',
        'Seated Weapon Flourish',
        'Seated Weapon One Handed Thrust',
        'Seated Weapon Overhead Long Strike',
        'Seated Weapon Diagonal Upwards Long Strike',
        'Seated Weapon Horizontal Long Strike',
        'Seated Weapon Diagonal Long Strike'
      ]
    }
  },
  battleseer: {
    name: 'Battleseer',
    equipment: 'Staff',
    defaultTemplate: [
      { category: 'Upper Body', count: 2 },
      { category: 'Lower Body', count: 2 },
      { category: 'Cardio', count: 1 },
      { category: 'Core', count: 1 }
    ],
    exercises: {
      'Upper Body': [
        'Staff Side Thrust',
        'Staff Alternating Diagonal Downward Strike',
        'Staff Alternating Side Thrust',
        'Staff Side Overhand Grip Thrust',
        'Staff Squared Alternating Horizontal Strike',
        'Staff Squared Alternating High Strike',
        'Staff Assisted Chest Press',
        'Staff Squared Chest Strike',
        'Staff Alternating Slash Strike',
        'Staff Squared Floor Strike',
        'Staff Front Spin',
        'Staff Hammer Strike',
        'Staff Side Stance Overhead High Strike',
        'Staff Windmills',
        'Staff Diagonal Downward Strike',
        'Staff Diagonal Upward Strike',
        'Staff Pronated Curl and Press',
        'Staff Wrist Pronation Supination',
        'Staff Underhand Front Raise',
        'Staff Front Raise'
      ],
      'Lower Body': [
        'Staff Ready Forward Step',
        'Staff Ready Back Step',
        'Staff Ready Side Step',
        'Staff Assisted Reverse Lunge',
        'Staff Assisted Side Lunge',
        'Staff Assisted Good Morning',
        'Staff Assisted Leg Abduction',
        'Staff Assisted Leg Raise',
        'Staff Assisted Squat',
        'Staff Assisted Single Leg RDL',
        'Staff Assisted Squat Hold',
        'Staff Assisted Lunge Hold'
      ],
      Core: SHARED_CORE_EXERCISES,
      Cardio: [
        'Staff Assisted March',
        'Staff Overhead March',
        'Staff Back Rack March',
        'Staff Readied March',
        'Staff Shoudldered March',
        'Staff Front Hold March',
        'Staff Loot Carry March',
        'Staff Chest Hold March'
      ]
    }
  }
};

// Get available categories for a subclass (categories that have exercises)
export function getAvailableCategories(subclass) {
  const sub = SUBCLASSES[subclass];
  if (!sub) return CATEGORIES;

  // Return all category keys that have exercises
  return Object.keys(sub.exercises).filter(cat =>
    sub.exercises[cat] && sub.exercises[cat].length > 0
  );
}

// Get subclasses that have a given category available
export function getSubclassesForCategory(subclasses, category) {
  return subclasses.filter(key => getAvailableCategories(key).includes(category));
}

export const DEFAULT_ROUND_TEMPLATE = [
  { category: 'Push', count: 1 },
  { category: 'Pull', count: 1 },
  { category: 'Squat/Hinge', count: 1 },
  { category: 'Lunge', count: 1 },
  { category: 'Core', count: 1 }
];

// Default session configuration
export const DEFAULT_SESSION_CONFIG = {
  subclasses: ['ranger'],
  multiclass: false,
  exerciseDie: 6,
  repDie: 6,
  diceLocked: true,
  hpThreshold: 150,
  roundTemplate: DEFAULT_ROUND_TEMPLATE,
  rollMode: 'all-at-once',
  repMode: 'fixed',
  advancedDiceMode: false,
  categoryDice: {} // { categoryName: { exerciseDie: number, repDie: number } }
};

// Get recommended HP for advanced dice mode (average of all rep dice, rounded)
export function getRecommendedHPAdvanced(categoryDice) {
  if (!categoryDice || Object.keys(categoryDice).length === 0) {
    return HP_RECOMMENDATIONS[6]; // Default fallback
  }

  let totalRepDice = 0;
  let count = 0;

  for (const key of Object.keys(categoryDice)) {
    const dice = categoryDice[key];
    if (dice && dice.repDie) {
      totalRepDice += dice.repDie;
      count++;
    }
  }

  if (count === 0) return HP_RECOMMENDATIONS[6];

  const averageRepDie = Math.round(totalRepDice / count);
  return getRecommendedHP(averageRepDie);
}

// Storage key for user preferences (persisted across sessions)
export const PREFS_STORAGE_KEY = 'wyrd-workout-prefs';

// Storage key for localStorage
export const STORAGE_KEY = 'wyrd-workout-session';
