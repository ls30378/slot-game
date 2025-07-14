import { Scene } from "phaser";
import { FooterContainer, MainContainer, TopRowContainer } from "../components";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;

  // childrens
  private topRowContainer: TopRowContainer;
  private mainContainer: MainContainer;
  private footerContainer: FooterContainer;

  // Computed values
  private topRowContainerHeight: number;
  private mainContainerHeight: number;
  private footerContainerHeight: number;

  constructor() {
    super("Game");
  }

  create() {
    this.camera = this.cameras.main;
    this.onResize();
    this.scale.on("resize", this.onResize, this);
  }
  private updateComputedValues() {
    this.topRowContainerHeight = this.scale.height * 0.1;
    this.mainContainerHeight = this.scale.height * 0.8;
    this.footerContainerHeight = this.scale.height * 0.1;
  }
  private onResize() {
    this.updateComputedValues();
    this.setupLayout();
  }
  private setupLayout() {
    this.setupTopRowContainer();
    this.setupMainContainer();
    this.setupFooterContainer();
  }
  private setupTopRowContainer() {
    if (!this.topRowContainer) {
      this.topRowContainer = new TopRowContainer(
        this,
        0,
        0,
        this.scale.width,
        this.topRowContainerHeight,
      );
      this.add.existing(this.topRowContainer);
    } else {
      this.topRowContainer.onResize(
        this.scale.width,
        this.topRowContainerHeight,
      );
    }
  }
  private setupMainContainer() {
    if (!this.mainContainer) {
      this.mainContainer = new MainContainer(
        this,
        0,
        this.topRowContainerHeight,
        this.scale.width,
        this.mainContainerHeight,
      );
      this.add.existing(this.mainContainer);
    } else {
      this.mainContainer.setPosition(0, this.topRowContainerHeight);
      this.mainContainer.onResize(this.scale.width, this.mainContainerHeight);
    }
  }

  private setupFooterContainer() {
    const footerYPosition =
      this.topRowContainerHeight + this.mainContainerHeight;
    if (!this.footerContainer) {
      this.footerContainer = new FooterContainer(
        this,
        0,
        footerYPosition,
        this.scale.width,
        this.footerContainerHeight,
      );
      this.add.existing(this.footerContainer);
    } else {
      this.footerContainer.setPosition(0, footerYPosition);
      this.footerContainer.onResize(
        this.scale.width,
        this.footerContainerHeight,
      );
    }
  }
}
