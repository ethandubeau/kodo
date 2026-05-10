-- ============================================================
-- KŌDO — Default Exercise Seed Data (50 exercises)
-- All user_id = null → global / shared exercises
-- ============================================================

insert into public.exercises (id, user_id, name, muscle_group, equipment) values

-- CHEST (8)
(uuid_generate_v4(), null, 'Barbell Bench Press',        'chest', 'barbell'),
(uuid_generate_v4(), null, 'Incline Barbell Press',      'chest', 'barbell'),
(uuid_generate_v4(), null, 'Dumbbell Bench Press',       'chest', 'dumbbell'),
(uuid_generate_v4(), null, 'Incline Dumbbell Press',     'chest', 'dumbbell'),
(uuid_generate_v4(), null, 'Cable Fly',                  'chest', 'cable'),
(uuid_generate_v4(), null, 'Dumbbell Fly',               'chest', 'dumbbell'),
(uuid_generate_v4(), null, 'Push-Up',                    'chest', 'bodyweight'),
(uuid_generate_v4(), null, 'Dips',                       'chest', 'bodyweight'),

-- BACK (9)
(uuid_generate_v4(), null, 'Deadlift',                   'back', 'barbell'),
(uuid_generate_v4(), null, 'Barbell Row',                'back', 'barbell'),
(uuid_generate_v4(), null, 'Pull-Up',                    'back', 'bodyweight'),
(uuid_generate_v4(), null, 'Chin-Up',                    'back', 'bodyweight'),
(uuid_generate_v4(), null, 'Lat Pulldown',               'back', 'cable'),
(uuid_generate_v4(), null, 'Seated Cable Row',           'back', 'cable'),
(uuid_generate_v4(), null, 'Dumbbell Row',               'back', 'dumbbell'),
(uuid_generate_v4(), null, 'T-Bar Row',                  'back', 'barbell'),
(uuid_generate_v4(), null, 'Face Pull',                  'back', 'cable'),

-- SHOULDERS (6)
(uuid_generate_v4(), null, 'Overhead Press',             'shoulders', 'barbell'),
(uuid_generate_v4(), null, 'Dumbbell Shoulder Press',    'shoulders', 'dumbbell'),
(uuid_generate_v4(), null, 'Lateral Raise',              'shoulders', 'dumbbell'),
(uuid_generate_v4(), null, 'Front Raise',                'shoulders', 'dumbbell'),
(uuid_generate_v4(), null, 'Arnold Press',               'shoulders', 'dumbbell'),
(uuid_generate_v4(), null, 'Upright Row',                'shoulders', 'barbell'),

-- ARMS — BICEPS (4)
(uuid_generate_v4(), null, 'Barbell Curl',               'arms', 'barbell'),
(uuid_generate_v4(), null, 'Dumbbell Curl',              'arms', 'dumbbell'),
(uuid_generate_v4(), null, 'Hammer Curl',                'arms', 'dumbbell'),
(uuid_generate_v4(), null, 'Incline Dumbbell Curl',      'arms', 'dumbbell'),

-- ARMS — TRICEPS (4)
(uuid_generate_v4(), null, 'Tricep Pushdown',            'arms', 'cable'),
(uuid_generate_v4(), null, 'Skull Crusher',              'arms', 'barbell'),
(uuid_generate_v4(), null, 'Overhead Tricep Extension',  'arms', 'dumbbell'),
(uuid_generate_v4(), null, 'Close-Grip Bench Press',     'arms', 'barbell'),

-- LEGS — QUADS (6)
(uuid_generate_v4(), null, 'Barbell Back Squat',         'legs', 'barbell'),
(uuid_generate_v4(), null, 'Front Squat',                'legs', 'barbell'),
(uuid_generate_v4(), null, 'Leg Press',                  'legs', 'machine'),
(uuid_generate_v4(), null, 'Leg Extension',              'legs', 'machine'),
(uuid_generate_v4(), null, 'Bulgarian Split Squat',      'legs', 'dumbbell'),
(uuid_generate_v4(), null, 'Hack Squat',                 'legs', 'machine'),

-- LEGS — HAMSTRINGS & GLUTES (6)
(uuid_generate_v4(), null, 'Romanian Deadlift',          'legs', 'barbell'),
(uuid_generate_v4(), null, 'Leg Curl',                   'legs', 'machine'),
(uuid_generate_v4(), null, 'Hip Thrust',                 'legs', 'barbell'),
(uuid_generate_v4(), null, 'Glute Bridge',               'legs', 'bodyweight'),
(uuid_generate_v4(), null, 'Good Morning',               'legs', 'barbell'),
(uuid_generate_v4(), null, 'Walking Lunge',              'legs', 'dumbbell'),

-- CORE (7)
(uuid_generate_v4(), null, 'Plank',                      'core', 'bodyweight'),
(uuid_generate_v4(), null, 'Cable Crunch',               'core', 'cable'),
(uuid_generate_v4(), null, 'Hanging Leg Raise',          'core', 'bodyweight'),
(uuid_generate_v4(), null, 'Ab Rollout',                 'core', 'other'),
(uuid_generate_v4(), null, 'Russian Twist',              'core', 'bodyweight'),
(uuid_generate_v4(), null, 'Side Plank',                 'core', 'bodyweight'),
(uuid_generate_v4(), null, 'Decline Sit-Up',             'core', 'bodyweight');
