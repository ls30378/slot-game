import { ComponentManager, FiniteState, GameActions } from "..";

export class PreSpinState extends FiniteState {
  public enter: (...args: unknown[]) => void = async () => {
    console.log("Entering PreSpinState");
    const componentManager = ComponentManager.instance();
    componentManager.disableSpinButton();
    try {
      componentManager.updateTopRowMessage("Good Luck!");
      const results = await GameActions.spin();
      console.log(results);
      componentManager.setSpinResult(results);
      componentManager.updateFooterBalance(GameActions.balance);
      this.stateMachine.transition("spin");
    } catch (error) {
      componentManager.updateTopRowMessage("Insufficient funds to spin");
      this.stateMachine.transition("idle");
    }
  };
}
