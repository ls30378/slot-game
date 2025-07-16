import { FiniteState } from "..";

export class WinAnimationState extends FiniteState {
  public enter: (...args: unknown[]) => void;
}
