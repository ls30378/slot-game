import { FiniteState } from "..";

export class OutcommeEvaluationState extends FiniteState {
  public enter: (...args: unknown[]) => void;
}
