// Wyrd Workout - Constants and Data Model

export const DIE_SIZES = [4, 6, 8, 10, 12, 14, 16, 18, 20];

export const HP_RECOMMENDATIONS = {
  4: 100,
  6: 150,
  8: 200,
  10: 250,
  12: 300,
  14: 350,
  16: 425,
  18: 475,
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

// Generate placeholder exercises for a category
function generatePlaceholderExercises(category, count = 20) {
  const exercises = [];
  for (let i = 1; i <= count; i++) {
    exercises.push(`${category} ${i}`);
  }
  return exercises;
}

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
        'Bodyweight Ring Shoulder Press'
      ],
      Pull: [
        'Bodyweight Dead Hangs',
        'Bodyweight Ring Neutral Grip Row',
        'Bodyweight Ring Pronated Row',
        'Bodyweight Ring Supinated Row',
        'Bodyweight Ring Mixed Grip Row',
        'Pull Up Shrug',
        'Bodyweight Ring Reverse Fly',
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
        'Bodyweight Squat With Rotation Jump', 
        'Bodyweight Squat Duck Unders',
        'Bodyweight Hammar Squat',
        'Bodyweight Squat With Knee Strike',
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
      Core: SHARED_CORE_EXERCISES,
      Cardio: generatePlaceholderExercises('Bodyweight Cardio')
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
        'Hammer Alternating Deadlift pass',
        'Hammer Shouldered Squat',
        'Hammer Single Leg Deadlift',
        'Hammer Single Leg Deadlift Clean',
        'Hammer Front Hold Squat',
        'Hammer Squat W/ Vertical Strike',
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
        'Hammer Reverse Lunge w/ rotation',
        'Hammer Forward Lunge w/ rotation',
        'Hammer Reverse Lunge w/ Vertical Strike',
        'Hammer Forward Lunge w/ Vertical Strike'
      ],
      Core: SHARED_CORE_EXERCISES,
      Cardio: generatePlaceholderExercises('Hammer Cardio')
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
        'Single Dumbbell Forward Lunge w/ Knee Strike'
      ],
      Core: SHARED_CORE_EXERCISES,
      Cardio: generatePlaceholderExercises('Dumbbell Cardio')
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
      Core: SHARED_CORE_EXERCISES,
      Cardio: generatePlaceholderExercises('Sandbag Cardio')
    }
  },
  guardian: {
    name: 'Guardian',
    equipment: 'Weight Plate',
    exercises: {
      Push: [
        'Shield Overhead Press',
        'Shield Overhead Tricep Extension',
        'Shield Ship Turners',
        'Shield Rotation Bash',
        'Shield Diagonal Bash',
        'Shield Push Ups',
        'Shield Side to Side Push Ups',
        'Shield Weighted Push Up'
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
        'Shield Ground to Overhead',
        'Shield Squat w_Knee strike',
        'Shield Squat W/ twist hop',
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
      Core: SHARED_CORE_EXERCISES,
      Cardio: generatePlaceholderExercises('Shield Cardio')
    }
  },
  berserker: {
    name: 'Berserker',
    equipment: 'Kettlebell',
    exercises: {
      Push: [
        'KB Floor Press', 'KB Bench Press', 'Single KB Floor Press', 'KB Push Press',
        'KB Strict Press', 'KB Arnold Press', 'KB Seesaw Press', 'KB Bottom-up Press',
        'KB Crush Press', 'KB Fly', 'KB Skull Crusher', 'KB Dip',
        'KB Push-up', 'KB Diamond Push-up', 'KB Archer Push-up', 'KB Thruster',
        'Double KB Thruster', 'KB Jerk', 'Double KB Jerk', 'KB Long Cycle'
      ],
      Pull: [
        'KB Row', 'Single Arm KB Row', 'KB Gorilla Row', 'KB High Pull',
        'KB Upright Row', 'KB Shrug', 'KB Reverse Fly', 'KB Face Pull',
        'KB Curl', 'KB Hammer Curl', 'KB Clean', 'Double KB Clean',
        'KB Snatch', 'KB Dead Clean', 'KB Renegade Row', 'KB Rotational Row',
        'KB Pullover', 'KB Around the World', 'KB Figure 8', 'KB Muscle Snatch'
      ],
      'Squat/Hinge': [
        'KB Goblet Squat', 'KB Front Squat', 'Double KB Front Squat', 'KB Sumo Squat',
        'KB Deadlift', 'KB Swing', 'KB Single Arm Swing', 'KB Russian Swing',
        'KB American Swing', 'KB RDL', 'KB Single Leg RDL', 'KB Clean and Squat',
        'KB Snatch', 'KB Pistol Squat', 'KB Cossack Squat', 'KB Jump Squat',
        'Double KB Swing', 'KB Swing to Squat', 'KB Dead Snatch', 'KB Squat Snatch'
      ],
      Lunge: [
        'KB Reverse Lunge', 'KB Forward Lunge', 'KB Walking Lunge', 'KB Lateral Lunge',
        'KB Rack Lunge', 'KB Overhead Lunge', 'KB Pass Through Lunge', 'KB Step-up',
        'KB Deficit Lunge', 'KB Jump Lunge', 'KB Curtsy Lunge', 'KB Clock Lunge',
        'KB Suitcase Lunge', 'KB Front Rack Step-up', 'KB Crossover Lunge', 'KB Box Jump',
        'Double KB Lunge', 'KB Lunge to Press', 'KB Drop Lunge', 'KB Plyo Step-up'
      ],
      Core: [
        'KB Dead Bug', 'KB Russian Twist', 'KB Sit-up', 'KB Windmill',
        'KB Turkish Get-up', 'KB Side Bend', 'KB Woodchop', 'KB Halo',
        'KB Around the World', 'KB Figure 8', 'KB Plank Pull Through', 'KB Drag',
        'KB Hot Potato', 'KB Single Arm Carry', 'KB Rack Walk', 'KB Overhead Carry',
        'KB Suitcase Carry', 'KB Farmers Walk', 'KB Bottoms Up Carry', 'KB Waiter Walk'
      ],
      Cardio: [
        'KB Swing', 'KB High Pull', 'KB Snatch', 'KB Clean and Press',
        'KB Thruster', 'KB Long Cycle', 'KB Man Maker', 'KB Burpee',
        'KB Jump Squat', 'KB Mountain Climber', 'KB Skater', 'KB Bear Crawl',
        'KB Complex', 'KB EMOM Circuit', 'Double KB Complex', 'KB Flow',
        'KB Sport Snatch', 'KB Jerk', 'KB Half Snatch', 'KB Biathlon'
      ]
    }
  },
  archer: {
    name: 'Archer',
    equipment: 'Resistance Band',
    exercises: {
      Push: generatePlaceholderExercises('Band Push'),
      Pull: generatePlaceholderExercises('Band Pull'),
      'Squat/Hinge': generatePlaceholderExercises('Band Squat'),
      Lunge: generatePlaceholderExercises('Band Lunge'),
      Core: generatePlaceholderExercises('Band Core'),
      Cardio: generatePlaceholderExercises('Band Cardio')
    }
  },
  wheelchair: {
    name: 'Combat Wheelchair',
    equipment: 'DB/Band/Weapon',
    exercises: {
      Push: [
        'Seated Dumbbell Overhead Tricep Extension',
        'Seated Dumbbell Lateral Raise',
        'Seated Dumbbell Skull Crusher',
        'Seated Dumbbell Wide Grip Shoulder Press',
        'Seated Narrow Grip Shoulder Press',
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
    // Note: Battleseer uses different category names
    categoryMapping: {
      'Push': 'Upper Body',
      'Pull': null,  // No separate Pull - merged into Upper Body
      'Squat/Hinge': 'Lower Body',
      'Lunge': null,  // No separate Lunge - merged into Lower Body
      'Core': 'Core (Optional)',
      'Cardio': 'Cardio'
    },
    exercises: {
      Push: [  // Actually "Upper Body"
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
      Pull: [],  // No separate Pull for Battleseer
      'Squat/Hinge': [  // Actually "Lower Body"
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
      Lunge: [],  // No separate Lunge for Battleseer
      Core: SHARED_CORE_EXERCISES,
      Cardio: [
        'Staff Assisted March',
        'Staff Overhead March',
        'Staff Back Rack March',
        'Staff Assisted March'
      ]
    }
  }
};

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
  repMode: 'fixed'
};

// Storage key for user preferences (persisted across sessions)
export const PREFS_STORAGE_KEY = 'wyrd-workout-prefs';

// Storage key for localStorage
export const STORAGE_KEY = 'wyrd-workout-session';
