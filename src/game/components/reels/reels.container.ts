import { GameActions } from "../../../lib/game-actions";
import { SymbolContainer } from "../";
import { EventBus } from "../../utils/event-bus";
import {
  BOOK_OF_RA_SYMBOLS,
  EventConstants,
  ReelSymbol,
} from "../../../constants";

export class ReelsContainer extends Phaser.GameObjects.Container {
  private debugRect: Phaser.GameObjects.Rectangle;
  private _numColumns = 5;

  private columnContainers: Phaser.GameObjects.Container[] = [];
  private symbolContainers: SymbolContainer[][] = []; // Store symbols for each column
  private symbolTypes: ReelSymbol[][] = []; // Store base symbol types for each column

  private maskGraphicsList: Phaser.GameObjects.Graphics[] = [];
  private geometryMasks: Phaser.Display.Masks.GeometryMask[] = [];
  private symbolHeight: number;

  private activeTweens: Phaser.Tweens.Tween[] = [];

  isSpinning = false;
  private _baseDuration: number = 800;
  private _delayPerReel = 400;

  // Result sprites for the final symbols after spin
  private reels: ReelSymbol[][] = [
    [3, 2, 9],
    [7, 9, 5],
    [2, 9, 2],
    [7, 8, 9],
    [3, 0, 1],
  ];
  resultSprites = new Map<string, SymbolContainer>();
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    super(scene, x, y);
    this.setSize(width, height);
    this.debugRect = scene.add.rectangle(0, 0, width, height, 0x1234ff, 0.4);
    this.debugRect.setOrigin(0, 0);
    this.add(this.debugRect);
    this.updateComputedValues();
    this.createColumns();
    EventBus.on(EventConstants.spinButtonClick, () => this.startSpin());
    this.onResize(width, height);
    console.log("Parent container:", this.parentContainer);
  }
  onResize(width: number, height: number) {
    this.setSize(width, height);
    this.debugRect.setSize(width, height);
    this.debugRect.setPosition(0, 0);
    this.updateColumnPositions();
    this.updateComputedValues();
  }

  private resetNewRound() {
    this.activeTweens = [];
    this.resultSprites.clear();
  }

  private createColumns() {
    let startX = this.width / 5;
    for (let i = 0; i < this._numColumns; i++) {
      const columnContainer = new Phaser.GameObjects.Container(
        this.scene,
        startX * i,
        0,
      );
      columnContainer.setSize(this.width / 5, this.height);
      this.add(columnContainer);
      this.columnContainers.push(columnContainer);
      this.populateColumn(columnContainer, i);
    }
    this.createMask();
  }
  private createMask() {
    const maskGraphics = this.scene.add.graphics();

    maskGraphics.fillRect(0, 0, this.width, this.height);

    const { x, y } = this.getContainerGlobalPosition();
    maskGraphics.setPosition(x, y);
    console.log("Global Position for Mask:", x, y);
    const geometryMask = maskGraphics.createGeometryMask();

    this.columnContainers.forEach((columnContainer) => {
      columnContainer.setMask(geometryMask);
    });

    this.maskGraphicsList.push(maskGraphics);
    this.geometryMasks.push(geometryMask);
  }
  private getContainerGlobalPosition(): { x: number; y: number } {
    let x = this.x;
    let y = this.y;
    let parent: Phaser.GameObjects.Container = this.parentContainer;
    while (parent) {
      x += parent.x;
      y += parent.y;
      parent = parent?.parentContainer;
    }

    return { x, y };
  }
  private updateMaskPositions() {
    this.maskGraphicsList.forEach((maskGraphic) => {
      if (maskGraphic) {
        maskGraphic.destroy();
      }
    });
    this.maskGraphicsList = [];
    this.geometryMasks = [];

    this.createMask();
  }

  private updateColumnPositions() {
    if (!this.columnContainers.length) return;
    let startX = this.width / 5;

    this.columnContainers.forEach((columnContainer, i) => {
      columnContainer.setPosition(startX * i, 0);
      this.updateSymbolScaling(i);
    });

    this.updateMaskPositions();
  }
  private populateColumn(
    columnContainer: Phaser.GameObjects.Container,
    columnIndex: number,
  ) {
    const symbolsForColumn = GameActions.randomReelStrip(30);
    const columnSymbols: SymbolContainer[] = [];

    symbolsForColumn.forEach((symbol, i) => {
      const symbolY = -i * this.symbolHeight + this.symbolHeight * 2;
      const symbolContainer = new SymbolContainer(
        this.scene,
        0,
        symbolY,
        this.width / this._numColumns,
        this.symbolHeight,
        symbol,
      );
      columnContainer.add(symbolContainer).setDepth(2);
      columnContainer.sendToBack(symbolContainer);
      columnSymbols.push(symbolContainer);
    });

    this.symbolContainers[columnIndex] = columnSymbols;
    this.symbolTypes[columnIndex] = symbolsForColumn;
  }
  private updateComputedValues() {
    this.symbolHeight = this.height / 3;
  }

  private updateSymbolScaling(columnIndex: number): void {
    if (!this.symbolContainers[columnIndex]) return;
    this.symbolContainers[columnIndex].forEach((symbol, i) => {
      const symbolY = -i * this.symbolHeight + this.symbolHeight * 2;
      symbol.setPosition(0, symbolY);
      symbol.onResize(this.width / this._numColumns, this.symbolHeight);
    });
  }

  private resetSymbolsForSpin(columnIndex: number) {
    const symbols = this.symbolContainers[columnIndex];
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      symbol.updateText(BOOK_OF_RA_SYMBOLS[this.symbolTypes[columnIndex][i]]);
      symbol.y = -i * this.symbolHeight + this.symbolHeight * 2;
      symbol.setVisible(true);
    }
  }

  startSpin() {
    if (this.isSpinning) return;
    console.log("Spinning reels...");
    this.resetNewRound();
    let spinningSymbolsCount = 0;
    this.isSpinning = true;
    console.log(this.symbolContainers);
    this.symbolContainers.forEach((columnSymbols, columnIndex) => {
      this.resetSymbolsForSpin(columnIndex);
      const duration = this._baseDuration + columnIndex * this._delayPerReel;

      const symbols = this.symbolContainers[columnIndex];
      const totalSymbols = symbols.length;

      const totalDistance = this.symbolHeight * (totalSymbols - 3);
      columnSymbols.forEach((symbol, symbolIndex) => {
        if (!(symbol instanceof SymbolContainer)) return;
        spinningSymbolsCount++;

        const tween = this.scene.tweens.add({
          targets: symbol,
          y: `+=${totalDistance}`,
          ease: "Power3.easeIn",
          duration,
          onComplete: () => {
            symbol.setVisible(false);
            this.setFinalSymbols(columnIndex);
            spinningSymbolsCount--;
            if (spinningSymbolsCount === 0) {
              this.isSpinning = false;
            }
          },
        });

        this.activeTweens.push(tween);
      });
    });
  }
  private setFinalSymbols(columnIndex: number): void {
    const symbols = this.symbolContainers[columnIndex];
    const winningSymbols = this.reels[columnIndex] || [];

    // Position and update the first 3 winning symbols (the visible ones)
    for (let i = 0; i < winningSymbols?.length; i++) {
      try {
        const symbol = symbols[i];

        symbol.y = i * this.symbolHeight;
        symbol.updateText(BOOK_OF_RA_SYMBOLS[winningSymbols[i]]);
        symbol.setVisible(true);

        // push the Symbol to array, to play win animation on complete
        this.resultSprites.set([columnIndex, i].join("-"), symbol);
      } catch (error) {
        console.log("Error setting final symbol:", error);
        throw error;
      }
    }
  }
}
