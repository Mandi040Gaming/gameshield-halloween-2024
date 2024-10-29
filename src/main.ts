import { animation } from './asyncHelpers';
import { Cell, GameBoard } from './GameBoard';
import { addCell, isNeighbour } from './grid';
import { SIZE_X, SIZE_Y, initializeStyling } from './settings';
import './style.css';

// Hier holen wir uns die Elemente aus der HTML-Datei, die wir später brauchen.
// Das ist ein technisches Detail, auf das wir hier nicht näher eingehen werden.
const grid = document.getElementById('grid') as HTMLDivElement;
const message = document.getElementById('message') as HTMLDivElement;
const timeElement = document.getElementById('time') as HTMLSpanElement;
const pointsElement = document.getElementById('points') as HTMLSpanElement;
const gameOverDialog = document.getElementById('gameOverDialog') as HTMLDialogElement;
const playAgainButton = document.getElementById('playAgainButton') as HTMLButtonElement;

// Hier sind Variablen, die wir später brauchen.
const gameBoard = new GameBoard();
let firstSelection: Cell = null;
let firstCol = 0;
let firstRow = 0;
let seconds = 90; // <<< Hier kannst du einstellen, wieviel Zeit der Spieler zum Punktesammeln hat.
let points = 0;
let gameOver = false;

startup();

async function startup() {
  // Der Code in dieser Funktion wird am Beginn des Programms ausgeführt.

  // Das ist unser Timer. Er zählt die verbleibende Zeit herunter.
  const timer = setInterval(() => {
    seconds--;
    updateStatus();
    if (seconds <= 0) {
      // Zeit ist abgelaufen, wie zeigen "Game Over" an
      gameOver = true;
      gameOverDialog.showModal();
      clearInterval(timer);
    }
  }, 1000);

  // Am Spielende wird der Button "Nochmal spielen" angezeigt.
  playAgainButton.addEventListener('click', () => {
    // Lade die Seite neu, um das Spiel neu zu starten.
    location.reload();
  });

  // Als erstes müssen wir das Styling initialisieren. Das ist ein technisches Detail,
  // auf das wir hier nicht näher eingehen werden.
  initializeStyling();

  // Jetzt erstellen wir das Raster
  buildGrid();

  // Wir füllen das Raster mit Symbolen
  fill();

  // Punkte und Zeit anzeigen
  updateStatus();

  // Die Symbole sind nicht plötzlich da, sie werden langsam eingeblendet.
  // Daher müssen wir an dieser Stelle warten, bis die Animation abgeschlossen ist
  // und alle Symbole eingeblendet sind.
  await animation();

  // Es kann sein, dass gleich am Beginn Cluster mit mehr als 3 Symbolen entstanden.
  // Diese müssen wir entfernen und die Symbole fallen lassen.
  message.innerText = '🎃 Ich verschiebe...';
  cleanup();
}

function buildGrid() {
  // Der "for"-Befehl ist eine sogenannte Schleife. Vielleicht kennst du Schleifen
  // aus Scratch. Dort heißen sie "Wiederhole fortlaufend", "Wiederhole bis",
  // "Wiederhole ___ mal", etc.

  // Diese Schleife wird je Zeile wiederholt. "SIZE_Y" ist eine sogenannte "Konstante".
  // Sie legt fest, wie viele Zeilen wir haben (in unserem Fall 10).
  for (let row = 0; row < SIZE_Y; row++) {
    // Diese Schleife wird je Spalte wiederholt. "SIZE_X" ist wie oben eine Konstante,
    // die die Anzahl der Spalten festlegt (in unserem Fall 6).
    for (let col = 0; col < SIZE_X; col++) {
      // Diese Funktion fügt eine Zelle zu unserem Raster hinzu. Dabei übergeben
      // wir unter andere die Spalte ("col" Abkürzung für "column") und die Zeile ("row").
      addCell(grid, col, row);
    }
  }
}

function fill() {
  // In dieser Methode füllen wir unser Raster mit Symbolen (z.B. Geister, Kürbis, Süßigkeiten, etc.).

  // Später müssen wir wissen, ob wir überhaupt etwas hinzugefügt haben. Deshalb
  // merken wir uns in der Variable "addedSomething", ob wir etwas hinzugefügt haben.
  let addedSomething = false;

  // Kannst du dich noch an die "for"-Schleife aus der buildGrid-Methode erinnern?
  // Hier funktionieren die Schleifen genau gleich.
  for (let row = 0; row < SIZE_Y; row++) {
    for (let col = 0; col < SIZE_X; col++) {
      // Wir überprüfen, ob die Zelle leer ist.
      if (gameBoard.isEmpty(row, col)) {
        // Wenn ja, fügen wir ein zufälliges Symbol hinzu.
        gameBoard.addRandomSymbol(col, row, select);

        // Wie erwähnt merken wir uns in der Variable "addedSomething", dass wir etwas hinzugefügt haben.
        addedSomething = true;
      }
    }
  }

  // Wir geben zurück, ob wir etwas hinzugefügt haben.
  return addedSomething;
}

export async function select(selectedSymbol: HTMLDivElement, col: number, row: number) {
  if (message.innerText || gameOver) {
    return;
  }

  // Der Benutzer hat ein Symbol angeklickt. Es gibt drei Fälle:
  // 1. Der Benutzer hat das erste Mal ein Symbol angeklickt
  //    -> wir müssen es markieren und uns die Auswahl merken
  // 2. Der Benutzer hat das gleiche Symbol ein zweites Mal angeklickt
  //    -> wir müssen die Markierung entfernen
  // 3. Der Benutzer hat zwei unterschiedliche Symbole angeklickt
  //    -> wir müssen prüfen, ob sie nebeneinander liegen und - falls ja - dann tauschen

  if (!firstSelection) {
    // Der Benutzer hat das erste Mal ein Symbol angeklickt.
    // Markieren wir es und merken wir uns die Auswahl.
    gameBoard.markAsSelected(selectedSymbol);
    firstSelection = selectedSymbol;
    firstCol = col;
    firstRow = row;
  } else if (firstSelection === selectedSymbol) {
    // Der Benutzer hat das gleich Symbol ein zweites Mal angeklickt.
    // In diesem Fall entfernen wir die Selektion.
    gameBoard.removeSelectionMark(firstSelection);
    firstSelection = null;
  } else {
    // Der Benutzer hat ein zweites Symbol angeklickt.
    const secondSelection = selectedSymbol;
    const secondCol = col;
    const secondRow = row;

    // Prüfen wir, ob die Symbole nebeneinander liegen.
    // Nur wenn die Symbole Nachbarn sind, ist die Auswahl des Benutzers gültig.
    if (isNeighbour(firstRow, secondRow, firstCol, secondCol)) {
      // Wenn ja, markieren wir das zweite Symbol
      gameBoard.markAsSelected(secondSelection);

      points--;
      updateStatus();

      // Tauschen wir die Symbole miteinander
      gameBoard.switchSymbols(firstSelection, secondSelection);

      // Wir müssen herausfinden, in welche Richtung die Symbole bewegt werden müssen.
      const firstDir = gameBoard.getDirection(firstRow, firstCol, secondRow, secondCol);
      const secondDir = gameBoard.getDirection(secondRow, secondCol, firstRow, firstCol);

      // Jetzt können wir die Symbole bewegen.
      gameBoard.moveAnimation(firstSelection, firstDir);
      gameBoard.moveAnimation(secondSelection, secondDir);

      message.innerText = '🎃 Ich verschiebe...';
      await animation();
      firstSelection.classList.remove('selected');
      secondSelection.classList.remove('selected');
      firstSelection = null;
      await cleanup();
    }
  }
}

async function cleanup() {
  // Alle Gruppen mit 3 gleichen, benachbarten Symbolen finden
  const clusters = gameBoard.findClusters();
  if (clusters.length > 0) {
    // Wir haben Gruppen gefunden. Lassen wir die Symbole der
    // Gruppen verschwinden.
    for (const cluster of clusters) {
      for (const item of cluster) {
        gameBoard.letDisappear(item.symbol);
      }
    }

    // Die Symbole verschwinden nicht sofort, sondern werden
    // langsam ausgeblendet. Daher müssen wir einen Moment warten,
    // bis die Animation fertig ist.
    await animation();

    for (const cluster of clusters) {
      // Punkteberechnung
      points += cluster.length * cluster.length - 6;
      updateStatus();

      // Gruppen löschen
      for (const item of cluster) {
        gameBoard.removeSymbol(item.symbol);
      }
    }

    fallDown();
  } else {
    message.innerText = '';
  }
}

async function fallDown() {
  // Hier lassen wir die Symbole nach unten fallen.

  // Wir merken uns, ob wir überhaupt etwas bewegt haben.
  let somethingMoved = false;

  // Unser alter Bekannter, die "for"-Schleife...
  for (let row = 1; row < SIZE_Y; row++) {
    for (let col = 0; col < SIZE_X; col++) {
      // Prüfen, ob das Symbol nach unten fallen kann (d.h. die Zelle darunter ist leer)
      if (gameBoard.canMoveDown(row - 1, col)) {
        // Wenn ja, lassen wir es fallen.
        gameBoard.fallDown(row - 1, col);

        // Und merken uns, dass wir etwas bewegt haben.
        somethingMoved = true;
      }
    }
  }

  if (somethingMoved) {
    // Falls wir etwas bewegt haben, warten wir, bis die Animation abgeschlossen ist
    await animation();

    // Durch das nach unten fallen könnten wieder neue Lücken enstanden sein, in die
    // Symbole fallen können. Daher rufen wir die Methode erneut auf.
    fallDown();
  } else {
    // Falls wir nichts bewegt haben, füllen wir die enstandenen, leeren Zellen neu auf.
    if (fill()) {
      // Warten, bis die Symbole eingeblendet sind
      await animation();

      // Vielleicht hat der Benutzer Glück und es gibt wieder Cluster mit mehr als 3 Symbolen.
      cleanup();
    }
  }
}

function updateStatus() {
  // Hier aktualisieren wir die Anzeige der verbleibenden Zeit und der Punkte.

  // Die nächste Zeile ist eine echte Herausforderung. Sie enthält viiiiiele Sonderzeichen 😅.
  // Wir verwenden sie, um die verbleibende Zeit anzuzeigen.
  timeElement.innerText = `${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? '0' : ''}${seconds % 60}`;

  // Und hier zeigen wir die Punkte an.
  pointsElement.innerText = points.toString();
}
