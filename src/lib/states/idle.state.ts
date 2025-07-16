import { ComponentManager, FiniteState } from "..";
import { EventConstants } from "../../constants";
import { EventBus } from "../../game/utils/event-bus";

export class IdleState extends FiniteState {
  public enter: (...args: unknown[]) => void = () => {
    console.log("Entering Idle State");

    const componentManager = ComponentManager.instance();
    componentManager.enableSpinButton();
    EventBus.on(EventConstants.spinButtonClick, () =>
      this.stateMachine.transition("preSpin"),
    );
  };
  public exit: () => void = () => {
    this.cleanUpEvents();
  };

  private cleanUpEvents() {
    EventBus.off(EventConstants.spinButtonClick);
  }
}
