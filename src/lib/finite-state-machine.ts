export const SlotStates = {
  idle: "idle",
  outcomeEvaluation: "outcomeEvaluation",
  preSpin: "preSpin",
  spin: "spin",
  winAnimation: "winAnimation",
  confirmRound: "confirmRound",
} as const;

export type SlotStatesType = keyof typeof SlotStates;
type PossibleStates = Record<SlotStatesType, FiniteState>;

export class FiniteStateMachine {
  private state: SlotStatesType;
  private possibleStates: PossibleStates;

  constructor(initialState: SlotStatesType, possibleStates: PossibleStates) {
    this.state = initialState;
    this.possibleStates = possibleStates;

    for (const state of Object.values(this.possibleStates)) {
      state.stateMachine = this;
    }
    this.transition(this.state);
  }

  transition(newState: SlotStatesType, ...args: unknown[]) {
    if (
      this.possibleStates[this.state] &&
      typeof this.possibleStates[this.state].exit === "function"
    ) {
      this.possibleStates[this.state].exit(...args);
    }

    this.state = newState;
    this.possibleStates[this.state].enter(...args);
  }

  getCurrentState(): SlotStatesType {
    return this.state;
  }
}

export abstract class FiniteState {
  stateMachine: FiniteStateMachine;
  public abstract enter: (...args: unknown[]) => void;
  public exit: (...args: unknown[]) => void = () => {};
}
