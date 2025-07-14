import { BOOK_OF_RA_SYMBOLS, ReelSymbol } from "../constants";

export class GameActions {
  static randomReelStrip(total: number = 30): ReelSymbol[] {
    const enumSymbols: ReelSymbol[] = BOOK_OF_RA_SYMBOLS.map((_, i) => i);
    const result: ReelSymbol[] = [];
    for (let i = 0; i < total; i++) {
      const last = result[i - 1];
      const choices = enumSymbols.filter((s) => s !== last);
      const pick = choices[Math.floor(Math.random() * choices.length)];
      result.push(pick);
    }
    return result;
  }
}
