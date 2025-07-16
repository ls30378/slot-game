import { ComponentManager, FiniteState, GameActions } from "..";

export class OutcommeEvaluationState extends FiniteState {
  public enter: (...args: unknown[]) => void = () => {
    console.log("Entering Outcome Evaluation State");
    const componentManager = ComponentManager.instance();
    const totalWin = GameActions.lastResults.totalWin;
    if (totalWin) {
      componentManager.updateTopRowMessage(`You won ${totalWin}`);
      return this.stateMachine.transition("winAnimation");
    }
    componentManager.updateTopRowMessage("Place your bet!");
    this.stateMachine.transition("idle");
  };
}
