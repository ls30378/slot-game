import { GameActions } from "../../../lib/game-actions";
import { SymbolContainer } from "../";

export class ReelsContainer extends Phaser.GameObjects.Container {
  private debugRect: Phaser.GameObjects.Rectangle;
  private _numColumns = 5;

  private columnContainers: Phaser.GameObjects.Container[] = [];
  private symbolContainers: SymbolContainer[][] = []; // Store symbols for each column

  private maskGraphicsList: Phaser.GameObjects.Graphics[] = [];
  private geometryMasks: Phaser.Display.Masks.GeometryMask[] = [];
  private symbolHeight: number;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    super(scene, x, y);
    this.setSize(width, height);

    this.debugRect = scene.add.rectangle(0, 0, width, height, 0x0000ff, 0.4);
    this.debugRect.setOrigin(0, 0);
    this.add(this.debugRect);
    this.updateComputedValues();
    this.createColumns();
  }
  onResize(width: number, height: number) {
    this.setSize(width, height);
    this.debugRect.setSize(width, height);
    this.debugRect.setPosition(0, 0);
    this.updateColumnPositions();
    this.updateComputedValues();
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
    let parent = this.parentContainer;

    while (parent) {
      x += parent.x;
      y += parent.y;
      parent = parent.parentContainer;
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
    const symbolsForColumn = GameActions.randomReelStrip();
    const columnSymbols: SymbolContainer[] = [];

    symbolsForColumn.forEach((symbol, i) => {
      const symbolY = i * this.symbolHeight;
      console.log(symbolY);
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
  }
  private updateComputedValues() {
    this.symbolHeight = this.height / 3;
  }

  private updateSymbolScaling(columnIndex: number): void {
    if (!this.symbolContainers[columnIndex]) return;
    this.symbolContainers[columnIndex].forEach((symbol, i) => {
      const symbolY = i * this.symbolHeight;
      symbol.setPosition(0, symbolY);
      symbol.onResize(this.width / this._numColumns, this.symbolHeight);
    });
  }
}
