# FOC Engine JS

[![npm version](https://badge.fury.io/js/foc-engine.svg)](https://www.npmjs.com/package/foc-engine)

A comprehensive React library for building Starknet dApps with FOC Engine integration. Provides gasless transactions, state management, event handling, and UI utilities for modern Starknet applications.

## ✨ Features

- 🔥 **Gasless Transactions**: Execute Starknet transactions without gas fees
- ⚛️ **React Integration**: Context providers and hooks for seamless React development
- 🏪 **State Management**: Zustand-powered stores for notifications, sounds, and events
- 🎯 **Event System**: Observer pattern for decoupled component communication
- 🖼️ **Image Management**: Preloading and optimization utilities
- 🔊 **Audio System**: Sound management for rich user experiences
- 📱 **Multi-token Support**: Enhanced Starknet connector with multiple token balances
- 🌐 **Multi-network**: Support for mainnet, sepolia, and devnet
- 📖 **TypeScript**: Full type safety and IntelliSense support
- 📚 **Comprehensive Docs**: Detailed documentation and examples

## 📦 Installation

```bash
npm install foc-engine
```

### Peer Dependencies
```bash
npm install react react-dom starknet
```

## 🚀 Quick Start

### 1. Basic Setup

Wrap your application with the providers:

```jsx
import React from 'react';
import {
  FocEngineProvider,
  StarknetProvider,
  useStarknet,
  useFocEngine
} from 'foc-engine';

function App() {
  return (
    <StarknetProvider>
      <FocEngineProvider defaultNetwork="sepolia">
        <MyDApp />
      </FocEngineProvider>
    </StarknetProvider>
  );
}

function MyDApp() {
  const { connect, isConnected, accountInfo } = useStarknet();
  const { buildGaslessTx, sendGaslessTx } = useFocEngine();

  const handleConnect = async () => {
    await connect();
  };

  const executeGaslessTransaction = async () => {
    if (!isConnected) return;

    const calls = [{
      contractAddress: '0x123...',
      entrypoint: 'transfer', 
      calldata: ['0xrecipient...', '1000', '0']
    }];

    try {
      const txData = await buildGaslessTx({ calls });
      const signature = await signTypedData(txData);
      const txHash = await sendGaslessTx({ txData, signature });
      console.log('Transaction sent:', txHash);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected: {accountInfo?.address}</p>
          <p>Balance: {accountInfo?.balance} ETH</p>
          <button onClick={executeGaslessTransaction}>
            Send Gasless Transaction
          </button>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### 2. Advanced Multi-token Support

```jsx
import { StarknetProvider, useStarknet } from 'foc-engine';

const customTokens = [
  { address: "0x049d...", symbol: "ETH", name: "Ethereum", decimals: 18 },
  { address: "0x0471...", symbol: "STRK", name: "Starknet Token", decimals: 18 },
  { address: "0x053c...", symbol: "USDC", name: "USD Coin", decimals: 6 }
];

function App() {
  return (
    <StarknetProvider 
      supportedTokens={customTokens}
      balanceTokenAddress="0x0471..." // Use STRK as primary balance
    >
      <TokenBalancesList />
    </StarknetProvider>
  );
}

function TokenBalancesList() {
  const { getAllBalances, supportedTokens } = useStarknet();
  const [balances, setBalances] = useState({});

  useEffect(() => {
    getAllBalances().then(setBalances);
  }, [getAllBalances]);

  return (
    <div>
      {supportedTokens.map(token => (
        <div key={token.symbol}>
          {token.symbol}: {balances[token.symbol] || '0'}
        </div>
      ))}
    </div>
  );
}
```

### 3. Event Management with Observers

```jsx
import { useEventManager, InAppNotificationsObserver } from 'foc-engine';

function EventDrivenComponent() {
  const eventManager = useEventManager();

  useEffect(() => {
    // Register notification observer
    const notificationObserver = new InAppNotificationsObserver();
    const observerId = eventManager.registerObserver(notificationObserver);

    return () => {
      eventManager.unregisterObserver(observerId);
    };
  }, [eventManager]);

  const triggerEvent = () => {
    eventManager.notify('BasicClick', { message: 'Button clicked!' });
  };

  return (
    <button onClick={triggerEvent}>
      Trigger Event
    </button>
  );
}
```

### 4. Image Preloading

```jsx
import { useImagePreloader } from 'foc-engine';

function Gallery() {
  const imageUrls = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg'
  ];

  const { preloadedImages, isLoading, loadImages } = useImagePreloader();

  useEffect(() => {
    loadImages(imageUrls);
  }, [loadImages]);

  if (isLoading) return <div>Loading images...</div>;

  return (
    <div>
      {imageUrls.map((url, index) => (
        <img key={index} src={preloadedImages[url] || url} alt={`Image ${index}`} />
      ))}
    </div>
  );
}
```

## 📋 Core Components

### 🔗 Context Providers

#### StarknetProvider
Enhanced Starknet wallet connection with multi-token support.

```jsx
<StarknetProvider 
  defaultChainId="SN_SEPOLIA"
  balanceTokenAddress="0x049d..." // ETH address
  supportedTokens={customTokens}
>
  <App />
</StarknetProvider>
```

#### FocEngineProvider  
FOC Engine integration for gasless transactions.

```jsx
<FocEngineProvider 
  defaultNetwork="sepolia"
  customUrl="https://custom-api.example.com"
>
  <App />
</FocEngineProvider>
```

### 🎣 React Hooks

#### useStarknet()
Comprehensive Starknet wallet management.

```jsx
const {
  // Connection
  connect, disconnect, isConnected,
  
  // Account info
  accountInfo, address,
  
  // Balance management
  getBalance, getTokenBalance, getAllBalances,
  
  // Configuration
  balanceTokenAddress, supportedTokens,
  setBalanceTokenAddress, addSupportedToken
} = useStarknet();
```

#### useFocEngine()
Gasless transaction management.

```jsx
const {
  engine, paymaster, isConnected,
  buildGaslessTx, sendGaslessTx,
  setNetwork
} = useFocEngine();
```

#### useImagePreloader()
Image optimization and preloading.

```jsx
const {
  preloadedImages, isLoading, error,
  loadImages, clearImages
} = useImagePreloader();
```

### 🏪 State Management

#### useEventManager()
Generic event system with observer pattern.

```jsx
const eventManager = useEventManager();

// Register observer
const observerId = eventManager.registerObserver(myObserver);

// Trigger events  
eventManager.notify('MyEvent', data);

// Cleanup
eventManager.unregisterObserver(observerId);
```

#### useInAppNotificationsStore()
In-app notification system.

```jsx
const {
  notifications, showNotification, 
  dismissNotification, clearAllNotifications
} = useInAppNotificationsStore();

showNotification('Success!', 'success');
```

#### useSoundStore()  
Audio management for rich experiences.

```jsx
const {
  playSound, stopSound, setVolume,
  isPlaying, currentSound
} = useSoundStore();

playSound('success.mp3');
```

#### useOnchainActions()
Blockchain transaction management.

```jsx
const {
  executeAction, pendingActions, 
  actionHistory, retryAction
} = useOnchainActions();
```

## 🌐 Supported Networks

| Network | Chain ID | API Endpoint |
|---------|----------|--------------|
| **Mainnet** | `SN_MAINNET` | `https://api.foc.fun` |
| **Sepolia** | `SN_SEPOLIA` | `https://sepolia-api.foc.fun` |
| **Devnet** | `SN_DEVNET` | `http://localhost:8080` |

## 🔧 Advanced Usage

### Custom Event Types

```typescript
type MyEventTypes = 'UserLogin' | 'DataUpdated' | 'ErrorOccurred';

const eventManager = createEventManager<MyEventTypes>();

class MyObserver implements Observer<MyEventTypes> {
  async onNotify(eventName: MyEventTypes, data?: any) {
    switch (eventName) {
      case 'UserLogin':
        console.log('User logged in:', data);
        break;
      case 'DataUpdated':
        this.refreshUI(data);
        break;
      case 'ErrorOccurred':
        this.handleError(data);
        break;
    }
  }
}
```

### Custom Network Configuration

```jsx
function NetworkAwareDApp() {
  const getNetworkConfig = () => {
    switch (process.env.NODE_ENV) {
      case 'production': return 'mainnet';
      case 'staging': return 'sepolia'; 
      default: return 'devnet';
    }
  };

  return (
    <FocEngineProvider 
      defaultNetwork={getNetworkConfig()}
      customUrl={process.env.CUSTOM_FOC_ENGINE_URL}
    >
      <App />
    </FocEngineProvider>
  );
}
```

### Error Handling Best Practices

```jsx
function RobustComponent() {
  const { buildGaslessTx, sendGaslessTx } = useFocEngine();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const executeWithRetry = async (calls, maxRetries = 3) => {
    setIsLoading(true);
    setError(null);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const txData = await buildGaslessTx({ calls });
        const signature = await getSignature(txData);
        const txHash = await sendGaslessTx({ txData, signature });
        
        setIsLoading(false);
        return txHash;
      } catch (err) {
        console.warn(`Attempt ${attempt} failed:`, err);
        
        if (attempt === maxRetries) {
          setError(err.message);
          setIsLoading(false);
          throw err;
        }
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * Math.pow(2, attempt - 1))
        );
      }
    }
  };

  return (
    <div>
      {error && <div className="error">Error: {error}</div>}
      <button 
        onClick={() => executeWithRetry(myCalls)}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Execute Transaction'}
      </button>
    </div>
  );
}
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[FOC Engine & Paymaster](./docs/FocEngine-Paymaster.md)** - Gasless transactions guide
- **[Starknet Connector](./docs/StarknetConnector.md)** - Enhanced wallet connection
- **[Event Manager](./docs/EventManager.md)** - Event system and observer pattern
- **[Image Hooks](./docs/ImageHooks.md)** - Image preloading and management
- **[Sound Store](./docs/SoundStore.md)** - Audio management system
- **[In-App Notifications](./docs/InAppNotifications.md)** - Notification system
- **[Onchain Actions](./docs/OnchainActions.md)** - Transaction management

## 🏗️ Development

### Build

```bash
npm run build
```

### Project Structure

```
foc-engine-js/
├── src/
│   ├── context/          # React context providers
│   ├── hooks/           # React hooks
│   ├── stores/          # Zustand state stores
│   ├── observers/       # Observer pattern implementations
│   ├── examples/        # Usage examples
│   └── types/           # TypeScript definitions
├── docs/               # Documentation
└── dist/              # Compiled output
```

### TypeScript Support

The library is built with TypeScript and provides full type definitions:

```typescript
import type {
  FocEngineConfig,
  GaslessTxParams,
  TokenInfo,
  EventManager,
  Observer
} from 'foc-engine';
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC

---

## 🌟 Why FOC Engine JS?

- **🚀 Developer Experience**: Intuitive React-first API with comprehensive TypeScript support
- **⚡ Performance**: Optimized state management and efficient event handling
- **🔧 Flexibility**: Modular architecture - use only what you need
- **📖 Documentation**: Extensive guides and examples for every feature
- **🌍 Production Ready**: Battle-tested in production Starknet applications
- **🔄 Future Proof**: Built with modern React patterns and best practices

Built with ❤️ for the Starknet ecosystem.