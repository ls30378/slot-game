import { ComponentManager, FiniteState, GameActions } from "..";
import { EventConstants } from "../../constants";
import { EventBus } from "../../game/utils/event-bus";

export class IdleState extends FiniteState {
  public enter: (...args: unknown[]) => void = () => {
    console.log("Entering Idle State");

    const componentManager = ComponentManager.instance();
    componentManager.hideLineId();
    componentManager.changeStakeStatus(true);
    componentManager.enableSpinButton();
    componentManager.updateSpinButtonText("SPIN");
    EventBus.on(EventConstants.spinButtonClick, () =>
      this.stateMachine.transition("preSpin"),
    );
    EventBus.on(EventConstants.stakeButtonClick, () => {
      const stake = GameActions.changeStake();
      componentManager.changeStakeText(stake);
    });
  };
  public exit: () => void = () => {
    this.cleanUpEvents();
  };

  private cleanUpEvents() {
    EventBus.off(EventConstants.spinButtonClick);
    EventBus.off(EventConstants.stakeButtonClick);
  }
}
