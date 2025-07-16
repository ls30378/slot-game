import { FiniteState } from "..";

export class PreSpinState extends FiniteState {
  public enter: (...args: unknown[]) => void;
}
