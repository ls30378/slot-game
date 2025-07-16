import { FiniteState } from "..";

export class IdleState extends FiniteState {
  public enter: (...args: unknown[]) => void = () => {
    console.log("Entering Idle State");
  };
}
