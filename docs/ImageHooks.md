# Image Hooks & Preloading System

The foc-engine-js package provides a comprehensive image preloading system that works across both web and React Native platforms. The system includes intelligent preloading, progress tracking, error handling, and flexible image management.

## Overview

The image system consists of two main hooks:
- **`useImagePreloader`**: Core preloading functionality with progress tracking
- **`useImages`**: Higher-level hook for easy image access and management

## Quick Start

### Basic Usage
```typescript
import { useImages, ImageAsset } from 'foc-engine-js';

const imageAssets: ImageAsset[] = [
  { id: 'logo', source: '/images/logo.png' },
  { id: 'hero', source: '/images/hero.jpg' },
  { id: 'icon', source: '/images/icon.svg' },
];

function MyComponent() {
  const { getImage, isLoading, progress } = useImages({ assets: imageAssets });

  if (isLoading) {
    return <div>Loading images... {Math.round(progress * 100)}%</div>;
  }

  return (
    <div>
      <img src={getImage('logo')} alt="Logo" />
      <img src={getImage('hero')} alt="Hero" />
      <img src={getImage('icon')} alt="Icon" />
    </div>
  );
}
```

### With Fallback Images
```typescript
import fallbackImage from '/images/placeholder.png';

const { getImage } = useImages({ 
  assets: imageAssets,
  fallbackImage 
});

// If 'missing' image doesn't exist, fallbackImage is returned
<img src={getImage('missing') || fallbackImage} alt="Fallback" />
```

## Core Concepts

### ImageAsset Interface
```typescript
interface ImageAsset {
  id: string;           // Unique identifier for the image
  source: string | any; // URL string, import, or require() result
  preloaded?: boolean;  // Optional preload flag
}
```

### Platform Compatibility
The system automatically detects the platform and uses the appropriate loading mechanism:

- **Web**: Uses native `Image()` constructor for preloading
- **React Native**: Falls back to direct source usage
- **SSR**: Handles server-side rendering gracefully

## useImagePreloader Hook

The core hook for image preloading with full control and progress tracking.

### Basic Usage
```typescript
import { useImagePreloader, ImageAsset } from 'foc-engine-js';

const assets: ImageAsset[] = [
  { id: 'image1', source: '/path/to/image1.jpg' },
  { id: 'image2', source: '/path/to/image2.png' },
];

function ImagePreloader() {
  const {
    images,        // Record<string, any> - loaded images
    isLoading,     // boolean - loading state
    loadedCount,   // number - images loaded so far
    totalCount,    // number - total images to load
    progress,      // number - loading progress (0-1)
    errors,        // Record<string, any> - loading errors
    startLoading,  // () => void - manually start loading
  } = useImagePreloader(assets);

  return (
    <div>
      <p>Progress: {loadedCount}/{totalCount} ({Math.round(progress * 100)}%)</p>
      {isLoading ? (
        <p>Loading images...</p>
      ) : (
        <div>
          {Object.entries(images || {}).map(([id, src]) => (
            <img key={id} src={src} alt={id} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Configuration Options
```typescript
interface ImagePreloaderConfig {
  loadImmediately?: boolean;                    // Auto-start loading (default: true)
  onLoadComplete?: (id: string) => void;        // Called when each image loads
  onLoadError?: (id: string, error: any) => void; // Called when image fails to load
  onAllLoaded?: (images: Record<string, any>) => void; // Called when all images loaded
}

const preloader = useImagePreloader(assets, {
  loadImmediately: false, // Don't auto-start
  onLoadComplete: (id) => console.log(`Loaded: ${id}`),
  onLoadError: (id, error) => console.error(`Failed to load ${id}:`, error),
  onAllLoaded: (images) => console.log('All images loaded!', images),
});
```

### Manual Loading Control
```typescript
function ManualImageLoader() {
  const { startLoading, isLoading, progress } = useImagePreloader(assets, {
    loadImmediately: false, // Don't auto-start
  });

  return (
    <div>
      <button onClick={startLoading} disabled={isLoading}>
        {isLoading ? `Loading... ${Math.round(progress * 100)}%` : 'Start Loading'}
      </button>
    </div>
  );
}
```

## useImages Hook

Higher-level hook for easy image access and management.

### Basic Usage
```typescript
import { useImages } from 'foc-engine-js';

function ImageGallery() {
  const {
    getImage,      // (key: string) => any - get image by ID
    hasImage,      // (key: string) => boolean - check if image exists
    getAllImages,  // () => Record<string, any> - get all loaded images
    isLoading,     // boolean - loading state
    images,        // Record<string, any> - all loaded images
    progress,      // number - loading progress (0-1)
  } = useImages({ assets: imageAssets });

  return (
    <div>
      {isLoading ? (
        <p>Loading... {Math.round(progress * 100)}%</p>
      ) : (
        <div>
          <img src={getImage('logo')} alt="Logo" />
          {hasImage('optional') && (
            <img src={getImage('optional')} alt="Optional" />
          )}
          
          {/* Display all images */}
          {Object.entries(getAllImages()).map(([id, src]) => (
            <img key={id} src={src} alt={id} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Configuration
```typescript
interface ImageHookConfig {
  fallbackImage?: any;      // Default image when requested image not found
  assets?: ImageAsset[];    // Images to preload
}

const { getImage } = useImages({
  assets: myAssets,
  fallbackImage: '/images/placeholder.png'
});
```

## Advanced Usage Patterns

### Loading States & Progress
```typescript
function AdvancedImageLoader() {
  const {
    isLoading,
    progress,
    loadedCount,
    totalCount,
    errors,
    getImage,
  } = useImages({ assets: imageAssets });

  const hasErrors = Object.keys(errors).length > 0;
  const progressPercent = Math.round(progress * 100);

  if (isLoading) {
    return (
      <div className="image-loader">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p>Loading images... {loadedCount}/{totalCount} ({progressPercent}%)</p>
      </div>
    );
  }

  return (
    <div>
      {hasErrors && (
        <div className="error-notice">
          Some images failed to load: {Object.keys(errors).join(', ')}
        </div>
      )}
      
      <div className="image-grid">
        {imageAssets.map(asset => (
          <div key={asset.id}>
            <img 
              src={getImage(asset.id)} 
              alt={asset.id}
              onError={(e) => {
                e.currentTarget.src = '/images/error-placeholder.png';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Dynamic Image Loading
```typescript
function DynamicImageLoader() {
  const [dynamicAssets, setDynamicAssets] = useState<ImageAsset[]>([]);
  const { getImage, isLoading } = useImages({ assets: dynamicAssets });

  const addImage = (url: string, id: string) => {
    setDynamicAssets(prev => [
      ...prev,
      { id, source: url }
    ]);
  };

  const removeImage = (id: string) => {
    setDynamicAssets(prev => prev.filter(asset => asset.id !== id));
  };

  return (
    <div>
      <div>
        <input 
          type="text" 
          placeholder="Image URL"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const url = e.currentTarget.value;
              const id = `image-${Date.now()}`;
              addImage(url, id);
              e.currentTarget.value = '';
            }
          }}
        />
      </div>
      
      {isLoading && <p>Loading new images...</p>}
      
      <div className="dynamic-images">
        {dynamicAssets.map(asset => (
          <div key={asset.id}>
            <img src={getImage(asset.id)} alt={asset.id} />
            <button onClick={() => removeImage(asset.id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Lazy Loading with Intersection Observer
```typescript
function LazyImageGrid() {
  const [visibleImages, setVisibleImages] = useState<string[]>([]);
  const { getImage, hasImage } = useImages({ assets: allImageAssets });

  const imageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const imageId = entry.target.getAttribute('data-image-id');
          if (imageId && !visibleImages.includes(imageId)) {
            setVisibleImages(prev => [...prev, imageId]);
          }
        }
      });
    });

    Object.values(imageRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [visibleImages]);

  return (
    <div className="image-grid">
      {allImageAssets.map(asset => (
        <div
          key={asset.id}
          ref={el => imageRefs.current[asset.id] = el}
          data-image-id={asset.id}
          className="image-container"
        >
          {visibleImages.includes(asset.id) ? (
            <img 
              src={getImage(asset.id)} 
              alt={asset.id}
              loading="lazy"
            />
          ) : (
            <div className="image-placeholder">Loading...</div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Error Handling & Retry
```typescript
function RobustImageLoader() {
  const [retryAttempts, setRetryAttempts] = useState<{ [key: string]: number }>({});
  const maxRetries = 3;

  const {
    getImage,
    errors,
    isLoading,
  } = useImagePreloader(imageAssets, {
    onLoadError: (id, error) => {
      console.error(`Failed to load ${id}:`, error);
      
      const attempts = retryAttempts[id] || 0;
      if (attempts < maxRetries) {
        setTimeout(() => {
          setRetryAttempts(prev => ({
            ...prev,
            [id]: attempts + 1
          }));
          // Trigger retry logic here
        }, 1000 * Math.pow(2, attempts)); // Exponential backoff
      }
    }
  });

  const getImageWithFallback = (id: string) => {
    if (errors[id] && (retryAttempts[id] || 0) >= maxRetries) {
      return '/images/error-fallback.png';
    }
    return getImage(id) || '/images/loading-placeholder.png';
  };

  return (
    <div>
      {imageAssets.map(asset => (
        <div key={asset.id}>
          <img 
            src={getImageWithFallback(asset.id)} 
            alt={asset.id}
          />
          {errors[asset.id] && (
            <p className="error">
              Failed to load after {retryAttempts[asset.id] || 0} attempts
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Platform-Specific Considerations

### Web Applications
```typescript
// Standard web usage with URL strings
const webAssets: ImageAsset[] = [
  { id: 'logo', source: '/images/logo.png' },
  { id: 'hero', source: 'https://example.com/hero.jpg' },
];

// With webpack imports
import logoImage from '/images/logo.png';
const webpackAssets: ImageAsset[] = [
  { id: 'logo', source: logoImage },
];
```

### React Native
```typescript
// React Native with require()
const rnAssets: ImageAsset[] = [
  { id: 'logo', source: require('../images/logo.png') },
  { id: 'hero', source: { uri: 'https://example.com/hero.jpg' } },
];

// Or with import
import logoImage from '../images/logo.png';
const rnImportAssets: ImageAsset[] = [
  { id: 'logo', source: logoImage },
];
```

### Next.js with Static Imports
```typescript
import logo from '/public/images/logo.png';
import hero from '/public/images/hero.jpg';

const nextAssets: ImageAsset[] = [
  { id: 'logo', source: logo },
  { id: 'hero', source: hero },
];
```

## Performance Optimization

### Batch Loading
```typescript
// Good: Load images in batches
const { isLoading } = useImages({
  assets: currentBatchAssets, // Load current viewport images first
});

// Load next batch when current is complete
useEffect(() => {
  if (!isLoading && nextBatchAssets.length > 0) {
    // Load next batch
    setCurrentBatchAssets(prev => [...prev, ...nextBatchAssets]);
  }
}, [isLoading, nextBatchAssets]);
```

### Conditional Loading
```typescript
function ConditionalImageLoader({ shouldLoad }: { shouldLoad: boolean }) {
  const { getImage, isLoading } = useImagePreloader(assets, {
    loadImmediately: shouldLoad,
  });

  // Only load images when needed
  return shouldLoad ? (
    <div>
      {isLoading ? <LoadingSpinner /> : <ImageGallery getImage={getImage} />}
    </div>
  ) : null;
}
```

### Memory Management
```typescript
function ImageManager() {
  const [activeAssets, setActiveAssets] = useState<ImageAsset[]>([]);
  
  // Clean up unused images
  const cleanupImages = useCallback(() => {
    setActiveAssets(prev => prev.filter(asset => isImageInViewport(asset.id)));
  }, []);

  useEffect(() => {
    const interval = setInterval(cleanupImages, 30000); // Clean up every 30s
    return () => clearInterval(interval);
  }, [cleanupImages]);

  return <div>{/* Your component */}</div>;
}
```

## Best Practices

### 1. Image Organization
```typescript
// Organize images by category
const uiAssets: ImageAsset[] = [
  { id: 'logo', source: '/ui/logo.png' },
  { id: 'menu-icon', source: '/ui/menu.svg' },
];

const contentAssets: ImageAsset[] = [
  { id: 'hero-1', source: '/content/hero-1.jpg' },
  { id: 'hero-2', source: '/content/hero-2.jpg' },
];
```

### 2. Error Handling
```typescript
// Always provide fallbacks
const { getImage } = useImages({
  assets: myAssets,
  fallbackImage: '/images/placeholder.png'
});

// Handle missing images gracefully
const safeGetImage = (id: string) => {
  return getImage(id) || '/images/default.png';
};
```

### 3. Loading States
```typescript
// Provide meaningful loading feedback
function ImageWithState({ id }: { id: string }) {
  const { getImage, isLoading, hasImage } = useImages({ assets: myAssets });

  if (isLoading) {
    return <div className="image-skeleton">Loading...</div>;
  }

  if (!hasImage(id)) {
    return <div className="image-error">Image not found</div>;
  }

  return <img src={getImage(id)} alt={id} />;
}
```

### 4. TypeScript Usage
```typescript
// Use proper typing for better development experience
interface GameAssets {
  characters: ImageAsset[];
  backgrounds: ImageAsset[];
  items: ImageAsset[];
}

const gameAssets: GameAssets = {
  characters: [
    { id: 'player', source: '/game/player.png' },
    { id: 'enemy', source: '/game/enemy.png' },
  ],
  backgrounds: [
    { id: 'forest', source: '/game/forest.jpg' },
    { id: 'cave', source: '/game/cave.jpg' },
  ],
  items: [
    { id: 'sword', source: '/game/sword.png' },
    { id: 'potion', source: '/game/potion.png' },
  ],
};

// Flatten for preloader
const allGameAssets = [
  ...gameAssets.characters,
  ...gameAssets.backgrounds,
  ...gameAssets.items,
];
```

## Troubleshooting

### Common Issues

1. **Images not loading in React Native**
   ```typescript
   // Make sure to use require() for local images
   { id: 'local', source: require('./image.png') } // ✅ Correct
   { id: 'local', source: './image.png' }          // ❌ Won't work
   ```

2. **CORS errors with external images**
   ```typescript
   // Use proxy or ensure proper CORS headers
   { id: 'external', source: 'https://api.example.com/image.jpg' }
   ```

3. **SSR hydration issues**
   ```typescript
   // Handle client-side only loading
   const [mounted, setMounted] = useState(false);
   useEffect(() => setMounted(true), []);
   
   if (!mounted) return null;
   return <ImageComponent />;
   ```

This image system provides a robust, platform-agnostic solution for managing images in your applications with comprehensive preloading, error handling, and performance optimization features.