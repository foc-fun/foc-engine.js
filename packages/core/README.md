# @foc-engine/core

Core FOC Engine functionality for Starknet dApps - no React dependencies required.

## Installation

```bash
npm install @foc-engine/core
```

## Features

- **FOC Engine & Paymaster**: Gasless transaction support
- **State Management**: Zustand-based stores for events, notifications, sound, and onchain actions
- **Observer Pattern**: Event-driven architecture
- **TypeScript Support**: Full type definitions included

## Usage

### Basic Usage (Non-React)

```javascript
import { FocEngine, Paymaster } from '@foc-engine/core';

// Initialize FOC Engine
const engine = new FocEngine('sepolia');
const paymaster = new Paymaster(engine);

// Build gasless transaction
const gaslessTx = await paymaster.buildGaslessTx(calls);
```

### State Management

```javascript
import { useEventManager, useInAppNotificationsStore } from '@foc-engine/core';

// Event management
const eventManager = useEventManager.getState();
eventManager.publish('user-action', { type: 'click' });

// Notifications
const notificationStore = useInAppNotificationsStore.getState();
notificationStore.sendInAppNotification(1, 'Transaction completed');
```

## API Reference

### Core Classes
- `FocEngine`: Main engine for FOC functionality
- `Paymaster`: Handles gasless transactions

### Stores
- `useEventManager`: Generic event management
- `useInAppNotificationsStore`: In-app notifications
- `useSoundStore`: Sound management
- `useOnchainActions`: Blockchain transaction management

### Observers
- `InAppNotificationsObserver`: Handle notification events
- `SoundObserver`: Handle sound events

## Requirements

- Node.js >= 14
- No React dependency required