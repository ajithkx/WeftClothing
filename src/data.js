export const IG = 'https://www.instagram.com/shopweft';

const img = (n) => ({ src: `./img/${n}.webp`, sm: `./img/${n}-sm.webp` });

// Rail pieces: real flat-lays from the current archive. Names describe what's in the photo.
// Prices and sizes aren't published, so every piece is "DM for price".
export const pieces = [
  { name: 'Neon Rave Shell', type: 'Shell', note: 'Pink / teal / volt', ...img(13), hot: true },
  { name: 'Red Block Track Top', type: 'Track top', note: 'Red / white', ...img(2), hot: true },
  { name: 'Teal Windbreaker', type: 'Windbreaker', note: 'Teal', ...img(12) },
  { name: 'Black Graphic Track Top', type: 'Track top', note: 'Black / silver', ...img(20) },
  { name: 'Cream Stripe Track Top', type: 'Track top', note: 'Cream / navy', ...img(8) },
  { name: 'Grey Utility Anorak', type: 'Anorak', note: 'Slate grey', ...img(15), hot: true },
  { name: 'Sand Piped Track Top', type: 'Track top', note: 'Sand / navy', ...img(10) },
  { name: 'Macron Track Top', type: 'Track top', note: 'Beige / navy', ...img(17) },
  { name: 'Black Hooded Shell', type: 'Shell', note: 'Black tonal', ...img(1) },
];

// Detail close-ups for the "Up close" bento.
export const details = [
  { ...img(9), label: 'Macron zip pull', sub: 'Clean metal hardware' },
  { ...img(4), label: 'Legea sleeve print', sub: 'Bold sleeve hit' },
  { ...img(7), label: 'Sun Mountain label', sub: 'Loud orange lining' },
  { ...img(6), label: 'Chest embroidery', sub: 'Stitched logo' },
  { ...img(14), label: 'Team crest', sub: 'Macron team kit' },
  { ...img(19), label: 'Inner label', sub: 'Sharp contrast collar' },
];

export const process = [
  { word: 'Found', text: 'We dig through thrift bins and old team stock for the good stuff.', ...img(11) },
  { word: 'Cleaned', text: 'Everything gets washed and de-pilled, and we check every seam and zip.', ...img(3) },
  { word: 'Graded', text: 'If a piece has a mark on it, we say so in the post.', ...img(16) },
  { word: 'Dropped', text: 'We post small batches on Instagram, and the first person to DM gets the piece.', ...img(5) },
];

// Rotating ring in the hero scene.
export const reelImages = [13, 2, 12, 20, 8, 15, 10, 17, 1, 5].map((n) => `./img/${n}-sm.webp`);
