import { FiniteState } from "..";

export class ConfirmRoundState extends FiniteState {
  public enter: (...args: unknown[]) => void;
}
