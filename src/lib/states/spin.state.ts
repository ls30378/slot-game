import { ComponentManager, FiniteState } from "..";
import { EventConstants } from "../../constants";
import { EventBus } from "../../game/utils/event-bus";

export class SpinState extends FiniteState {
  public enter: (...args: unknown[]) => void = () => {
    const componentManager = ComponentManager.instance();
    componentManager.enableSpinButton();
    componentManager.startSpin();
    EventBus.on(EventConstants.spinComplete, () =>
      this.stateMachine.transition("outcomeEvaluation"),
    );
  };
  public exit: () => void = () => {
    EventBus.off(EventConstants.spinComplete);
  };
}
