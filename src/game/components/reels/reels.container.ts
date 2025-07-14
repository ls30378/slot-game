export class ReelsContainer extends Phaser.GameObjects.Container {
  private debugRect: Phaser.GameObjects.Rectangle;
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
  }
  onResize(width: number, height: number) {
    this.setSize(width, height);
    this.debugRect.setSize(width, height);
    this.debugRect.setPosition(0, 0);
  }
}
