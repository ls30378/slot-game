import { EventConstants } from "../../../../constants";
import { EventBus } from "../../../utils/event-bus";

export class SpinButtonContainer extends Phaser.GameObjects.Container {
  private debugRect: Phaser.GameObjects.Rectangle;
  private title: Phaser.GameObjects.Text;
  private titleFontSize: number;
  private _enabled = true;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    super(scene, x, y);
    this.setSize(width, height);
    this.title = new Phaser.GameObjects.Text(
      scene,
      width / 2,
      height / 2,
      "SPIN",
      {
        fontFamily: "Arial Black",
        fontSize: this.titleFontSize,
        fontStyle: "600",
        color: "#ffffff",
      },
    ).setOrigin(0.5);

    this.debugRect = scene.add.rectangle(0, 0, width, height, 0xffc000, 0);
    this.debugRect.setOrigin(0, 0);
    this.debugRect.setStrokeStyle(2, 0xfffffff, 1);
    this.debugRect.setInteractive({ useHandCursor: true });
    this.debugRect.on("pointerdown", () => this.handlePointerdown());
    this.add([this.debugRect, this.title]);
  }
  onResize(width: number, height: number) {
    this.setSize(width, height);
    this.updateComputedValues();
    this.title.setFontSize(this.titleFontSize);
    this.title.setPosition(width / 2, height / 2);
    this.debugRect.setSize(width, height);
    this.debugRect.setPosition(0, 0);
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
    EventBus.emit(EventConstants.spinButtonClick);
  }
  updateText(text: string) {
    this.title.setText(text);
  }
}
