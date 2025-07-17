# Slot Game - Book of Ra

A TypeScript slot game built with Phaser 3 and Vite, featuring a Book of Ra configuration with modern finite state machine architecture.

## Development

### Requirements

- [Node.js](https://nodejs.org) for package management
- Modern browser with ES2020+ support

### Available Commands

| Command         | Description                                        |
| --------------- | -------------------------------------------------- |
| `npm install`   | Install project dependencies                       |
| `npm run dev`   | Launch development server on http://localhost:8080 |
| `npm run build` | Create production build in `dist/` folder          |

### Project Structure

```
src/
├── game/
│   ├── scenes/          # Phaser scenes
│   ├── components/      # UI components
│   └── utils/           # Utilities and event bus
├── lib/
│   ├── states/          # Finite state machine states
│   ├── finite-state-machine.ts
│   ├── game-actions.ts  # Game logic
│   └── component-manager.ts
├── constants/           # Game constants and enums
└── main.ts             # Application entry point
```

## Features

- **Phaser 3.90.0** game engine with TypeScript support
- **Finite State Machine** architecture for clean game flow management
- **Responsive design** that adapts to different screen sizes
- **Event-driven architecture** for decoupled component communication
- **Component-based UI** with reusable containers

## Architecture Overview

This slot game leverages an architecture built around three core patterns:

### 1. Finite State Machine

The game uses a finite state machine to manage the slot game flow through distinct states:

#### Game States

- **`idle`** - Initial state where players can place bets and spin
- **`preSpin`** - Validates bet, deducts balance, and prepares spin results (used timeout to simulate network latency)
- **`spin`** - Handles reel spinning animations and user interactions
- **`outcomeEvaluation`** - Evaluates spin results and determines next state
- **`winAnimation`** - Plays winning line animations and handles win presentation
- **`confirmRound`** - Finalizes the round (currently placeholder)

Each state manages its own entry/exit logic and event listeners, ensuring clean transitions and proper cleanup.

### State-Based Interactions

The finite state machine strictly controls which user interactions are allowed in each state:

#### `idle` State

**Allowed Interactions:**

- ✅ **Spin Button Click** - Initiates a new spin
- ✅ **Stake Change** - Modify bet amount using footer controls
- ✅ **Balance Updates** - View current balance

**UI State:**

- Spin button shows "SPIN" text and is enabled
- Stake controls are interactive and enabled
- All UI elements are responsive to user input

#### `preSpin` State

**Allowed Interactions:**

- ❌ **No user interactions** - Brief transition state

**UI State:**

- Spin button temporarily disabled
- Stake controls disabled
- System validates bet and deducts balance

#### `spin` State

**Allowed Interactions:**

- ✅ **Early Stop** - Click spin button to stop reels early
- ❌ **Stake Change** - Disabled during spin
- ❌ **Balance Modification** - Protected during spin

**UI State:**

- Spin button shows "STOP" text and remains enabled
- Stake controls are disabled and grayed out
- Reels are actively spinning with animations

#### `outcomeEvaluation` State

**Allowed Interactions:**

- ❌ **No user interactions** - System processing

**UI State:**

- All controls temporarily disabled
- System evaluates results and determines next state
- Brief transition state for result processing

#### `winAnimation` State

**Allowed Interactions:**

- ✅ **Skip Animation** - Click spin button to skip win animations
- ❌ **Stake Change** - Disabled during win presentation
- ❌ **New Spin** - Must complete current round first

**UI State:**

- Spin button shows "SAVE" text and is enabled
- Stake controls remain disabled
- Winning lines and symbols are highlighted
- Win amount is displayed and animated

#### `confirmRound` State

**Allowed Interactions:**

- ✅ **Confirm Win** - Finalizes the round and returns to idle
- ❌ **Stake Change** - Disabled until round completion

**UI State:**

- Spin button enabled for round confirmation
- Stake controls remain disabled
- Win amount is added to balance

### 2. Component Manager (Singleton)

The `ComponentManager` acts as a centralized singleton for managing all Phaser components:

```typescript
// Direct component interaction
ComponentManager.instance().enableSpinButton();
ComponentManager.instance().updateTopRowMessage("Good Luck!");

// Event-driven updates
EventBus.emit(EventConstants.setLineId, lineId);
```

**Key responsibilities:**

- Manages references to all game components
- Provides a unified API for component interactions
- Listens to game events and updates components accordingly
- Ensures type-safe component access with error handling

### 3. Game Actions (Static Class)

The `GameActions` class handles all game logic and calculations:

```typescript
// Static methods for game operations
const results = await GameActions.spin();
const balance = GameActions.saveWin();
const newStake = GameActions.changeStake();
```

**Key features:**

- Static methods for game logic (spin, win calculation, balance management)
- Paytable management for different symbols
- Line-based winning calculation
- Precise mathematical operations for monetary calculations
- Reel strip generation and management

## Main Game Components

### Game Scene (`Game.ts`)

The main Phaser scene that orchestrates the entire game:

```typescript
export class Game extends Scene {
  private topRowContainer: TopRowContainer;
  private mainContainer: MainContainer;
  private footerContainer: FooterContainer;
}
```

**Layout structure:**

- **Top Row (10% height)** - Game title and line information
- **Main Container (80% height)** - Reels and game features
- **Footer (10% height)** - Balance and stake controls

### Component Hierarchy

#### 1. TopRowContainer

- Displays game title "Book of Ra"
- Shows current winning line information
- Responsive text scaling
- Toggle visibility for line display

#### 2. MainContainer

Split into two sections:

- **ReelsContainer (80% width)** - The main game area
- **FeaturesContainer (20% width)** - Game controls

##### ReelsContainer

- Manages 5 spinning reels with 3 visible symbols each
- Handles spin animations with staggered timing
- Implements masking for proper symbol visibility
- Manages win animations and line highlighting
- Supports early stop functionality

##### FeaturesContainer

- Contains the main spin button
- Handles button state changes (SPIN/STOP/SAVE)
- Responsive sizing and positioning

#### 3. FooterContainer

- Displays current balance
- Interactive stake selection
- Enables/disables during game states
- Updates balance after wins

### Symbol Management

Each symbol is managed by `SymbolContainer`:

- Displays symbol text from the Book of Ra theme
- Handles win animations with highlighting
- Responsive scaling based on container size
- State management for animation control

## Interactive Controls Summary

| Control          | idle    | preSpin | spin    | outcomeEvaluation | winAnimation | confirmRound |
| ---------------- | ------- | ------- | ------- | ----------------- | ------------ | ------------ |
| **Spin Button**  | ✅ SPIN | ❌      | ✅ STOP | ❌                | ✅ SAVE      | ✅ CONFIRM   |
| **Stake Change** | ✅      | ❌      | ❌      | ❌                | ❌           | ❌           |
| **Balance View** | ✅      | ✅      | ✅      | ✅                | ✅           | ✅           |

## Event System

The game uses Phaser's EventEmitter for decoupled communication:

```typescript
// Event constants for type safety
export const EventConstants = {
  spinButtonClick: "spinButton:click",
  spinComplete: "spin:complete",
  setLineId: "setLineId",
  // ... more events
};
```

**Event flow:**

1. User interactions emit events
2. State machines listen and react to events
3. Component Manager updates UI based on events
4. Game Actions handle business logic

## Game Flow

1. **Initialization**: Game starts in `idle` state
2. **Bet Placement**: User can change stake and spin
3. **Pre-Spin**: Validates bet, deducts balance, generates results
4. **Spinning**: Reels spin with staggered animation timing
5. **Outcome Evaluation**: Determines if there are wins
6. **Win Animation**: Shows winning lines and symbols (if applicable)
7. **Return to Idle**: Ready for next spin

## Technical Features

- **Responsive Design**: Adapts to different screen sizes
- **Type Safety**: Full TypeScript support with strict configuration
- **Modular Architecture**: Clean separation of concerns
- **Event-Driven**: Decoupled component communication
- **State Management**: Predictable game flow with finite state machines
