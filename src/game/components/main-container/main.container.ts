import { ComponentConstants } from "../../../constants";
import { ComponentManager } from "../../../lib";
import { FeaturesContainer } from "../features/features.container";
import { ReelsContainer } from "../reels/reels.container";

export class MainContainer extends Phaser.GameObjects.Container {
  private debugRect: Phaser.GameObjects.Rectangle;
  private reelsContainer: ReelsContainer;
  private featuresContainer: FeaturesContainer;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    super(scene, x, y);
    this.setSize(width, height);
    this.debugRect = scene.add.rectangle(0, 0, width, height, 0xffff00, 0.4);
    this.debugRect.setOrigin(0, 0);
    this.add(this.debugRect);
    this.onResize(width, height);
  }
  onResize(width: number, height: number) {
    this.setSize(width, height);
    this.debugRect.setSize(width, height);
    this.debugRect.setPosition(0, 0);
    this.setupReelsContainer();
    this.setupFeaturesContainer();
  }

  private setupReelsContainer() {
    if (!this.reelsContainer) {
      this.reelsContainer = new ReelsContainer(
        this.scene,
        0,
        0,
        this.width * 0.8,
        this.height,
        this.y,
      );
      this.add(this.reelsContainer);
      ComponentManager.instance().addObject(
        ComponentConstants.ReelsContainer,
        this.reelsContainer,
      );
    } else {
      this.reelsContainer.onResize(this.width * 0.8, this.height, this.y);
    }
  }
  private setupFeaturesContainer() {
    if (!this.featuresContainer) {
      this.featuresContainer = new FeaturesContainer(
        this.scene,
        this.width * 0.8,
        0,
        this.width * 0.2,
        this.height,
      );
      this.add(this.featuresContainer);
    } else {
      this.featuresContainer.setPosition(this.width * 0.8, 0);
      this.featuresContainer.onResize(this.width * 0.2, this.height);
    }
  }
}
