import { ComponentConstants, EventConstants } from "../constants";
import {
  type TopRowContainer,
  type ReelsContainer,
  type SpinButtonContainer,
  type FooterContainer,
} from "../game/components";
import { EventBus } from "../game/utils/event-bus";
import { type SpinResult } from "./game-actions";

type ManagedObject = Phaser.GameObjects.GameObject | Phaser.Scene;
export class ComponentManager {
  private static _instance: ComponentManager;
  private objects = new Map<string, ManagedObject>();
  private constructor() {
    console.log("ComponentManager initialized");
  }
  public static instance(): ComponentManager {
    if (!ComponentManager._instance)
      ComponentManager._instance = new ComponentManager();

    ComponentManager._instance.setupEvents();

    return ComponentManager._instance;
  }
  private setupEvents() {
    EventBus.on(EventConstants.setLineId, (lineId: number) =>
      this.showLineId(lineId),
    );
  }
  public addObject(key: string, obj: ManagedObject) {
    this.objects.set(key, obj);
  }

  public getObject(key: string): ManagedObject | undefined {
    return this.objects.get(key);
  }

  public removeObject(key: string): boolean {
    return this.objects.delete(key);
  }

  enableSpinButton() {
    const spinButton = this.getObject(ComponentConstants.SpinButton) as
      | SpinButtonContainer
      | undefined;
    if (!spinButton) {
      throw new Error("SpinButtonContainer not found");
    }
    spinButton.enabled = true;
  }
  disableSpinButton() {
    const spinButton = this.getObject(ComponentConstants.SpinButton) as
      | SpinButtonContainer
      | undefined;
    if (!spinButton) {
      throw new Error("SpinButtonContainer not found");
    }
    spinButton.enabled = false;
  }

  startSpin() {
    const reelsContainer = this.getObject(ComponentConstants.ReelsContainer) as
      | ReelsContainer
      | undefined;
    if (!reelsContainer) {
      throw new Error("ReelsContainer not found");
    }
    reelsContainer.startSpin();
  }
  setSpinResult(spinResult: SpinResult) {
    const reelsContainer = this.getObject(ComponentConstants.ReelsContainer) as
      | ReelsContainer
      | undefined;
    if (!reelsContainer) {
      throw new Error("ReelsContainer not found");
    }
    reelsContainer.handleSpinResult(spinResult);
  }
  updateTopRowMessage(msg: string) {
    const topRowContainer = this.getObject(
      ComponentConstants.TopRowContainer,
    ) as TopRowContainer | undefined;
    if (!topRowContainer) {
      throw new Error("TopRowContainer not found");
    }
    topRowContainer.updateTitle(msg);
  }
  updateFooterBalance(balance: number) {
    const footerContainer = this.getObject(
      ComponentConstants.FooterContainer,
    ) as FooterContainer | undefined;
    if (!footerContainer) {
      throw new Error("FooterContainer not found");
    }
    footerContainer.updateBalanceText(balance);
  }

  updateSpinButtonText(txt: "SPIN" | "STOP" | "SAVE") {
    const spinButton = this.getObject(ComponentConstants.SpinButton) as
      | SpinButtonContainer
      | undefined;
    if (!spinButton) {
      throw new Error("SpinButtonContainer not found");
    }
    spinButton.updateText(txt);
  }

  stopSpin() {
    const reelsContainer = this.getObject(ComponentConstants.ReelsContainer) as
      | ReelsContainer
      | undefined;
    if (!reelsContainer) {
      throw new Error("ReelsContainer not found");
    }
    reelsContainer.stopSpin();
  }
  startWinAnimation() {
    const reelsContainer = this.getObject(ComponentConstants.ReelsContainer) as
      | ReelsContainer
      | undefined;
    if (!reelsContainer) {
      throw new Error("ReelsContainer not found");
    }
    reelsContainer.startWinAnimations(0);
  }

  stopWinAnimation() {
    const reelsContainer = this.getObject(ComponentConstants.ReelsContainer) as
      | ReelsContainer
      | undefined;
    if (!reelsContainer) {
      throw new Error("ReelsContainer not found");
    }
    reelsContainer.stopWinAnimations();
  }

  changeStakeStatus(status: boolean) {
    const footerContainer = this.getObject(
      ComponentConstants.FooterContainer,
    ) as FooterContainer | undefined;
    if (!footerContainer) {
      throw new Error("FooterContainer not found");
    }
    footerContainer.changeStakeStatus(status);
  }

  changeStakeText(stake: number) {
    const footerContainer = this.getObject(
      ComponentConstants.FooterContainer,
    ) as FooterContainer | undefined;
    if (!footerContainer) {
      throw new Error("FooterContainer not found");
    }
    footerContainer.changeStakeText(stake);
  }
  showLineId(lineId: number) {
    const topRowContainer = this.getObject(
      ComponentConstants.TopRowContainer,
    ) as TopRowContainer | undefined;
    if (!topRowContainer) {
      throw new Error("TopRowContainer not found");
    }
    topRowContainer.showLineId(lineId);
  }
  hideLineId() {
    const topRowContainer = this.getObject(
      ComponentConstants.TopRowContainer,
    ) as TopRowContainer | undefined;
    if (!topRowContainer) {
      throw new Error("TopRowContainer not found");
    }
    topRowContainer.hideLineId();
  }
}
