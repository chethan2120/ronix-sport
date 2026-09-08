// Category-Specific Product Subtypes / Variant Types Definition

export const CATEGORY_PRODUCT_TYPES_MAP: Record<string, string[]> = {
  Bats: [
    'English Willow Bat',
    'Kashmir Willow Bat',
    'Plastic Bat',
    'Tennis Bat',
    'Kids Bat',
    'Practice Bat',
    'Training Bat',
  ],
  Balls: [
    'Tennis Ball',
    'Red Leather Cricket Ball',
    'White Leather Cricket Ball',
    'Plastic Ball',
    'Rubber Ball',
    'Practice Ball',
    'Soft Ball',
    'Training Ball',
  ],
  Bags: [
    'Single-Side Bag',
    'Double-Side Bag',
    'Long Kit Bag',
    'Short Kit Bag',
    'Backpack',
    'Wheel Kit Bag',
    'Duffle Bag',
    'Shoe Bag',
  ],
  Helmets: [
    'Cricket Helmet',
    'Junior Helmet',
    'Senior Helmet',
    'Steel Grill Helmet',
    'Titanium Grill Helmet',
    'Practice Helmet',
  ],
  Gloves: [
    'Batting Gloves',
    'Wicket Keeping Gloves',
    'Inner Gloves',
    'Junior Gloves',
    'Senior Gloves',
    'Training Gloves',
  ],
  Pads: [
    'Batting Pads',
    'Wicket Keeping Pads',
    'Junior Pads',
    'Senior Pads',
    'Lightweight Pads',
    'Training Pads',
  ],
  Footwear: [
    'Cricket Shoes',
    'Football Shoes',
    'Running Shoes',
    'Training Shoes',
    'Indoor Shoes',
    'Stud Shoes',
  ],
  Football: [
    'Match Football',
    'Training Football',
    'Size 3',
    'Size 4',
    'Size 5',
    'Futsal Ball',
  ],
  Badminton: [
    'Badminton Racket',
    'Shuttlecock',
    'Grip',
    'Badminton Bag',
    'Net',
    'Junior Racket',
  ],
  Basketball: [
    'Indoor Basketball',
    'Outdoor Basketball',
    'Size 5',
    'Size 6',
    'Size 7',
    'Training Basketball',
  ],
  Fitness: [
    'Dumbbells',
    'Resistance Bands',
    'Yoga Mat',
    'Skipping Rope',
    'Kettlebell',
    'Foam Roller',
    'Training Cone',
  ],
  Accessories: [
    'Grip',
    'Wrist Band',
    'Water Bottle',
    'Cap',
    'Socks',
    'Towel',
    'Sports Tape',
    'Protective Gear',
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
