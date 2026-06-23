"use strict";

const DEFAULT_STYLES = [
  {
    id: "black-gold-editorial",
    name: "Black & Gold Editorial",
    description:
      "Inside Success TV signature look — obsidian background, warm gold rim light, prestige streaming-network atmosphere.",
    promptTemplate: `
[BACKGROUND]: A deep obsidian-black seamless studio backdrop for a prestige {{INDUSTRY}} feature. Environmental storytelling through subtle props, textures, or silhouetted elements hinting at the industry, rendered with restrained bronze detailing against pure black. Premium streaming-network brand feel with a sense of understated authority.

[SOURCE PHOTO INTEGRATION]: Seamlessly composite the subject into the scene. Match the warm-gold rim lighting direction of the environment so the light on the subject's skin and hair matches the light on the scene. Colour-match skin tone to the ambient bronze highlights. Render natural contact shadows so the subject appears genuinely present, not pasted on.

[LIGHTING]: Low-key chiaroscuro. A single warm gold rim light from camera-right sculpting the jawline and shoulders. Subtle metallic bronze highlights on the skin. Deep negative-fill on the opposite side producing a cinematic shadow wall.

[ATMOSPHERE]: GQ Men of the Year / Vanity Fair Hollywood-issue aesthetic. Razor-sharp focus on the eyes. Medium-format 110mm f/2.8 lens feel. Subtle volumetric atmosphere. Polished colour grade with rich blacks and creamy gold midtones. Luxurious matte-black tailored wardrobe texture.
`.trim(),
  },
  {
    id: "cinematic-gold",
    name: "Cinematic Gold",
    description:
      "Warm golden-hour cinematic portrait with rich amber shadows and a luxurious, prestigious mood.",
    promptTemplate: `
[BACKGROUND]: A warm golden-hour environment for a {{INDUSTRY}} documentary subject. Deep chocolate-brown and honey bokeh background with subtle industry-relevant environmental details softly defocused — hinting at the subject's world without competing for attention. Medium-format film aesthetic with subtle organic grain.

[SOURCE PHOTO INTEGRATION]: Seamlessly integrate the subject. Match the warm amber key from camera-left so the skin picks up honey highlights. Blend the subject's skin tone into the ambient honey-and-amber reflections. Render soft natural shadows beneath the jaw and collar.

[LIGHTING]: Warm golden-hour key from camera-left. Rich burgundy shadows. Soft backlit rim separating the subject from the background. Shallow depth of field consistent with an 85mm f/1.4 lens.

[ATMOSPHERE]: Luxurious executive gravitas. Vanity Fair cover quality. Medium-format film look reminiscent of 6x7 negative. Rich colour grade — honey midtones, burgundy shadows, cream highlights. Prestige high-end commercial photography energy.
`.trim(),
  },
  {
    id: "legacy-makers-cover",
    name: "Legacy Makers Cover",
    description:
      "Forbes / Entrepreneur magazine-style editorial cover — timeless authority portrait.",
    promptTemplate: `
[BACKGROUND]: A prestige editorial magazine-cover environment for a {{INDUSTRY}} industry leader. Deep matte-black studio backdrop with environmental hints of authority — a subtle textured surface, a slim architectural element, or a single iconic object from their world placed with editorial restraint. Leave masthead-ready negative space at the top of the frame.

[SOURCE PHOTO INTEGRATION]: Seamlessly composite the subject into the frame. Match the crisp directional studio key falling from upper-camera-left. Controlled skin-tone rendering consistent with high-end editorial colour palette (without altering the face itself). Render natural contact shadow on any textured surface the subject interacts with.

[LIGHTING]: Forbes-style composition. Crisp directional studio key from upper-camera-left. Controlled fill from camera-right preventing crushed blacks on the shadow side. Subtle hair-light separating the subject from the black background.

[ATMOSPHERE]: Timeless and iconic — worthy of a Legacy Makers docuseries cover. Razor-sharp focus on the eyes. Medium-format 80mm lens at f/4 feel. Restrained cream and bronze colour palette. Composed expression of quiet authority. Entrepreneur / Forbes / Inc magazine-cover aesthetic.
`.trim(),
  },
  {
    id: "documentary-keyart",
    name: "Documentary Keyart",
    description:
      "Netflix / HBO documentary poster — moody chiaroscuro, cinematic teal-and-orange grade.",
    promptTemplate: `
[BACKGROUND]: A cinematic Netflix-style documentary key-art environment for a {{INDUSTRY}} visionary. Deep charcoal-and-teal environmental backdrop with atmospheric haze and soft volumetric god-rays cutting through negative space. Subtle industry-specific details rendered in silhouette or soft defocus. 2.39:1 cinematic framing energy.

[SOURCE PHOTO INTEGRATION]: Seamlessly integrate the subject into the cinematic environment. Match the dramatic top-light rim from the scene. Warm skin midtones in clean contrast to the teal environmental shadows. Render natural shadow beneath the jaw and soft subject-to-scene light spill on the shoulders.

[LIGHTING]: Moody chiaroscuro. A single dramatic top-light rim creating a strong halo on the hair. Teal-graded ambient fill from below. Subtle lens-flare bloom where hard light meets the atmospheric haze.

[ATMOSPHERE]: Oscar-documentary colour grade — teal shadows, warm skin midtones, orange highlights. Film-grain texture. Anamorphic cinematic look with soft oval bokeh. Contemplative hero pose. Prestige streaming-series poster composition. Netflix Originals / HBO Max documentary key-art aesthetic.
`.trim(),
  },
  {
    id: "boardroom-power",
    name: "Boardroom Power",
    description:
      "Authoritative C-suite portrait inside a skyline boardroom at blue hour.",
    promptTemplate: `
[BACKGROUND]: An authoritative modern glass-walled boardroom high above a major-city skyline at blue hour, set in the {{INDUSTRY}} context. Polished marble surfaces, dark walnut panelling, brushed-steel architectural details. City skyline visible through floor-to-ceiling windows in soft defocus. Fortune 500 C-suite environment.

[SOURCE PHOTO INTEGRATION]: Seamlessly composite the subject in command of the room. Match the cool cinematic ambient light from the windows blended with warm interior tungsten practicals. Colour-match skin tone to the interior warm fill. Render specular highlights on the marble and subtle reflected light on the subject's wardrobe.

[LIGHTING]: Cool cinematic ambient key from the windows mixed with warm interior tungsten pools (desk lamps, recessed ceiling cans). Specular reflections on polished marble. Subtle rim from a practical sconce. Gentle vignette.

[ATMOSPHERE]: Fortune 500 C-suite gravitas. Commanding posture. Wall Street Journal CEO-profile aesthetic. Full-frame 50mm f/1.8 lens look with editorial sharpness. Crisp tailored suit. Subtle luxury watch glint. Decisive, unmistakably powerful energy.
`.trim(),
  },
  {
    id: "red-carpet-premiere",
    name: "Red Carpet Premiere",
    description:
      "Glamorous documentary-premiere step-and-repeat shot with paparazzi flashbulbs.",
    promptTemplate: `
[BACKGROUND]: A glamorous red-carpet documentary-premiere environment for a celebrity-tier {{INDUSTRY}} subject. Deep crimson red carpet underfoot. A brass step-and-repeat branding backdrop that is entirely blank of any text, words, logos, or typography (critical). Multiple paparazzi flashbulbs flaring in deep bokeh behind the subject. Prestige premiere atmosphere.

[SOURCE PHOTO INTEGRATION]: Seamlessly composite the subject onto the carpet. Match the crisp front key light blended with soft fill from the flashbulbs. Luminous polished skin rendering matching the flashbulb key. Render natural shadow from the key and subtle warm brass reflections on the skin.

[LIGHTING]: Paparazzi-style crisp direct front key with controlled soft fill. Rim-lit flashbulb bokeh behind the subject. Subtle warm brass reflections on the skin from the step-and-repeat surface.

[ATMOSPHERE]: Vanity Fair Oscars-party aesthetic. Cinematic 70–100mm telephoto compression with shallow depth of field. Luxurious tailored evening wardrobe with subtle sheen. Confident A-list expression. Inside Success TV event-night energy.
`.trim(),
  },
  {
    id: "luxury-lifestyle",
    name: "Luxury Lifestyle",
    description:
      "High-net-worth aspirational lifestyle — yacht deck, penthouse terrace, or exotic garage.",
    promptTemplate: `
[BACKGROUND]: A high-net-worth aspirational lifestyle environment for a successful {{INDUSTRY}} subject. Choose the setting with the strongest cinematic fit for the industry: a sun-drenched Mediterranean super-yacht deck with ocean horizon, a Manhattan penthouse terrace with skyline, or a private garage of vintage exotic cars. Ocean or skyline backdrop in soft telephoto bokeh. Golden coastal or magic-hour light throughout.

[SOURCE PHOTO INTEGRATION]: Seamlessly composite the subject into the environment. Match the warm coastal / magic-hour ambient light. Colour-match skin tone to the golden ambient. Render natural reflections on any sunglasses, luxury watch, or polished surface the subject interacts with.

[LIGHTING]: Warm coastal / magic-hour key from a low angle. Subtle bounce fill from the environment (white yacht deck, marble terrace, polished car paint). Glinting rim on any polished surface.

[ATMOSPHERE]: Robb Report / Monocle editorial quality. Cinematic 35mm or 50mm lens wide open. Refined casual wardrobe — unbuttoned shirt, cashmere layer, or tailored sport coat. Understated luxury watch. Relaxed yet unmistakably powerful pose. Aspirational entrepreneur-success atmosphere.
`.trim(),
  },
  {
    id: "keynote-stage",
    name: "Keynote Stage",
    description:
      "TEDx / stadium keynote hero shot — single spotlight, vast audience bokeh.",
    promptTemplate: `
[BACKGROUND]: A darkened conference stage environment for a {{INDUSTRY}} thought-leader. Charcoal stage curtains behind the subject. Thousands of tiny out-of-focus audience lights stretching into deep bokeh. A subtle TEDx-style circular stage marker glowing softly beneath the subject's feet. Premium corporate-conference Summit-series aesthetic.

[SOURCE PHOTO INTEGRATION]: Seamlessly composite the subject on stage. Match the single focused spotlight from above plus the contre-jour backlight from upstage so the subject has both a defined top-light pool and a distinct halo rim on the hair and shoulders. Render natural shadow cast forward on the stage floor.

[LIGHTING]: A single focused front-of-house spotlight creating a defined pool of light around the subject. Dramatic contre-jour backlight from upstage haloing the silhouette with a soft rim. Subtle atmospheric haze catching the beams.

[ATMOSPHERE]: Mid-speech confident gesture with engaged body language. 85mm f/1.4 lens feel from a low front-of-house angle. TEDx / Summit / large-format conference key-art energy. Blue-to-charcoal colour grade with the warm spotlight pool as the only warm element in the frame.
`.trim(),
  },
  {
    id: "gritty-founder",
    name: "Gritty Founder",
    description:
      "The Social Network / Uncut Gems grade — raw industrial environment, underdog-to-empire mood.",
    promptTemplate: `
[BACKGROUND]: A raw industrial environment at dawn for a {{INDUSTRY}} founder/operator. Choose based on industry fit: a concrete warehouse floor, an exposed-brick workshop, or a weathered city-rooftop skyline. Fine dust or morning fog suspended in the air catching light. Subtle tools, materials, or hardware from the industry visible as textured environmental detail.

[SOURCE PHOTO INTEGRATION]: Seamlessly composite the subject into the environment. Match the hard directional side key from a high window or rising sun. Render muted, desaturated skin tone rendering consistent with the colour grade (without changing actual skin tone). Natural shadow and dust-light contact on the subject's clothing.

[LIGHTING]: Hard directional side key light from a high window or rising sun. Deep teal-charcoal shadows with no frontal fill. Atmospheric light shafts catching dust particles.

[ATMOSPHERE]: The Social Network / Uncut Gems colour grade — muted teal shadows, desaturated skin, amber window-light warmth. Anamorphic 40mm f/2 lens character. Textured film grain. Worn premium workwear or a simple dark T-shirt. Intense focused expression. Underdog-to-empire documentary atmosphere.
`.trim(),
  },
  {
    id: "modern-corporate",
    name: "Modern Corporate",
    description:
      "Clean Harvard Business Review editorial studio portrait with minimalist palette.",
    promptTemplate: `
[BACKGROUND]: A minimalist off-white paper-sweep studio environment suited for a clean {{INDUSTRY}} editorial portrait. A single restrained accent-colour element for visual anchor (a single plant, a subtle prop, or a coloured panel placed off-centre). Generous negative space for magazine-style framing.

[SOURCE PHOTO INTEGRATION]: Seamlessly composite the subject into the studio environment. Match the bright evenly-diffused softbox key and subtle fill. Render natural soft contact shadow on the paper sweep. Human, approachable skin rendering — no plastic smoothing, no over-retouching.

[LIGHTING]: Bright evenly-diffused large softbox key from front-upper. Subtle fill from a bounce reflector. Soft hair-light for gentle separation. No harsh shadows. Clean, editorial, evenly exposed across the face.

[ATMOSPHERE]: Harvard Business Review / Fast Company cover quality. Digital medium-format camera at f/5.6 feel. Clean editorial crop with generous negative space. Tailored contemporary wardrobe in a muted premium palette. Confident approachable posture with a subtle natural smile. Polished but human.
`.trim(),
  },
];

const CUSTOM_STYLE_ID = "custom";
const STYLE_BY_ID = Object.fromEntries(DEFAULT_STYLES.map((s) => [s.id, s]));

function resolveStyle(styleId, customPrompt) {
  if (styleId === CUSTOM_STYLE_ID) {
    return {
      id: CUSTOM_STYLE_ID,
      name: "Custom Prompt",
      promptTemplate: customPrompt || "",
    };
  }
  return STYLE_BY_ID[styleId] || null;
}

module.exports = { DEFAULT_STYLES, CUSTOM_STYLE_ID, STYLE_BY_ID, resolveStyle };
