export const INITIAL_CLASSES = [
  {
    id: 'class-1',
    name: 'Apex Strength Protocol',
    category: 'Strength',
    description: 'Periodized barbell training focused on compound movements, progressive overload, and neuromuscular efficiency.',
    intensity: 'Elite',
    duration: 60,
    trainer: 'Marcus Vance',
    capacity: 12,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'class-2',
    name: 'Precision Vinyasa',
    category: 'Yoga',
    description: 'Dynamic breath-led flow integrating isometric holds, mobility drills, and targeted nervous system regulation.',
    intensity: 'Moderate',
    duration: 55,
    trainer: 'Elena Rostova',
    capacity: 16,
    image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'class-3',
    name: 'Metabolic Conditioning',
    category: 'HIIT',
    description: 'High-density anaerobic intervals engineered to elevate VO2 max and accelerate metabolic throughput.',
    intensity: 'High',
    duration: 45,
    trainer: 'Dante Cruz',
    capacity: 14,
    image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'class-4',
    name: 'Cadence RPM',
    category: 'Cycling',
    description: 'Structured wattage-based indoor cycling simulating alpine ascents and explosive sprint intervals.',
    intensity: 'High',
    duration: 50,
    trainer: 'Sarah Chen',
    capacity: 18,
    image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'class-5',
    name: 'Heavy Bag & Footwork',
    category: 'Boxing',
    description: 'Technical pugilism drills combining orthodox combinations, head movement, and core rotational power.',
    intensity: 'Elite',
    duration: 60,
    trainer: 'Jax Thorne',
    capacity: 12,
    image_url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'class-6',
    name: 'Reformer Athletic',
    category: 'Pilates',
    description: 'Spring-loaded resistance training targeting deep stabilizing musculature, posture alignment, and unilateral balance.',
    intensity: 'Moderate',
    duration: 50,
    trainer: 'Maya Alcantara',
    capacity: 10,
    image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop'
  }
];

export const INITIAL_TRAINERS = [
  {
    id: 'trainer-1',
    name: 'Marcus Vance',
    role: 'Head Strength Coach',
    bio: 'Former collegiate powerlifting coach specializing in biomechanics, maximal force production, and rehabilitation protocols.',
    specialties: ['Powerlifting', 'Biomechanics', 'Olympic Lifting'],
    experience_years: 11,
    order: 1,
    image_url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'trainer-2',
    name: 'Elena Rostova',
    role: 'Mobility & Yoga Specialist',
    bio: 'Dedicated practitioner blending Ashtanga methodology with functional movement screening for high-performance longevity.',
    specialties: ['Vinyasa', 'Spine Mobility', 'Breathwork'],
    experience_years: 9,
    order: 2,
    image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'trainer-3',
    name: 'Dante Cruz',
    role: 'Conditioning Director',
    bio: 'Elite strength and conditioning specialist focused on anaerobic capacity, sprint mechanics, and energetic recovery.',
    specialties: ['HIIT', 'Energy Systems', 'Track Performance'],
    experience_years: 8,
    order: 3,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'trainer-4',
    name: 'Sarah Chen',
    role: 'Endurance & Cycling Lead',
    bio: 'Competitive road cyclist bringing telemetry data and power curve optimization into private performance training.',
    specialties: ['Power Zones', 'VO2 Max', 'Cadence Coaching'],
    experience_years: 7,
    order: 4,
    image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'trainer-5',
    name: 'Jax Thorne',
    role: 'Combat & Striking Coach',
    bio: 'Golden Gloves champion focusing on technical precision, ring awareness, rotational torque, and fight endurance.',
    specialties: ['Boxing Technique', 'Counter-Striking', 'Footwork'],
    experience_years: 12,
    order: 5,
    image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'trainer-6',
    name: 'Maya Alcantara',
    role: 'Pilates & Recovery Specialist',
    bio: 'Certified contemporary reformer instructor emphasizing core stability, unilateral symmetry, and neuromuscular control.',
    specialties: ['Classical Reformer', 'Post-Rehab', 'Pelvic Stability'],
    experience_years: 6,
    order: 6,
    image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop'
  }
];

export const INITIAL_PLANS = [
  {
    id: 'plan-1',
    name: 'Club Foundation',
    price_monthly: 180,
    price_annual: 1800,
    tagline: 'The Standard',
    description: 'Unlimited access to the primary training floor, lockers, and open gym hours.',
    features: [
      'Full floor access (5am - 11pm)',
      'Locker rooms with steam & sauna',
      'Complimentary towel service',
      'Access to open gym slots',
      'Apex Club mobile access key'
    ],
    highlighted: false,
    order: 1
  },
  {
    id: 'plan-2',
    name: 'Apex Performance',
    price_monthly: 280,
    price_annual: 2800,
    tagline: 'The Complete Discipline',
    description: 'Our signature tier including all 40 weekly group classes, recovery suite, and priority booking.',
    features: [
      'Everything in Club Foundation',
      'Unlimited weekly group classes (all categories)',
      '14-day advance session booking',
      'Full recovery suite & cold plunge access',
      'Quarterly 1-on-1 performance review',
      '2 complimentary guest passes / month'
    ],
    highlighted: true,
    order: 2
  },
  {
    id: 'plan-3',
    name: 'Private Suite',
    price_monthly: 450,
    price_annual: 4500,
    tagline: 'Unrestricted Mastery',
    description: 'Private locker assignment, dedicated coaching sessions, and bespoke concierge programming.',
    features: [
      'Everything in Apex Performance',
      '24/7 private facility access',
      'Permanent assigned luxury locker & laundry',
      '2 private coaching sessions / month',
      'Customized monthly nutritional blueprint',
      'Unlimited guest passes with advance notice'
    ],
    highlighted: false,
    order: 3
  }
];

export const INITIAL_SCHEDULE_SLOTS = [
  { id: 'slot-1', class_name: 'Apex Strength Protocol', category: 'Strength', trainer: 'Marcus Vance', day: 'Mon', start_time: '07:00', end_time: '08:00', spots_remaining: 3 },
  { id: 'slot-2', class_name: 'Precision Vinyasa', category: 'Yoga', trainer: 'Elena Rostova', day: 'Mon', start_time: '09:00', end_time: '10:00', spots_remaining: 6 },
  { id: 'slot-3', class_name: 'Metabolic Conditioning', category: 'HIIT', trainer: 'Dante Cruz', day: 'Mon', start_time: '12:00', end_time: '12:45', spots_remaining: 2 },
  { id: 'slot-4', class_name: 'Heavy Bag & Footwork', category: 'Boxing', trainer: 'Jax Thorne', day: 'Mon', start_time: '18:00', end_time: '19:00', spots_remaining: 4 },
  { id: 'slot-5', class_name: 'Cadence RPM', category: 'Cycling', trainer: 'Sarah Chen', day: 'Tue', start_time: '07:00', end_time: '07:50', spots_remaining: 5 },
  { id: 'slot-6', class_name: 'Reformer Athletic', category: 'Pilates', trainer: 'Maya Alcantara', day: 'Tue', start_time: '09:00', end_time: '09:50', spots_remaining: 2 },
  { id: 'slot-7', class_name: 'Apex Strength Protocol', category: 'Strength', trainer: 'Marcus Vance', day: 'Tue', start_time: '17:30', end_time: '18:30', spots_remaining: 1 },
  { id: 'slot-8', class_name: 'Precision Vinyasa', category: 'Yoga', trainer: 'Elena Rostova', day: 'Wed', start_time: '07:00', end_time: '08:00', spots_remaining: 4 },
  { id: 'slot-9', class_name: 'Metabolic Conditioning', category: 'HIIT', trainer: 'Dante Cruz', day: 'Wed', start_time: '12:00', end_time: '12:45', spots_remaining: 5 },
  { id: 'slot-10', class_name: 'Heavy Bag & Footwork', category: 'Boxing', trainer: 'Jax Thorne', day: 'Wed', start_time: '18:30', end_time: '19:30', spots_remaining: 3 },
  { id: 'slot-11', class_name: 'Cadence RPM', category: 'Cycling', trainer: 'Sarah Chen', day: 'Thu', start_time: '07:00', end_time: '07:50', spots_remaining: 6 },
  { id: 'slot-12', class_name: 'Reformer Athletic', category: 'Pilates', trainer: 'Maya Alcantara', day: 'Thu', start_time: '17:00', end_time: '17:50', spots_remaining: 4 },
  { id: 'slot-13', class_name: 'Apex Strength Protocol', category: 'Strength', trainer: 'Marcus Vance', day: 'Fri', start_time: '07:00', end_time: '08:00', spots_remaining: 2 },
  { id: 'slot-14', class_name: 'Heavy Bag & Footwork', category: 'Boxing', trainer: 'Jax Thorne', day: 'Fri', start_time: '17:30', end_time: '18:30', spots_remaining: 5 },
  { id: 'slot-15', class_name: 'Metabolic Conditioning', category: 'HIIT', trainer: 'Dante Cruz', day: 'Sat', start_time: '09:00', end_time: '10:00', spots_remaining: 4 },
  { id: 'slot-16', class_name: 'Precision Vinyasa', category: 'Yoga', trainer: 'Elena Rostova', day: 'Sat', start_time: '10:30', end_time: '11:30', spots_remaining: 8 },
  { id: 'slot-17', class_name: 'Reformer Athletic', category: 'Pilates', trainer: 'Maya Alcantara', day: 'Sun', start_time: '09:00', end_time: '09:50', spots_remaining: 3 },
  { id: 'slot-18', class_name: 'Cadence RPM', category: 'Cycling', trainer: 'Sarah Chen', day: 'Sun', start_time: '10:30', end_time: '11:20', spots_remaining: 7 },
];
