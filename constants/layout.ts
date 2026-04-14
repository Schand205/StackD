import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/** Font sizes — relative to screen width */
export const FS = {
  tiny:   width * 0.020,  // ~7.8px  — week bar labels, micro text
  small:  width * 0.028,  // ~10.9px — card labels, pill text, tab labels
  body:   width * 0.033,  // ~12.9px — body text, activity title
  large:  width * 0.046,  // ~17.9px — big stat values (kcal, exercises)
  title:  width * 0.056,  // ~21.8px — app title "stackd"
} as const;

/** Spacing — relative to screen width */
export const SP = {
  outer:  width * 0.040,  // ~15.6px — outer horizontal margin
  card:   width * 0.036,  // ~14px   — card internal padding
  gap:    width * 0.015,  // ~5.85px — gap between elements
} as const;

export { width as screenWidth };
