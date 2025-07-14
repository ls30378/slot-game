import { SpinButtonContainer } from "./spin-button/spin-button.container";

export class FeaturesContainer extends Phaser.GameObjects.Container {
  private debugRect: Phaser.GameObjects.Rectangle;
  private spinButtonContainer: SpinButtonContainer;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    super(scene, x, y);
    this.setSize(width, height);

    this.debugRect = scene.add.rectangle(0, 0, width, height, 0xffc0ff, 0.4);
    this.debugRect.setOrigin(0, 0);
    this.add(this.debugRect);
    this.onResize(width, height);
  }
  onResize(width: number, height: number) {
    this.setSize(width, height);
    this.debugRect.setSize(width, height);
    this.debugRect.setPosition(0, 0);
    this.setupSpinButtonContainer();
  }
  private setupSpinButtonContainer() {
    const height = this.height * 0.4;
    const yPosition = this.height / 2 - height / 2;
    if (!this.spinButtonContainer) {
      this.spinButtonContainer = new SpinButtonContainer(
        this.scene,
        0,
        yPosition,
        this.width,
        height,
      );
      this.add(this.spinButtonContainer);
    } else {
      this.spinButtonContainer.setPosition(0, yPosition);
      this.spinButtonContainer.onResize(this.width, height);
    }
  }
}
