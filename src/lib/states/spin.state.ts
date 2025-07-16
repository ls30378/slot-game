import { FiniteState } from "..";

export class SpinState extends FiniteState {
  public enter: (...args: unknown[]) => void;
}
