# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Build the TypeScript project
npm run build

# Run tests (currently not implemented)
npm test  # Note: Tests are not yet configured - will exit with error

# Install dependencies
npm install
```

## Architecture Overview

This is a comprehensive React library for building Starknet dApps with FOC Engine integration. It provides gasless transactions, state management, UI components, and utilities for modern Starknet applications.

### Core Library Structure

The library exports multiple modules from `src/index.ts`:

1. **Core FOC Engine & Paymaster**
   - `FocEngine` - FOC Engine API client
   - `Paymaster` - Gasless transaction management

2. **React Context Providers** 
   - `FocEngineConnector` - FOC Engine integration for React apps
   - `StarknetConnector` - Enhanced Starknet wallet connection with multi-token support

3. **State Management Stores** (Zustand-based)
   - `useEventManager` - Generic event management with observer pattern
   - `useInAppNotificationsStore` - In-app notifications system
   - `useSoundStore` - Sound/audio management
   - `useOnchainActions` - Blockchain transaction management

4. **React Hooks**
   - `useImagePreloader` - Image preloading and management
   - `useImages` - Image utilities

5. **Observer Pattern Components**
   - `InAppNotificationsObserver` - Handle notification events
   - `SoundObserver` - Handle sound events

6. **Types**
   - Event type definitions and interfaces

### Key Components Details

#### FOC Engine & Paymaster (`src/engine.ts`, `src/paymaster.ts`)
- Core classes for gasless transaction functionality
- Supports mainnet, sepolia, and devnet networks
- API endpoints configured in `src/constants.ts`

#### React Context System (`src/context/`)
- **FocEngineConnector**: Provides gasless transaction context to React components
- **StarknetConnector**: Enhanced wallet connection with configurable balance tokens and multi-token support

#### State Management (`src/stores/`)
- All stores use Zustand for state management
- Generic event manager with observer pattern
- Specialized stores for notifications, sound, and onchain actions

#### React Hooks (`src/hooks/`)
- Image preloading and management utilities
- Reusable hooks for common dApp functionality

#### Observer Pattern (`src/observers/`)
- Event-driven architecture for handling notifications and sound events
- Implements observer pattern for decoupled component communication

### Dependencies

**Runtime Dependencies:**
- **starknet**: Core Starknet blockchain interactions
- **zustand**: State management library
- **uuid**: UUID generation for observer IDs

**Development Dependencies:**
- **typescript**: TypeScript compiler
- **@types/node**: Node.js type definitions
- **@types/react**: React type definitions  
- **@types/react-dom**: React DOM type definitions
- **@types/uuid**: UUID type definitions

**Peer Dependencies:**
- **react**: >=16.8.0 (required)
- **react-dom**: >=16.8.0 (optional)

### Project Structure

```
foc-engine-js/
├── src/
│   ├── index.ts                    # Main library exports
│   ├── engine.ts                   # FOC Engine API client
│   ├── paymaster.ts               # Gasless transaction handling
│   ├── constants.ts               # API URLs and configuration
│   ├── utils.ts                   # Utility functions
│   ├── configs/                   # Configuration files
│   ├── context/                   # React context providers
│   │   ├── FocEngineConnector.tsx
│   │   └── StarknetConnector.tsx
│   ├── stores/                    # Zustand state stores
│   │   ├── useEventManager.ts
│   │   ├── useInAppNotificationsStore.ts
│   │   ├── useSoundStore.ts
│   │   └── useOnchainActions.ts
│   ├── hooks/                     # React hooks
│   │   ├── useImagePreloader.ts
│   │   └── useImages.ts
│   ├── observers/                 # Observer pattern implementations
│   │   ├── InAppNotificationsObserver.ts
│   │   └── SoundObserver.ts
│   ├── types/                     # TypeScript type definitions
│   │   └── events.ts
│   └── examples/                  # Usage examples
│       ├── eventManagerExamples.ts
│       ├── imageHooksExamples.tsx
│       ├── onchainActionsExamples.ts
│       └── starknetConnectorExamples.tsx
├── docs/                          # Comprehensive documentation
│   ├── EventManager.md
│   ├── FocEngine-Paymaster.md
│   ├── ImageHooks-QuickReference.md
│   ├── ImageHooks.md
│   ├── InAppNotifications.md
│   ├── ObserverPattern.md
│   ├── OnchainActions.md
│   ├── SoundStore.md
│   └── StarknetConnector.md
├── dist/                          # Compiled output
└── tsconfig.json                  # TypeScript configuration
```

### Module System

- TypeScript configured to output ESNext modules
- React components use JSX/TSX
- Library exports both individual modules and React components
- Supports both ES6 imports and tree-shaking

### Usage Patterns

This library is designed for React applications building on Starknet:

1. **Context Provider Pattern**: Wrap your app with providers for global state
2. **Hook-based API**: Use hooks to access functionality in components
3. **Observer Pattern**: Event-driven architecture for decoupled components
4. **Gasless Transactions**: Seamless user experience without gas fees
5. **Multi-token Support**: Handle multiple tokens and balances

### TypeScript Configuration

- Strict mode enabled with comprehensive type checking
- React JSX support
- Outputs declaration files for library consumers
- Target: ESNext with Node module resolution
- Module resolution supports both Node and bundler patterns