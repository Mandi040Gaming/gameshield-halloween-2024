import { SIZE_X, SIZE_Y } from './settings';

export type Cell = HTMLDivElement | null;

export function createEmptyCells(): Cell[][] {
  return Array.from({ length: SIZE_Y }, () => Array(SIZE_X).fill(null));
}

export function addCell(grid: HTMLDivElement, col: number, row: number) {
  const cell = document.createElement('div');
  if (col === SIZE_X - 1) {
    cell.classList.add('border-right');
  }
  if (row === SIZE_Y - 1) {
    cell.classList.add('border-bottom');
  }
  grid.appendChild(cell);
}

export function isNeighbour(selectedRow: number, row: number, selectedCol: number, col: number): boolean {
  return (Math.abs(selectedRow - row) === 1 && selectedCol === col) || (Math.abs(selectedCol - col) === 1 && selectedRow === row);
}
