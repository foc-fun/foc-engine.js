# @foc-engine/react

React components and hooks for FOC Engine Starknet dApps.

## Installation

```bash
npm install @foc-engine/react
```

**Note**: This package requires React >= 16.8.0 as a peer dependency.

## Features

- **React Context Providers**: FOC Engine and Starknet wallet integration
- **React Hooks**: Image preloading and management
- **Re-exports**: All `@foc-engine/core` functionality included

## Usage

### FOC Engine Provider

```jsx
import { FocEngineProvider, useFocEngine } from '@foc-engine/react';

// Wrap your app
function App() {
  return (
    <FocEngineProvider defaultNetwork="sepolia">
      <YourComponents />
    </FocEngineProvider>
  );
}

// Use in components
function MyComponent() {
  const { buildGaslessTx, sendGaslessTx } = useFocEngine();
  
  const handleTransaction = async () => {
    const tx = await buildGaslessTx({ calls });
    await sendGaslessTx(tx);
  };
}
```

### Starknet Connector

```jsx
import { StarknetProvider, useStarknet } from '@foc-engine/react';

// Configure provider
function App() {
  return (
    <StarknetProvider 
      defaultNetwork="sepolia"
      balanceTokens={['ETH', 'STRK', 'USDC']}
    >
      <YourComponents />
    </StarknetProvider>
  );
}

// Use in components
function WalletInfo() {
  const { account, balance, connect, disconnect } = useStarknet();
  
  return (
    <div>
      {account ? (
        <>
          <p>Balance: {balance}</p>
          <button onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### Image Hooks

```jsx
import { useImagePreloader } from '@foc-engine/react';

function Gallery() {
  const { images, isLoading, progress } = useImagePreloader([
    { id: 'hero', source: '/images/hero.jpg' },
    { id: 'banner', source: '/images/banner.png' }
  ]);
  
  if (isLoading) return <div>Loading {progress}%</div>;
  
  return <img src={images.hero} alt="Hero" />;
}
```

## API Reference

### Context Providers
- `FocEngineProvider`: FOC Engine integration
- `StarknetProvider`: Enhanced Starknet wallet connection

### Hooks
- `useFocEngine`: Access FOC Engine functionality
- `useStarknet`: Access wallet and blockchain state
- `useImagePreloader`: Preload and manage images
- `useImages`: Image utilities

### Re-exported from @foc-engine/core
All core functionality is also available through this package.

## Requirements

- React >= 16.8.0
- React DOM >= 16.8.0 (optional)