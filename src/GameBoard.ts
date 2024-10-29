import { CELL_SIZE, SIZE_X, SIZE_Y, symbolImages } from './settings';

export type Cell = HTMLDivElement | null;

export type Cluster = { symbol: HTMLDivElement; row: number; col: number }[];

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

// export function emptyCluster(): Cluster {
//     return [];
// }

// export function emptyClusters(): Cluster[] {
//     return [];
// }

// export function emptyVisited(): boolean[][] {
//     return Array.from({ length: SIZE_Y }, () => Array(SIZE_X).fill(false));
// }

export class GameBoard {
  private symbols: HTMLDivElement;
  private cells: Cell[][];

  constructor() {
    this.symbols = document.getElementById('symbols') as HTMLDivElement;
    this.cells = Array.from({ length: SIZE_Y }, () => Array(SIZE_X).fill(null));
  }

  public isEmpty(row: number, col: number): boolean {
    return this.cells[row][col] === null;
  }

  public addRandomSymbol(col: number, row: number, select: (icon: HTMLDivElement, col: number, row: number) => void) {
    const symbol = document.createElement('div');
    symbol.classList.add(symbolImages[Math.floor(Math.random() * symbolImages.length)]);
    symbol.classList.add('fade-in');
    symbol.style.transform = `translate(${col * CELL_SIZE}px, ${row * CELL_SIZE}px)`;
    symbol.addEventListener('click', () => {
      const [currentRow, currentCol] = this.findSymbol(symbol);
      select(symbol, currentCol, currentRow);
    });
    this.symbols.appendChild(symbol);
    this.cells[row][col] = symbol;
  }

  public getSymbolName(row: number, col: number): string {
    return symbolImages.find((icon) => this.cells[row][col]!.classList.contains(icon))!;
  }

  public getSymbol(row: number, col: number): HTMLDivElement {
    return this.cells[row][col]!;
  }

  public findSymbol(symbol: HTMLDivElement) {
    const row = this.cells.findIndex((row) => row.includes(symbol));
    const col = this.cells[row].indexOf(symbol);
    return [row, col];
  }

  public switchSymbols(first: HTMLDivElement, second: HTMLDivElement) {
    const [firstRow, firstCol] = this.findSymbol(first);
    const [secondRow, secondCol] = this.findSymbol(second);
    const temp = this.cells[firstRow][firstCol];
    this.cells[firstRow][firstCol] = this.cells[secondRow][secondCol];
    this.cells[secondRow][secondCol] = temp;
  }

  public removeSymbol(symbol: HTMLDivElement) {
    const [row, col] = this.findSymbol(symbol);
    this.cells[row][col] = null;
    this.symbols.removeChild(symbol);
  }

  public letDisappear(symbol: HTMLDivElement) {
    symbol.classList.add('disappear');
  }

  public highlight(symbol: HTMLDivElement) {
    symbol.classList.add('highlighted');
  }

  private isInBounds(row: number, col: number): boolean {
    return row >= 0 && row < SIZE_Y && col >= 0 && col < SIZE_X;
  }

  public findCluster(row: number, col: number, cluster: Cluster, visited: boolean[][]) {
    const symbol = this.getSymbolName(row, col);
    this.findClusterImpl(row, col, symbol, cluster, visited);
  }

  private findClusterImpl(row: number, col: number, symbol: string, cluster: Cluster, visited: boolean[][]) {
    if (!this.isInBounds(row, col)) {
      return;
    }

    if (visited[row][col] || !this.cells[row][col] || !this.cells[row][col]!.classList.contains(symbol)) {
      return;
    }

    visited[row][col] = true;
    cluster.push({ symbol: this.cells[row][col]!, row, col });

    // Explore neighbors
    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0], // Right, Down, Left, Up
    ];
    for (const [dx, dy] of directions) {
      this.findClusterImpl(row + dx, col + dy, symbol, cluster, visited);
    }
  }

  public canMoveDown(row: number, col: number): boolean {
    return row + 1 < SIZE_Y && this.cells[row][col] !== null && this.cells[row + 1][col] === null;
  }

  public fallDown(row: number, col: number) {
    const temp = this.cells[row][col];
    this.cells[row][col] = null;
    this.cells[row + 1][col] = temp;

    this.moveAnimation(temp!, Direction.Down);
  }

  public moveAnimation(symbol: HTMLDivElement, direction: Direction) {
    const currentTransform = symbol.style.transform;
    const translateMatch = currentTransform.match(/translate\((\d+)px, (\d+)px\)/);
    if (translateMatch) {
      const currentTranslateX = parseInt(translateMatch[1], 10);
      const currentTranslateY = parseInt(translateMatch[2], 10);
      let newTranslateX = currentTranslateX;
      let newTranslateY = currentTranslateY;
      switch (direction) {
        case Direction.Up:
          newTranslateY = currentTranslateY - CELL_SIZE;
          break;
        case Direction.Down:
          newTranslateY = currentTranslateY + CELL_SIZE;
          break;
        case Direction.Left:
          newTranslateX = currentTranslateX - CELL_SIZE;
          break;
        case Direction.Right:
          newTranslateX = currentTranslateX + CELL_SIZE;
          break;
      }
      symbol.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px)`;
    }
  }

  public removeSelectionMark(symbol: HTMLDivElement) {
    symbol.classList.remove('selected');
  }

  public markAsSelected(symbol: HTMLDivElement) {
    symbol.classList.add('selected');
  }

  public getDirection(fromRow: number, fromCol: number, toRow: number, toCol: number) {
    if (fromRow < toRow) {
      return Direction.Down;
    } else if (fromRow > toRow) {
      return Direction.Up;
    } else if (fromCol < toCol) {
      return Direction.Right;
    } else {
      return Direction.Left;
    }
  }

  public findClusters() {
    const visited: boolean[][] = Array.from({ length: SIZE_Y }, () => Array(SIZE_X).fill(false));
    const clusters: Cluster[] = [];

    for (let row = 0; row < SIZE_Y; row++) {
      for (let col = 0; col < SIZE_X; col++) {
        if (!visited[row][col]) {
          if (!this.isEmpty(row, col)) {
            const cluster: Cluster = [];
            this.findCluster(row, col, cluster, visited);
            if (cluster.length >= 3) {
              clusters.push(cluster);
            }
          }
        }
      }
    }

    return clusters;
  }
}
