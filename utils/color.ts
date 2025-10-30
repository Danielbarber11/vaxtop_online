// Simple hash function to get a number from a string
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Generate a color from a hash
const hashToColor = (hash: number, offset: number): string => {
  const i = (hash + offset) % 360;
  // Using HSL for more pleasant color combinations.
  // Saturation: 70-90%, Lightness: 40-60%
  const saturation = 70 + (hash % 21); 
  const lightness = 40 + ((hash >> 8) % 21);
  return `hsl(${i}, ${saturation}%, ${lightness}%)`;
};

export const generateGradientForId = (id: string): string => {
  if (!id) {
    return `linear-gradient(to bottom right, #888, #555)`;
  }
  const hash = simpleHash(id);
  const color1 = hashToColor(hash, 0);
  const color2 = hashToColor(hash, 90); // 90 degrees apart on color wheel
  return `linear-gradient(to bottom right, ${color1}, ${color2})`;
};
