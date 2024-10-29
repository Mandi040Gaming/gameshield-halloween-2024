// Wie groß soll das Spielfeld sein?
export const SIZE_X = 6; // Anzahl der Spalten
export const SIZE_Y = 10; // Anzahl der Zeilen

// Unser Spiel enthält Animationen. Wie lange sollen sie dauern?
// Experimentiere mit Werten zwischen 0.25 und 3 Sekunden.
export const ANIMATION_DURATION = 0.25;

export const CELL_SIZE = 50;

export const symbolImages = ['bomb', 'pumpkin', 'sweet-blue', 'ghost', 'skull', 'sweet-green', 'sweet-pink', 'eye', 'heart', 'potion'];

export function initializeStyling() {
  const root = document.documentElement;

  root.style.setProperty('--cells-horz', SIZE_X.toString());
  root.style.setProperty('--cells-vert', SIZE_Y.toString());
  root.style.setProperty('--cell-size', `${CELL_SIZE}px`);
  root.style.setProperty('--animation-duration', `${ANIMATION_DURATION}s`);
}