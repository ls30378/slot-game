import { BOOK_OF_RA_SYMBOLS, ReelSymbol } from "../../../constants";

export class SymbolContainer extends Phaser.GameObjects.Container {
  private winRect: Phaser.GameObjects.Rectangle;
  private title: Phaser.GameObjects.Text;
  private titleFontSize: number;
  private _enabled = false;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    symbol: ReelSymbol,
  ) {
    super(scene, x, y);
    this.setSize(width, height);
    this.title = new Phaser.GameObjects.Text(
      scene,
      width / 2,
      height / 2,
      BOOK_OF_RA_SYMBOLS[symbol],
      {
        fontFamily: "Arial Black",
        fontSize: this.titleFontSize,
        fontStyle: "600",
        color: "#ffffff",
      },
    ).setOrigin(0.5);

    this.winRect = scene.add.rectangle(0, 0, width, height, 0xffc000, 0);
    this.winRect.setOrigin(0, 0);
    this.winRect.setVisible(false);
    this.add([this.winRect, this.title]);
  }
  onResize(width: number, height: number) {
    this.setSize(width, height);
    this.updateComputedValues();
    this.title.setFontSize(this.titleFontSize);
    this.title.setPosition(width / 2, height / 2);
    this.winRect.setStrokeStyle(2, 0xfffffff, 1);
    this.winRect.setSize(width, height);
    this.winRect.setPosition(0, 0);
  }
  private updateComputedValues() {
    const computedFontSize = Math.floor(
      Math.min(this.width * 0.1, this.height * 0.7),
    );
    const baseFontSize = 39; // Base font size for maximum scaling
    this.titleFontSize = Math.min(baseFontSize, computedFontSize);
  }
  set enabled(value: boolean) {
    if (value) this.setAlpha(1);
    else this.setAlpha(0.5);
    this._enabled = value;
  }
  handlePointerdown() {
    if (!this._enabled) return;
  }
  updateText(text: string) {
    this.title.setText(text);
  }
  playWinAnimation() {
    this.winRect.setVisible(true);
  }
  stopWinAnimation() {
    this.winRect.setVisible(false);
  }
}
