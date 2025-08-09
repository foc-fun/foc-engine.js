# TODO - FOC Engine JS Package Migration

This document tracks the changes needed to complete the migration of features from the POW mobile app to the foc-engine-js package.

## ✅ Completed Tasks

- [x] Transfer zustand stores (useEventManager, useInAppNotificationsStore, useSoundStore, useOnchainActions)
- [x] Transfer observers (InAppNotificationsObserver, SoundObserver)  
- [x] Transfer hooks (useImagePreloader, useImages)
- [x] Transfer context providers (FocEngineConnector, StarknetConnector)

## 🔄 Required Dependencies

### Core Dependencies to Add
```json
{
  "zustand": "^4.4.1",
  "uuid": "^9.0.0"
}
```

### React Dependencies (already should be peer deps)
- react
- react-dom (if targeting web)

### Optional Dependencies (for full functionality)
- Audio backend implementation for sound management
- Storage backend for persistence

## 🚨 Critical Changes Made During Migration

### 1. Platform Independence
- **Original**: React Native specific (AsyncStorage, Expo Audio, etc.)
- **Modified**: Web-compatible with configurable backends
- **Action Required**: Implement platform-specific backends

### 2. Sound Store Changes
- Removed direct Expo Audio dependencies
- Added configurable audio backend support
- Added `setAudioBackend()` method for runtime configuration
- Maintained all original functionality through abstraction layer

### 3. Image Preloader Changes  
- Removed Shopify Skia dependency
- Added browser Image() API fallback
- Made compatible with both web and React Native
- Maintained lazy loading and progress tracking

### 4. Notification Store Changes
- Removed hard-coded JSON config file dependency
- Added `setNotificationConfigs()` for runtime configuration
- Made notification limit configurable
- Maintained all original notification logic

### 5. Context Providers
- Simplified to work with existing FOC Engine architecture
- Removed React Native specific wallet integrations
- Added proper error handling and connection management

## 📝 TODO Items

### High Priority

#### 1. Add Package Dependencies
```bash
npm install zustand uuid @types/uuid
```

#### 2. Update Main Index File
```typescript
// src/index.ts - Add exports for new modules
export * from './stores/useEventManager';
export * from './stores/useInAppNotificationsStore';
export * from './stores/useSoundStore';
export * from './stores/useOnchainActions';
export * from './observers/InAppNotificationsObserver';
export * from './observers/SoundObserver';
export * from './hooks/useImagePreloader';
export * from './hooks/useImages';
export * from './context/FocEngineConnector';
export * from './context/StarknetConnector';
```

#### 3. Create Example Configurations
Create example configuration files in `src/configs/`:
- `defaultNotifications.json` - Default notification configurations
- `defaultSounds.json` - Default sound effect configurations

#### 4. Implement Audio Backend Interfaces
Create `src/backends/` directory with:
- `WebAudioBackend.ts` - Web Audio API implementation
- `ReactNativeAudioBackend.ts` - Expo Audio wrapper
- `AudioBackendInterface.ts` - Common interface definition

### Medium Priority

#### 5. Add TypeScript Definitions
- Create comprehensive type definitions for all configurations
- Add proper JSDoc comments for API documentation
- Ensure all exports are properly typed

#### 6. Storage Backend Implementation  
- Create configurable storage backend for sound/notification settings
- Support both localStorage (web) and AsyncStorage (React Native)
- Add persistence layer for user preferences

#### 7. Testing Infrastructure
- Add unit tests for all stores and hooks
- Add integration tests for context providers
- Mock implementations for all backend dependencies

#### 8. Documentation
- Create README for each module
- Add usage examples and integration guides
- Document required configurations and backends

### Low Priority

#### 9. Performance Optimizations
- Implement proper cleanup in useEffect hooks
- Add debouncing for frequent event notifications
- Optimize image preloading with configurable batch sizes

#### 10. Extended Features
- Add metrics and analytics hooks for usage tracking
- Implement caching layer for frequently accessed data
- Add validation for configuration objects

## 🔧 Integration Notes

### For React Apps
```tsx
import { FocEngineProvider, StarknetProvider } from 'foc-engine-js';

// Wrap your app with providers
<StarknetProvider>
  <FocEngineProvider>
    <App />
  </FocEngineProvider>
</StarknetProvider>
```

### For Audio Integration
```typescript
import { useSound } from 'foc-engine-js';

// Set up audio backend
const { setAudioBackend } = useSound();
setAudioBackend(new WebAudioBackend()); // or ReactNativeAudioBackend
```

### For Notifications
```typescript
import { useInAppNotifications } from 'foc-engine-js';

// Configure notifications
const { setNotificationConfigs } = useInAppNotifications();
setNotificationConfigs(myNotificationConfigs);
```

## ⚠️ Breaking Changes from Original

1. **Configuration**: All configurations now must be provided at runtime instead of bundled JSON files
2. **Dependencies**: Platform-specific dependencies must be provided through backend interfaces
3. **Exports**: Module structure changed to support npm package distribution
4. **Context**: Provider setup is required for context-dependent features

## 📊 Migration Status

- **Stores**: ✅ Complete - All 4 stores migrated and enhanced
- **Observers**: ✅ Complete - Both observers migrated with better configurability  
- **Hooks**: ✅ Complete - Image hooks made platform-independent
- **Context**: ✅ Complete - Providers integrated with FOC Engine architecture
- **Dependencies**: ⏳ Pending - Need to add to package.json
- **Documentation**: ⏳ Pending - Usage examples and API docs needed
- **Testing**: ⏳ Pending - No tests implemented yet

## 🎯 Next Steps

1. Add required dependencies to package.json
2. Update main index.ts with all exports
3. Create example configurations and backends
4. Build and test the package
5. Create comprehensive documentation
6. Publish to npm registry