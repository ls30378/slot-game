import { BOOK_OF_RA_SYMBOLS, ReelSymbol } from "../constants";

export interface LineInfo {
  lineId?: number | null;
  winningSymbol: ReelSymbol;
  consecutiveSymbols: number;
  lineWin: number;
  multiplier: number;
}

export type SpinResult = {
  reels: ReelSymbol[][];
  winningLines: LineInfo[];
  totalWin: number;
};
const lineSymbols = new Map<number, number[]>();
lineSymbols.set(1, [1, 1, 1, 1, 1]);
lineSymbols.set(2, [0, 0, 0, 0, 0]);
lineSymbols.set(3, [2, 2, 2, 2, 2]);
lineSymbols.set(4, [0, 1, 2, 1, 0]);
lineSymbols.set(5, [2, 1, 0, 1, 2]);
lineSymbols.set(6, [1, 2, 2, 2, 1]);
lineSymbols.set(7, [1, 0, 0, 0, 1]);
lineSymbols.set(8, [2, 2, 1, 0, 0]);
lineSymbols.set(9, [0, 0, 1, 2, 2]);
lineSymbols.set(10, [2, 1, 1, 1, 0]);

export class GameActions {
  private static _balance = 1000;
  private static _bet = 500;
  private static _lines = 10;
  private static _reels: ReelSymbol[][] = [];
  private static _lastResults: SpinResult;

  private static payTable = new Map<ReelSymbol, Map<number, number>>([
    [
      ReelSymbol.BOOK,
      new Map<number, number>([
        [6, 500],
        [5, 200],
        [4, 20],
        [3, 2],
      ]),
    ],
    [
      ReelSymbol.ACE,
      new Map<number, number>([
        [6, 300],
        [5, 150],
        [4, 40],
        [3, 5],
      ]),
    ],
    [
      ReelSymbol.KING,
      new Map<number, number>([
        [6, 300],
        [5, 150],
        [4, 40],
        [3, 5],
      ]),
    ],
    [
      ReelSymbol.QUEEN,
      new Map<number, number>([
        [6, 200],
        [5, 100],
        [4, 25],
        [3, 5],
      ]),
    ],
    [
      ReelSymbol.JACK,
      new Map<number, number>([
        [6, 200],
        [5, 100],
        [4, 25],
        [3, 5],
      ]),
    ],
    [
      ReelSymbol.TEN,
      new Map<number, number>([
        [6, 200],
        [5, 100],
        [4, 25],
        [3, 5],
      ]),
    ],
    [
      ReelSymbol.EXPLORER,
      new Map<number, number>([
        [6, 10000],
        [5, 5000],
        [4, 1000],
        [3, 100],
        [2, 10],
      ]),
    ],
    [
      ReelSymbol.PHARAOH,
      new Map<number, number>([
        [6, 5000],
        [5, 2000],
        [4, 400],
        [3, 40],
        [2, 5],
      ]),
    ],
    [
      ReelSymbol.SCARAB,
      new Map<number, number>([
        [6, 1500],
        [5, 750],
        [4, 100],
        [3, 30],
        [2, 5],
      ]),
    ],
    [
      ReelSymbol.STATUE,
      new Map<number, number>([
        [6, 1500],
        [5, 750],
        [4, 100],
        [3, 30],
        [2, 5],
      ]),
    ],
  ]);

  static get balance(): number {
    return this._balance;
  }
  static set balance(value: number) {
    this._balance = value;
  }

  static get bet(): number {
    return this._bet;
  }
  static get lines(): number {
    return this._lines;
  }
  static async spin(): Promise<SpinResult> {
    return new Promise<SpinResult>((resolve, reject) => {
      setTimeout(() => {
        if (this.balance < this.bet) {
          reject("Insufficient balance to spin");
        }
        this.balance -= this.bet;
        const screen = this._reels.map((reel: ReelSymbol[]) => {
          const pos = Math.trunc(Math.random() * reel.length);
          return [
            reel[pos],
            reel[(pos + 1) % reel.length],
            reel[(pos + 2) % reel.length],
          ];
        });

        const lines = this.calculateWin(screen);

        const totalWin = this.preciseAdd(lines.map((l) => l.lineWin));
        const results = {
          reels: screen,
          winningLines: lines,
          totalWin,
        };
        this._lastResults = results;
        resolve(results);
      }, 1000);
    });
  }
  static get lastResults(): SpinResult {
    return this._lastResults;
  }
  private static calculateWin(screen: ReelSymbol[][]): LineInfo[] {
    const betAmount = this.bet;
    const lineCount = this.lines;
    const winningLines: LineInfo[] = [];

    for (let i = 1; i <= lineCount; i++) {
      const lineId = i;
      const activePositions = lineSymbols.get(lineId);

      if (activePositions === undefined)
        throw new Error(`BUG: invalid line id = ${lineId}`);

      const firstPosition = activePositions[0];
      const firstSymbol = screen[0][firstPosition];

      let winningSymbol = firstSymbol;
      let consecutiveSymbols = 1;
      for (let reelIndex = 1; reelIndex < activePositions.length; reelIndex++) {
        const position = activePositions[reelIndex];
        const currentSymbol = screen[reelIndex][position];

        if (currentSymbol === winningSymbol) {
          consecutiveSymbols++;
        } else {
          break;
        }
      }

      if (winningSymbol !== null || consecutiveSymbols === 5) {
        let multiplier = this.payTable
          .get(winningSymbol)
          ?.get(consecutiveSymbols);

        if (multiplier !== undefined) {
          const lineWin = this.preciseMultiply(
            betAmount / lineCount,
            multiplier,
          );
          if (lineWin === 0) {
            continue;
          }
          winningLines.push({
            lineId,
            consecutiveSymbols,
            winningSymbol: winningSymbol ?? ReelSymbol.EXPLORER,
            lineWin,
            multiplier,
          });
        }
      }
    }

    return winningLines;
  }

  static preciseMultiply(a: number, b: number): number {
    return parseFloat((a * b).toFixed(10));
  }

  static preciseAdd(numbers: number[]): number {
    return numbers.reduce((acc, num) => parseFloat((acc + num).toFixed(10)), 0);
  }

  static randomReelStrip(total: number = 30): ReelSymbol[] {
    const enumSymbols: ReelSymbol[] = BOOK_OF_RA_SYMBOLS.map((_, i) => i);
    const result: ReelSymbol[] = [];
    for (let i = 0; i < total; i++) {
      const last = result[i - 1];
      const choices = enumSymbols.filter((s) => s !== last);
      const pick = choices[Math.floor(Math.random() * choices.length)];
      result.push(pick);
    }
    this._reels.push(result);
    return result;
  }
  static saveWin(): number {
    this._balance = this.balance + this._lastResults.totalWin;
    return this.balance;
  }
}
