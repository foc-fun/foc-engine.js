# Image Hooks - Quick Reference

## Installation & Import
```typescript
import { 
  useImagePreloader, 
  useImages, 
  ImageAsset,
  ImagePreloaderConfig,
  ImageHookConfig 
} from 'foc-engine-js';
```

## Basic Usage

### useImages (Recommended for most cases)
```typescript
const { getImage, isLoading, progress } = useImages({
  assets: [
    { id: 'logo', source: '/images/logo.png' },
    { id: 'hero', source: '/images/hero.jpg' },
  ],
  fallbackImage: '/images/placeholder.png'
});

// Usage in JSX
{isLoading ? (
  <div>Loading... {Math.round(progress * 100)}%</div>
) : (
  <img src={getImage('logo')} alt="Logo" />
)}
```

### useImagePreloader (For advanced control)
```typescript
const {
  images,
  isLoading,
  loadedCount,
  totalCount,
  progress,
  errors,
  startLoading
} = useImagePreloader(assets, {
  loadImmediately: true,
  onLoadComplete: (id) => console.log(`Loaded: ${id}`),
  onLoadError: (id, error) => console.error(`Failed: ${id}`, error),
  onAllLoaded: (images) => console.log('All loaded!', images)
});
```

## Quick Recipes

### Loading Screen
```typescript
function LoadingScreen({ assets }: { assets: ImageAsset[] }) {
  const { isLoading, progress, loadedCount, totalCount } = useImages({ assets });
  
  if (!isLoading) return null;
  
  return (
    <div className="loading-screen">
      <div className="progress-bar">
        <div style={{ width: `${progress * 100}%` }} />
      </div>
      <p>Loading {loadedCount}/{totalCount}...</p>
    </div>
  );
}
```

### Image Gallery
```typescript
function ImageGallery({ assets }: { assets: ImageAsset[] }) {
  const { getImage, hasImage, isLoading } = useImages({ assets });
  
  if (isLoading) return <div>Loading gallery...</div>;
  
  return (
    <div className="gallery">
      {assets.map(asset => (
        <div key={asset.id}>
          {hasImage(asset.id) ? (
            <img src={getImage(asset.id)} alt={asset.id} />
          ) : (
            <div>Failed to load</div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Manual Loading Control
```typescript
function ManualLoader({ assets }: { assets: ImageAsset[] }) {
  const { getImage, isLoading, startLoading } = useImagePreloader(assets, {
    loadImmediately: false
  });
  
  return (
    <div>
      <button onClick={startLoading} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Load Images'}
      </button>
      {/* Display images */}
    </div>
  );
}
```

### Error Handling
```typescript
function RobustImages({ assets }: { assets: ImageAsset[] }) {
  const { getImage, errors } = useImages({
    assets,
    fallbackImage: '/images/error.png'
  });
  
  return (
    <div>
      {assets.map(asset => (
        <div key={asset.id}>
          <img src={getImage(asset.id)} alt={asset.id} />
          {errors[asset.id] && (
            <p className="error">Failed to load {asset.id}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Common Patterns

### Asset Definition
```typescript
// Basic assets
const assets: ImageAsset[] = [
  { id: 'image1', source: '/path/image1.jpg' },
  { id: 'image2', source: 'https://example.com/image2.png' }
];

// With imports (webpack/vite)
import logo from '/images/logo.png';
const assetsWithImports: ImageAsset[] = [
  { id: 'logo', source: logo }
];

// React Native
const rnAssets: ImageAsset[] = [
  { id: 'local', source: require('./image.png') },
  { id: 'remote', source: { uri: 'https://example.com/image.jpg' } }
];
```

### Dynamic Loading
```typescript
function DynamicImageLoader() {
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const { getImage, isLoading } = useImages({ assets });
  
  const addImage = (url: string, id: string) => {
    setAssets(prev => [...prev, { id, source: url }]);
  };
  
  return (
    <div>
      <button onClick={() => addImage('/new-image.jpg', 'new')}>
        Add Image
      </button>
      {/* Display images */}
    </div>
  );
}
```

### Lazy Loading
```typescript
function LazyImage({ asset, inView }: { asset: ImageAsset; inView: boolean }) {
  const { getImage, isLoading } = useImages({
    assets: inView ? [asset] : []
  });
  
  if (!inView) return <div>Scroll to load...</div>;
  if (isLoading) return <div>Loading...</div>;
  
  return <img src={getImage(asset.id)} alt={asset.id} />;
}
```

## API Reference

### useImages Returns
```typescript
{
  getImage: (key: string) => any;           // Get image by ID
  hasImage: (key: string) => boolean;       // Check if image exists
  getAllImages: () => Record<string, any>;  // Get all loaded images
  isLoading: boolean;                       // Loading state
  images: Record<string, any>;              // All loaded images
  progress: number;                         // Loading progress (0-1)
  loadedCount: number;                      // Number of loaded images
  totalCount: number;                       // Total images to load
  errors: Record<string, any>;              // Loading errors
}
```

### useImagePreloader Returns
```typescript
{
  images: Record<string, any> | null;       // Loaded images
  isLoading: boolean;                       // Loading state
  loadedCount: number;                      // Images loaded
  totalCount: number;                       // Total images
  progress: number;                         // Progress (0-1)
  errors: Record<string, any>;              // Errors
  startLoading: () => void;                 // Manual start function
}
```

### Configuration Types
```typescript
interface ImageAsset {
  id: string;           // Unique identifier
  source: string | any; // Image source (URL, import, require)
  preloaded?: boolean;  // Optional preload flag
}

interface ImagePreloaderConfig {
  loadImmediately?: boolean;                    // Auto-start (default: true)
  onLoadComplete?: (id: string) => void;        // Load success callback
  onLoadError?: (id: string, error: any) => void; // Load error callback
  onAllLoaded?: (images: Record<string, any>) => void; // All loaded callback
}

interface ImageHookConfig {
  fallbackImage?: any;      // Default/fallback image
  assets?: ImageAsset[];    // Images to preload
}
```

## Platform Notes

### Web
- Uses `new Image()` for preloading
- Supports URL strings and webpack imports
- Works with all modern browsers

### React Native
- Falls back to direct source usage
- Supports `require()` and `{ uri: 'url' }`
- Compatible with Expo and bare React Native

### SSR/Next.js
- Handles server-side rendering gracefully
- Works with static imports and dynamic imports
- Compatible with Next.js Image optimization

## Performance Tips

1. **Batch Loading**: Load images in groups rather than all at once
2. **Lazy Loading**: Only load images when needed
3. **Proper Fallbacks**: Always provide fallback images
4. **Error Handling**: Handle network failures gracefully
5. **Memory Management**: Clean up unused images periodically

## Troubleshooting

### Common Issues
- **React Native**: Use `require()` for local images, not strings
- **CORS**: Ensure external images have proper headers
- **SSR**: Wrap image loading in `useEffect` for client-only
- **Memory**: Large images can cause memory issues - consider resizing

### Debug Tips
```typescript
// Enable detailed logging
const { errors } = useImagePreloader(assets, {
  onLoadComplete: (id) => console.log(`✅ ${id}`),
  onLoadError: (id, error) => console.error(`❌ ${id}:`, error),
  onAllLoaded: () => console.log('🎉 All loaded!')
});
```