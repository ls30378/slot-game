import { ComponentManager, FiniteState, GameActions } from "..";
import { EventConstants } from "../../constants";
import { EventBus } from "../../game/utils/event-bus";

export class WinAnimationState extends FiniteState {
  public enter: (...args: unknown[]) => void = () => {
    console.log("Entering Win Animation State");
    const componentManager = ComponentManager.instance();
    componentManager.updateSpinButtonText("SAVE");
    componentManager.startWinAnimation();
    EventBus.on(EventConstants.spinButtonClick, () => {
      const balance = GameActions.saveWin();
      componentManager.updateFooterBalance(balance);
      componentManager.updateTopRowMessage("Place your bet!");
      componentManager.stopWinAnimation();
      this.stateMachine.transition("idle");
    });
  };
  exit: () => void = () => {
    EventBus.off(EventConstants.spinButtonClick);
  };
}
