# TODO - FOC Engine JS Package Migration

This document tracks the changes needed to complete the migration of features from the POW mobile app to the foc-engine-js package.

## ✅ Completed Tasks

- [x] Transfer zustand stores (useEventManager, useInAppNotificationsStore, useSoundStore, useOnchainActions)
- [x] Transfer observers (InAppNotificationsObserver, SoundObserver)  
- [x] Transfer hooks (useImagePreloader, useImages)
- [x] Transfer context providers (FocEngineConnector, StarknetConnector)
- [x] **Enhanced EventManager with configurable event types** - Users can now define custom event types!

## 🚀 New Features Added

### EventManager Enhancements
- **Generic Type Support**: EventManager now supports user-defined event types
- **Factory Functions**: `createCustomEventManager<TEventType>()` for type-safe event managers
- **Predefined Event Collections**: Common event types for web apps, games, transactions, etc.
- **Event Configuration System**: Support for event metadata and configuration objects
- **Full Backwards Compatibility**: Existing code continues to work unchanged
- **Complete TypeScript Support**: Type-safe event handling with IntelliSense

## 🔄 Required Dependencies

### Core Dependencies Added ✅
```json
{
  "zustand": "^4.5.7",
  "uuid": "^9.0.1"
}
```

### React Dependencies ✅
- @types/react: Added as dev dependency
- react: Added as peer dependency
- react-dom: Added as optional peer dependency

## 📝 TODO Items

### High Priority

#### 1. ✅ Package Dependencies - COMPLETED
Dependencies have been added and package builds successfully.

#### 2. ✅ Main Index Exports - COMPLETED  
All new modules are properly exported from src/index.ts including:
- Event types and factory functions
- Enhanced observers with generic types
- All original functionality

#### 3. Documentation and Examples
- [x] Created comprehensive EventManager.md documentation
- [x] Added usage examples in src/examples/eventManagerExamples.ts
- [ ] Create README for each module
- [ ] Add integration guides for different app types

### Medium Priority

#### 4. Create Example Configurations
Create example configuration files in `src/configs/`:
- [ ] `defaultNotifications.json` - Default notification configurations
- [ ] `defaultSounds.json` - Default sound effect configurations
- [ ] `eventTypePresets.ts` - Common event type collections

#### 5. Implement Audio Backend Interfaces
Create `src/backends/` directory with:
- [ ] `WebAudioBackend.ts` - Web Audio API implementation
- [ ] `ReactNativeAudioBackend.ts` - Expo Audio wrapper
- [ ] `AudioBackendInterface.ts` - Common interface definition

#### 6. Add Enhanced TypeScript Definitions
- [x] Generic type support for EventManager
- [x] Proper JSDoc comments for API documentation
- [x] All exports are properly typed
- [ ] Add validation schemas for configurations

### Low Priority

#### 7. Storage Backend Implementation  
- [ ] Create configurable storage backend for sound/notification settings
- [ ] Support both localStorage (web) and AsyncStorage (React Native)
- [ ] Add persistence layer for user preferences

#### 8. Testing Infrastructure
- [ ] Add unit tests for all stores and hooks
- [ ] Add integration tests for context providers
- [ ] Mock implementations for all backend dependencies

#### 9. Performance Optimizations
- [ ] Implement proper cleanup in useEffect hooks
- [ ] Add debouncing for frequent event notifications
- [ ] Optimize image preloading with configurable batch sizes

#### 10. Extended Features
- [ ] Add metrics and analytics hooks for usage tracking
- [ ] Implement caching layer for frequently accessed data
- [ ] Add validation for configuration objects

## 🔧 Integration Notes

### For React Apps
```tsx
import { 
  FocEngineProvider, 
  StarknetProvider, 
  createCustomEventManager 
} from 'foc-engine-js';

// Define your app's events
type MyAppEvents = "UserLogin" | "DataSync" | "PaymentComplete";
const useMyAppEvents = createCustomEventManager<MyAppEvents>();

// Wrap your app with providers
<StarknetProvider>
  <FocEngineProvider>
    <App />
  </FocEngineProvider>
</StarknetProvider>
```

### For Custom Event Types
```typescript
import { createCustomEventManager, CommonWebEvents } from 'foc-engine-js';

// Option 1: Use predefined common events
const useWebEvents = createCustomEventManager<CommonWebEvents>();

// Option 2: Define completely custom events
type MyEvents = "CustomEvent1" | "CustomEvent2";
const useMyEvents = createCustomEventManager<MyEvents>();
```

### For Audio Integration
```typescript
import { useSound } from 'foc-engine-js';

// Set up audio backend
const { setAudioBackend } = useSound();
setAudioBackend(new WebAudioBackend()); // or ReactNativeAudioBackend
```

## ⚠️ Breaking Changes from Original

1. **Configuration**: All configurations now must be provided at runtime instead of bundled JSON files
2. **Dependencies**: Platform-specific dependencies must be provided through backend interfaces
3. **Exports**: Module structure changed to support npm package distribution
4. **Context**: Provider setup is required for context-dependent features
5. **Event Types**: While backwards compatible, users are encouraged to migrate to typed event managers

## 📊 Migration Status

- **Stores**: ✅ Complete - All 4 stores migrated and enhanced
- **Observers**: ✅ Complete - Both observers migrated with generic type support
- **Hooks**: ✅ Complete - Image hooks made platform-independent
- **Context**: ✅ Complete - Providers integrated with FOC Engine architecture
- **EventManager**: ✅ Enhanced - Now supports user-defined event types with full type safety
- **Dependencies**: ✅ Complete - All required dependencies added
- **Documentation**: 🔄 In Progress - Core documentation complete, examples needed
- **Testing**: ⏳ Pending - No tests implemented yet

## 🎯 Next Steps

1. ✅ Add required dependencies to package.json
2. ✅ Update main index.ts with all exports
3. ✅ Enhance EventManager with configurable types
4. 🔄 Create comprehensive documentation and examples
5. ⏳ Create example configurations and backends
6. ⏳ Build and test the package thoroughly
7. ⏳ Publish to npm registry

## 🌟 Key Achievements

- **Type Safety**: Full TypeScript support with generic event types
- **Flexibility**: Users can define custom event types while maintaining backwards compatibility  
- **Developer Experience**: IntelliSense, autocomplete, and compile-time error checking
- **Architecture**: Clean, extensible design that supports any application pattern
- **Documentation**: Comprehensive guides and examples for quick adoption