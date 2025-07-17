import {
  GameActions,
  lineSymbols,
  type LineInfo,
  type SpinResult,
} from "../../../lib";
import { SymbolContainer } from "../";
import {
  BOOK_OF_RA_SYMBOLS,
  EventConstants,
  ReelSymbol,
} from "../../../constants";
import { EventBus } from "../../utils/event-bus";

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
  private reels: ReelSymbol[][] = [];
  private winningLines: LineInfo[];
  resultSprites = new Map<string, SymbolContainer>();
  globalY: number;
  private _shouldStopAnimations = false;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    globalY: number = 0,
  ) {
    super(scene, x, y);
    this.globalY = globalY;
    this.setSize(width, height);
    this.debugRect = scene.add.rectangle(0, 0, width, height, 0x1234ff, 0);
    this.debugRect.setStrokeStyle(2, 0xfffffff, 1);
    this.debugRect.setOrigin(0, 0);
    this.add(this.debugRect);
    this.updateComputedValues();
    this.createColumns();
    this.onResize(width, height, globalY);
  }
  set shouldStopAnimations(value: boolean) {
    this._shouldStopAnimations = value;
  }

  onResize(width: number, height: number, globalY: number) {
    this.globalY = globalY;
    this.setSize(width, height);
    this.debugRect.setSize(width, height);
    this.debugRect.setPosition(0, 0);

    this.updateColumnPositions();
    this.updateComputedValues();
  }

  private resetNewRound() {
    this.activeTweens = [];
    this.resultSprites.clear();
    this.shouldStopAnimations = false;
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

    maskGraphics.setPosition(0, this.globalY);
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
    this.setFinalSymbols(columnIndex);
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
    this.symbolContainers.forEach((columnSymbols, columnIndex) => {
      this.resetSymbolsForSpin(columnIndex);
      const duration = this._baseDuration + columnIndex * this._delayPerReel;

      const symbols = this.symbolContainers[columnIndex];
      const totalSymbols = symbols.length;

      const totalDistance = this.symbolHeight * (totalSymbols - 3);
      columnSymbols.forEach((symbol) => {
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
              EventBus.emit(EventConstants.spinComplete);
            }
          },
        });

        this.activeTweens.push(tween);
      });
    });
  }

  private setFinalSymbols(columnIndex: number): void {
    const symbols = this.symbolContainers[columnIndex];
    if (!this.reels[columnIndex]) return;
    const winningSymbols = this.reels[columnIndex] || [];

    // Position and update the first 3 winning symbols (the visible ones)
    for (let i = 0; i < winningSymbols?.length; i++) {
      try {
        const symbol = symbols[i];

        symbol.y = -i * this.symbolHeight + this.symbolHeight * 2;
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
  handleSpinResult(spinResult: SpinResult) {
    this.reels = spinResult.reels;
    this.winningLines = spinResult?.winningLines;
  }

  stopSpin() {
    this.activeTweens.forEach((tween) => {
      tween.complete();
    });
  }

  startWinAnimations = async (index: number) => {
    // // Retrieve the positions of the symbols for the winning line at the current reelIndex
    const lineElements: (number | undefined)[] =
      this.getLineElementsToAnimate(index);
    // If there are wins
    if (lineElements.filter((le) => le !== undefined).length) {
      // Retrieve only the elements that need to animate
      let spliceIndex = 0;
      const lineId = this.winningLines[index]?.lineId;
      for (const [i, l] of lineElements.entries()) {
        const currentSprite = this.resultSprites.get([i, l].join("-"));
        if (!lineId) {
          spliceIndex = this._numColumns;
          break;
        } else {
          if (
            currentSprite?.symbol !==
            BOOK_OF_RA_SYMBOLS[this.winningLines[index]?.winningSymbol]
          ) {
            spliceIndex = i;
            break;
          } else spliceIndex = this._numColumns;
        }
      }

      EventBus.emit(EventConstants.setLineId, lineId);
      const elementsThatShouldAnimate = [...lineElements].splice(
        0,
        spliceIndex,
      );
      const stopElementsAnimations = () =>
        elementsThatShouldAnimate.forEach((l, i) => {
          const currentSprite = this.resultSprites.get([i, l].join("-"));
          currentSprite?.stopWinAnimation();
        });

      let completedAnimations = 0;

      // Iterate through each symbol in the winning line
      elementsThatShouldAnimate.forEach(async (l, i) => {
        // for (const [i, l] of elementsThatShouldAnimate.entries()) {
        if (l === undefined) {
          completedAnimations++;
          // continue;
          return;
        }
        const currentSprite = this.resultSprites.get([i, l].join("-"));
        // Play the winning animation for the current sprite
        await currentSprite?.playWinAnimation();
        if (this._shouldStopAnimations) {
          return;
        }
        completedAnimations++;

        // Move to the next winning line once all animations for the current line are completed
        if (completedAnimations === spliceIndex) {
          const nextLine = this.winningLines?.[index + 1];
          if (nextLine) {
            stopElementsAnimations();

            this.startWinAnimations(index + 1);
          } else {
            if (index) {
              stopElementsAnimations();
              this.startWinAnimations(0);
            }
            return;
          }
        }
      });
    }
  };
  stopWinAnimations() {
    this.shouldStopAnimations = true;
    this.resultSprites.forEach((sprite) => {
      sprite.stopWinAnimation();
    });
  }
  private getLineElementsToAnimate(index: number): (number | undefined)[] {
    let lineElements: (number | undefined)[] = [];
    // If there is line id it 's normal win line
    if (this.winningLines[index]?.lineId)
      lineElements = lineSymbols.get(
        this.winningLines[index]?.lineId as number,
      )!;

    return lineElements;
  }
}
