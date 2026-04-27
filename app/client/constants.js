// Client-side preset metadata only. The actual promptTemplate used for generation lives
// server-side in app/server/default-styles.js (keeps prompts out of the shipped bundle).
// Order here controls dropdown order in InputForm.

export const DEFAULT_STYLES = [
  {
    id: 'black-gold-editorial',
    name: 'Black & Gold Editorial',
    description:
      'Inside Success TV signature look — obsidian background, warm gold rim light, prestige network energy.'
  },
  {
    id: 'cinematic-gold',
    name: 'Cinematic Gold',
    description:
      'Warm golden-hour cinematic portrait with rich amber shadows and a luxurious, prestigious mood.'
  },
  {
    id: 'legacy-makers-cover',
    name: 'Legacy Makers Cover',
    description:
      'Forbes / Entrepreneur magazine-style editorial cover — timeless authority portrait.'
  },
  {
    id: 'documentary-keyart',
    name: 'Documentary Keyart',
    description:
      'Netflix / HBO documentary poster — moody chiaroscuro, cinematic teal-and-orange grade.'
  },
  {
    id: 'boardroom-power',
    name: 'Boardroom Power',
    description:
      'Authoritative C-suite portrait inside a skyline boardroom at blue hour.'
  },
  {
    id: 'red-carpet-premiere',
    name: 'Red Carpet Premiere',
    description:
      'Glamorous documentary-premiere step-and-repeat shot with paparazzi flashbulbs.'
  },
  {
    id: 'luxury-lifestyle',
    name: 'Luxury Lifestyle',
    description:
      'High-net-worth aspirational lifestyle — yacht deck, penthouse terrace, or exotic garage.'
  },
  {
    id: 'keynote-stage',
    name: 'Keynote Stage',
    description:
      'TEDx / stadium keynote hero shot — single spotlight, vast audience bokeh.'
  },
  {
    id: 'gritty-founder',
    name: 'Gritty Founder',
    description:
      'The Social Network / Uncut Gems grade — raw industrial environment, underdog-to-empire mood.'
  },
  {
    id: 'modern-corporate',
    name: 'Modern Corporate',
    description:
      'Clean Harvard Business Review editorial studio portrait with minimalist palette.'
  }
];

export const CUSTOM_STYLE_ID = 'custom';

export const ASPECT_RATIOS = ['3:4', '16:9', '9:16'];
export const VARIATION_COUNTS = [1, 3, 5];

export const STORAGE_KEYS = {
  ASSETS: 'istv.assets',
  CUSTOM_PRESETS: 'istv.customPresets'
};

export const MAX_STORED_ASSETS = 3;
