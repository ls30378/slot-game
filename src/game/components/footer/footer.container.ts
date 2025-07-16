export class FooterContainer extends Phaser.GameObjects.Container {
  private debugRect: Phaser.GameObjects.Rectangle;
  private titleFontSize: number;
  private balanceText: Phaser.GameObjects.Text;
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
    this.debugRect = scene.add.rectangle(0, 0, width, height, 0xff69b4, 0);
    this.debugRect.setStrokeStyle(2, 0xfffffff, 1);
    this.debugRect.setOrigin(0, 0);
    this.balanceText = new Phaser.GameObjects.Text(
      scene,
      0,
      height / 2,
      "Balance: 1000",
      {
        fontFamily: "Arial Black",
        fontSize: this.titleFontSize,
        fontStyle: "600",
        color: "#ffffff",
      },
    ).setOrigin(0, 0.5);
    this.add([this.debugRect, this.balanceText]);
  }

  private updateComputedValues() {
    const computedFontSize = Math.floor(
      Math.min(this.width * 0.1, this.height * 0.7),
    );
    const baseFontSize = 39; // Base font size for maximum scaling
    this.titleFontSize = Math.min(baseFontSize, computedFontSize);
  }
  onResize(width: number, height: number) {
    this.updateComputedValues();
    this.setSize(width, height);
    this.balanceText.setFontSize(this.titleFontSize);
    this.balanceText.setPosition(0, height / 2);
    this.debugRect.setSize(width, height);
    this.debugRect.setPosition(0, 0);
  }
  updateBalanceText(balance: number) {
    this.balanceText.setText(`Balance: ${balance}`);
  }
}
