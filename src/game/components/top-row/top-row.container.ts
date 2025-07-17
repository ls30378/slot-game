export class TopRowContainer extends Phaser.GameObjects.Container {
  private title: Phaser.GameObjects.Text;
  private titleFontSize: number;
  private debugRect: Phaser.GameObjects.Rectangle;
  private lineId: Phaser.GameObjects.Text;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    super(scene, x, y);
    this.setSize(width, height);
    this.updateComputedValues();
    this.title = new Phaser.GameObjects.Text(
      scene,
      width / 2,
      height / 2,
      "Book Of Ra",
      {
        fontFamily: "Arial Black",
        fontSize: this.titleFontSize,
        fontStyle: "600",
        color: "#ffffff",
      },
    ).setOrigin(0.5);
    this.lineId = new Phaser.GameObjects.Text(
      scene,
      width,
      height / 2,
      "Line: 1",
      {
        fontFamily: "Arial Black",
        fontSize: this.titleFontSize,
        fontStyle: "600",
        color: "#ffffff",
      },
    )
      .setOrigin(1, 0.5)
      .setVisible(false);

    this.debugRect = scene.add.rectangle(0, 0, width, height, 0xff69b4, 0);
    this.debugRect.setStrokeStyle(2, 0xfffffff, 1);
    this.debugRect.setOrigin(0, 0);
    this.add([this.title, this.debugRect, this.lineId]);
  }
  onResize(width: number, height: number) {
    this.setPosition(0, 0);
    this.setSize(width, height);
    this.updateComputedValues();
    this.title.setFontSize(this.titleFontSize);
    this.title.setPosition(width / 2, height / 2);
    this.lineId.setFontSize(this.titleFontSize);
    this.lineId.setPosition(width, height / 2);
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
  updateTitle(msg: string) {
    this.title.setText(msg);
  }
  showLineId(line: number) {
    this.lineId.setText(`Line: ${line}`);
    this.lineId.setVisible(true);
  }
  hideLineId() {
    this.lineId.setVisible(false);
  }
}
