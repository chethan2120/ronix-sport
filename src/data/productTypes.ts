// Category-Specific Product Subtypes / Variant Types Definition

export const CATEGORY_PRODUCT_TYPES_MAP: Record<string, string[]> = {
  Cricket: [
    'Kashmir Willow Bat',
    'English Willow Bat',
    'Batting Gloves',
    'Batting Pads',
    'Cricket Helmet',
    'Protection',
    'Kit Bag',
    'Tennis Ball',
    'Leather Ball',
    'Stumps',
  ],
  Football: [
    'Match Football',
    'Stud Shoes',
    'Protection',
    'Gloves',
    'Training',
    'Accessories',
    'Nets',
    'Training Football',
  ],
  Badminton: [
    'Racket',
    'Shuttlecock',
    'Nets',
    'Accessories',
    'Kit Bag',
    'Footwear',
  ],
  'Table Tennis': [
    'TT Bat',
    'TT Balls',
    'TT Net',
    'TT Table',
  ],
  Volleyball: [
    'Match Volleyball',
    'Volleyball Net',
  ],
  Basketball: [
    'Match Basketball',
    'Basketball Shoes',
    'Hoop & Net',
  ],
  'Fitness & Gym': [
    'Yoga Mat',
    'Resistance Bands',
    'Dumbbells',
    'Kettlebell',
    'Skipping Rope',
    'Gym Accessories',
    'Ab Roller',
    'Recovery',
    'Push Up Stand',
    'Weight Belt',
  ],
  'Sportswear & Accessories': [
    'Bags',
    'Bottles',
    'Socks',
    'Running Shoes',
    'Apparel',
    'Cap',
  ],
};

export const getTypesForCategory = (category?: string): string[] => {
  if (!category || category === 'All Gear' || category === 'All') {
    // Return all unique product types across all categories
    const all = new Set<string>();
    Object.values(CATEGORY_PRODUCT_TYPES_MAP).forEach((list) => {
      list.forEach((item) => all.add(item));
    });
    return Array.from(all);
  }

  // Exact match
  if (CATEGORY_PRODUCT_TYPES_MAP[category]) {
    return CATEGORY_PRODUCT_TYPES_MAP[category];
  }

  // Case-insensitive match
  const catKey = Object.keys(CATEGORY_PRODUCT_TYPES_MAP).find(
    (k) => k.toLowerCase() === category.toLowerCase()
  );

  return catKey ? CATEGORY_PRODUCT_TYPES_MAP[catKey] : [];
};
