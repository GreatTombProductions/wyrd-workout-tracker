// Wyrd Workout - Constants and Data Model

export const DIE_SIZES = [4, 6, 8, 10, 12, 20];

export const HP_RECOMMENDATIONS = {
  4: 100,
  6: 150,
  8: 200,
  10: 250,
  12: 300,
  20: 550
};

// Interpolate HP for any die size
export function getRecommendedHP(dieSize) {
  if (HP_RECOMMENDATIONS[dieSize]) {
    return HP_RECOMMENDATIONS[dieSize];
  }
  // Linear interpolation for intermediate values
  const sizes = Object.keys(HP_RECOMMENDATIONS).map(Number).sort((a, b) => a - b);
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

// Generate placeholder exercises for a category
function generatePlaceholderExercises(category, count = 20) {
  const exercises = [];
  for (let i = 1; i <= count; i++) {
    exercises.push(`${category} ${i}`);
  }
  return exercises;
}

// Subclass definitions with placeholder exercises
export const SUBCLASSES = {
  ranger: {
    name: 'Ranger',
    equipment: 'Bodyweight',
    exercises: {
      Push: [
        'Push-up', 'Wide Push-up', 'Diamond Push-up', 'Incline Push-up',
        'Decline Push-up', 'Pike Push-up', 'Archer Push-up', 'Staggered Push-up',
        'Spiderman Push-up', 'T Push-up', 'Clap Push-up', 'Pseudo Planche Push-up',
        'One-arm Incline Push-up', 'Dive Bomber', 'Hindu Push-up', 'Typewriter Push-up',
        'Plyometric Push-up', 'Elevated Pike Push-up', 'Archer to Diamond', 'One-arm Push-up'
      ],
      Pull: [
        'Inverted Row', 'Doorframe Row', 'Table Row', 'Bed Sheet Row',
        'Towel Row', 'Let Me Ins', 'Scapular Pulls', 'Negative Pull-up',
        'Chin-up', 'Pull-up', 'Wide Pull-up', 'Close Grip Pull-up',
        'Commando Pull-up', 'L-sit Pull-up', 'Archer Pull-up', 'Typewriter Pull-up',
        'Clap Pull-up', 'Muscle-up Negative', 'One-arm Chin Negative', 'Muscle-up'
      ],
      'Squat/Hinge': [
        'Bodyweight Squat', 'Prisoner Squat', 'Sumo Squat', 'Narrow Squat',
        'Pause Squat', 'Pulse Squat', 'Jump Squat', 'Bulgarian Split Squat',
        'Pistol Box Squat', 'Cossack Squat', 'Shrimp Squat', 'Skater Squat',
        'Dragon Squat', 'Natural Leg Curl', 'Nordic Curl Negative', 'Pistol Squat',
        'Jumping Pistol', 'Advanced Shrimp', 'Sissy Squat', 'Natural One-leg Curl'
      ],
      Lunge: [
        'Reverse Lunge', 'Forward Lunge', 'Walking Lunge', 'Lateral Lunge',
        'Curtsy Lunge', 'Pulse Lunge', 'Clock Lunge', 'Pendulum Lunge',
        'Jump Lunge', 'Deficit Lunge', 'Step-up', 'High Step-up',
        'Box Jump', 'Broad Jump', 'Single Leg Bound', 'Depth Jump',
        'Lateral Bound', 'Skater Jump', 'Plyo Lunge', 'Max Height Box Jump'
      ],
      Core: [
        'Dead Bug', 'Bird Dog', 'Plank', 'Side Plank',
        'Hollow Hold', 'Boat Hold', 'Bicycle Crunch', 'Mountain Climber',
        'Lying Leg Raise', 'Hanging Knee Raise', 'V-up', 'Tuck-up',
        'Dragon Flag Negative', 'Hanging Leg Raise', 'Windshield Wiper', 'L-sit',
        'Ab Wheel Rollout', 'Dragon Flag', 'Front Lever Raise', 'Human Flag Hold'
      ],
      Cardio: [
        'March in Place', 'High Knees', 'Butt Kicks', 'Jumping Jacks',
        'Seal Jacks', 'Mountain Climbers', 'Fast Feet', 'Tuck Jumps',
        'Burpee', 'Jump Squat', 'Lateral Shuffle', 'Speed Skaters',
        'Star Jump', 'Plyo Push-up Burpee', 'Double Under', 'Box Jump Burpee',
        'Sprawl', 'Man Maker', 'Devil Press', 'Burpee Broad Jump'
      ]
    }
  },
  barbarian: {
    name: 'Barbarian',
    equipment: 'Hammer/Mace',
    exercises: {
      Push: generatePlaceholderExercises('Hammer Push'),
      Pull: generatePlaceholderExercises('Hammer Pull'),
      'Squat/Hinge': generatePlaceholderExercises('Hammer Squat'),
      Lunge: generatePlaceholderExercises('Hammer Lunge'),
      Core: generatePlaceholderExercises('Hammer Core'),
      Cardio: generatePlaceholderExercises('Hammer Cardio')
    }
  },
  fighter: {
    name: 'Fighter',
    equipment: 'Dumbbell',
    exercises: {
      Push: [
        'DB Floor Press', 'DB Bench Press', 'DB Incline Press', 'DB Squeeze Press',
        'Single Arm DB Press', 'DB Arnold Press', 'DB Shoulder Press', 'DB Push Press',
        'DB Incline Fly', 'DB Chest Fly', 'DB Skull Crusher', 'DB Kickback',
        'DB Close Grip Press', 'Single Arm Push Press', 'DB Svend Press', 'Renegade Row to Press',
        'DB Thruster', 'Single Arm Thruster', 'DB Man Maker', 'Single Arm Devil Press'
      ],
      Pull: [
        'DB Bent Row', 'Single Arm DB Row', 'DB Gorilla Row', 'Chest Supported DB Row',
        'DB Seal Row', 'DB High Pull', 'DB Upright Row', 'DB Shrug',
        'DB Reverse Fly', 'DB Face Pull', 'DB Bicep Curl', 'DB Hammer Curl',
        'DB Concentration Curl', 'DB Preacher Curl', 'DB Zottman Curl', 'DB Renegade Row',
        'Single Arm High Pull', 'DB Clean', 'DB Snatch', 'DB Muscle Snatch'
      ],
      'Squat/Hinge': [
        'DB Goblet Squat', 'DB Front Squat', 'DB Sumo Squat', 'DB Bulgarian Split Squat',
        'DB RDL', 'Single Leg DB RDL', 'DB Stiff Leg Deadlift', 'DB Good Morning',
        'DB Swing', 'DB Snatch', 'DB Clean', 'DB Thruster',
        'DB Goblet Cossack Squat', 'DB Pistol Squat', 'DB Jump Squat', 'DB Single Leg Deadlift',
        'DB Deficit RDL', 'DB Hang Clean', 'DB Power Clean', 'DB Squat Clean'
      ],
      Lunge: [
        'DB Reverse Lunge', 'DB Forward Lunge', 'DB Walking Lunge', 'DB Lateral Lunge',
        'DB Curtsy Lunge', 'DB Step-up', 'DB Deficit Lunge', 'DB Jump Lunge',
        'DB Front Rack Lunge', 'DB Overhead Lunge', 'DB Crossover Lunge', 'DB Clock Lunge',
        'DB High Step-up', 'DB Box Jump', 'DB Lunge to Press', 'Single DB Overhead Lunge',
        'DB Suitcase Lunge', 'DB Drop Lunge', 'DB Jumping Split Squat', 'DB Plyo Step-up'
      ],
      Core: [
        'DB Dead Bug', 'DB Russian Twist', 'DB Sit-up', 'DB V-up',
        'DB Woodchop', 'DB Side Bend', 'DB Windmill', 'DB Turkish Get-up',
        'DB Plank Pull Through', 'DB Renegade Row', 'DB Hollow Hold', 'DB Toe Touch',
        'DB Leg Raise', 'Single DB Windmill', 'DB Around the World', 'DB Halo',
        'DB Suitcase Carry', 'DB Farmers Walk', 'Single Arm DB Carry', 'DB Overhead Carry'
      ],
      Cardio: [
        'DB High Knees', 'DB Jumping Jacks', 'DB Burpee', 'DB Thruster',
        'DB Snatch', 'DB Clean and Press', 'DB Swing', 'DB Man Maker',
        'DB Devil Press', 'DB Jump Squat', 'DB Skater', 'DB Mountain Climber',
        'DB Burpee to Press', 'DB Cluster', 'Single DB Burpee', 'DB Bear Crawl',
        'DB Gorilla Row Burpee', 'DB Complex', 'DB Conditioning Circuit', 'DB Death March'
      ]
    }
  },
  grappler: {
    name: 'Grappler',
    equipment: 'Sandbag',
    exercises: {
      Push: generatePlaceholderExercises('Sandbag Push'),
      Pull: generatePlaceholderExercises('Sandbag Pull'),
      'Squat/Hinge': generatePlaceholderExercises('Sandbag Squat'),
      Lunge: generatePlaceholderExercises('Sandbag Lunge'),
      Core: generatePlaceholderExercises('Sandbag Core'),
      Cardio: generatePlaceholderExercises('Sandbag Cardio')
    }
  },
  guardian: {
    name: 'Guardian',
    equipment: 'Weight Plate',
    exercises: {
      Push: generatePlaceholderExercises('Plate Push'),
      Pull: generatePlaceholderExercises('Plate Pull'),
      'Squat/Hinge': generatePlaceholderExercises('Plate Squat'),
      Lunge: generatePlaceholderExercises('Plate Lunge'),
      Core: generatePlaceholderExercises('Plate Core'),
      Cardio: generatePlaceholderExercises('Plate Cardio')
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
  hpThreshold: 150,
  roundTemplate: DEFAULT_ROUND_TEMPLATE,
  rollMode: 'all-at-once',
  repMode: 'fixed'
};

// Storage key for localStorage
export const STORAGE_KEY = 'wyrd-workout-session';
