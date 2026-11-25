/**
 * Colour fields sampled from the game's Arcade tiles and Battle Pass screen.
 * Each page and each event gets one, so the same thing has the same colour everywhere.
 */
export const TONES = {
	teal: { base: '#027a66', hi: '#0aa58a' },
	purple: { base: '#5a1aa6', hi: '#7f3ad6' },
	orange: { base: '#c9560c', hi: '#ef7d22' },
	blue: { base: '#0a56ad', hi: '#2a7fe0' },
	crimson: { base: '#8f1636', hi: '#c22a52' },
	slate: { base: '#26304d', hi: '#3a4870' }
} as const;

export type Tone = keyof typeof TONES;

export type GlyphName =
	'star' | 'diamond' | 'target' | 'bolt' | 'shield' | 'clock' | 'question' | 'info';

const EVENT_TONES: Tone[] = ['teal', 'purple', 'orange', 'blue', 'crimson'];
const EVENT_GLYPHS = ['star', 'diamond', 'target', 'bolt'] as const;

/** Small stable string hash, so an event keeps its colour across pages and reloads. */
function hash(s: string): number {
	let h = 0;
	for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
	return Math.abs(h);
}

export function eventTone(key: string): Tone {
	return EVENT_TONES[hash(key) % EVENT_TONES.length];
}

export function eventGlyph(key: string): (typeof EVENT_GLYPHS)[number] {
	return EVENT_GLYPHS[hash(key + '#') % EVENT_GLYPHS.length];
}

/** Inline style that sets `--tile` / `--tile-hi` for a tone. */
export function toneStyle(tone: Tone): string {
	return `--tile: ${TONES[tone].base}; --tile-hi: ${TONES[tone].hi};`;
}
