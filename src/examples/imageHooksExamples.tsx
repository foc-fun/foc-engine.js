// Examples demonstrating the image hooks and preloading system

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useImagePreloader, ImageAsset } from '../hooks/useImagePreloader';
import { useImages } from '../hooks/useImages';

// Example 1: Basic image preloading with progress
export function BasicImagePreloader() {
  const gameAssets: ImageAsset[] = [
    { id: 'player', source: '/game/sprites/player.png' },
    { id: 'enemy1', source: '/game/sprites/enemy1.png' },
    { id: 'enemy2', source: '/game/sprites/enemy2.png' },
    { id: 'background', source: '/game/backgrounds/forest.jpg' },
    { id: 'ui-health', source: '/game/ui/health-bar.png' },
    { id: 'ui-menu', source: '/game/ui/menu-button.svg' },
  ];

  const {
    images,
    isLoading,
    loadedCount,
    totalCount,
    progress,
    errors,
  } = useImagePreloader(gameAssets, {
    onLoadComplete: (id) => console.log(`✅ Loaded: ${id}`),
    onLoadError: (id, error) => console.error(`❌ Failed: ${id}`, error),
    onAllLoaded: () => console.log('🎉 All game assets loaded!'),
  });

  const progressPercent = Math.round(progress * 100);
  const hasErrors = Object.keys(errors).length > 0;

  if (isLoading) {
    return (
      <div className="loading-screen">
        <h2>Loading Game Assets...</h2>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p>{loadedCount}/{totalCount} ({progressPercent}%)</p>
        </div>
        
        {hasErrors && (
          <div className="error-notice">
            <p>Some assets failed to load:</p>
            <ul>
              {Object.keys(errors).map(id => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="game-ready">
      <h2>Game Ready! 🎮</h2>
      <div className="asset-preview">
        {Object.entries(images || {}).map(([id, src]) => (
          <div key={id} className="asset-item">
            <img src={src} alt={id} style={{ maxWidth: 100, maxHeight: 100 }} />
            <p>{id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 2: High-level useImages hook
export function SimpleImageGallery() {
  const galleryAssets: ImageAsset[] = [
    { id: 'photo1', source: 'https://picsum.photos/400/300?random=1' },
    { id: 'photo2', source: 'https://picsum.photos/400/300?random=2' },
    { id: 'photo3', source: 'https://picsum.photos/400/300?random=3' },
    { id: 'photo4', source: 'https://picsum.photos/400/300?random=4' },
  ];

  const {
    getImage,
    hasImage,
    getAllImages,
    isLoading,
    progress,
  } = useImages({
    assets: galleryAssets,
    fallbackImage: '/images/placeholder.png'
  });

  return (
    <div className="gallery">
      <h2>Photo Gallery</h2>
      
      {isLoading ? (
        <div className="loading-gallery">
          <p>Loading photos... {Math.round(progress * 100)}%</p>
          <div className="skeleton-grid">
            {galleryAssets.map(asset => (
              <div key={asset.id} className="skeleton-item" />
            ))}
          </div>
        </div>
      ) : (
        <div className="photo-grid">
          {galleryAssets.map(asset => (
            <div key={asset.id} className="photo-item">
              <img 
                src={getImage(asset.id)} 
                alt={`Photo ${asset.id}`}
                style={{ width: '100%', height: 200, objectFit: 'cover' }}
              />
              <div className="photo-status">
                {hasImage(asset.id) ? '✅ Loaded' : '❌ Failed'}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="gallery-info">
        <p>Total images: {Object.keys(getAllImages()).length}</p>
      </div>
    </div>
  );
}

// Example 3: Manual loading control
export function ManualImageLoader() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const imageCategories = {
    nature: [
      { id: 'mountain', source: 'https://picsum.photos/300/200?nature=mountain' },
      { id: 'forest', source: 'https://picsum.photos/300/200?nature=forest' },
      { id: 'ocean', source: 'https://picsum.photos/300/200?nature=ocean' },
    ],
    city: [
      { id: 'skyline', source: 'https://picsum.photos/300/200?city=skyline' },
      { id: 'street', source: 'https://picsum.photos/300/200?city=street' },
      { id: 'building', source: 'https://picsum.photos/300/200?city=building' },
    ],
    abstract: [
      { id: 'pattern1', source: 'https://picsum.photos/300/200?abstract=1' },
      { id: 'pattern2', source: 'https://picsum.photos/300/200?abstract=2' },
      { id: 'pattern3', source: 'https://picsum.photos/300/200?abstract=3' },
    ],
  };

  const currentAssets = selectedCategory 
    ? imageCategories[selectedCategory as keyof typeof imageCategories] 
    : [];

  const {
    images,
    isLoading,
    progress,
    startLoading,
  } = useImagePreloader(currentAssets, {
    loadImmediately: false,
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="manual-loader">
      <h2>Manual Image Loader</h2>
      
      <div className="category-selector">
        <p>Choose a category:</p>
        {Object.keys(imageCategories).map(category => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={selectedCategory === category ? 'active' : ''}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="loading-controls">
          <button 
            onClick={startLoading} 
            disabled={isLoading}
            className="load-button"
          >
            {isLoading ? `Loading... ${Math.round(progress * 100)}%` : 'Load Images'}
          </button>
        </div>
      )}

      {selectedCategory && (
        <div className="image-results">
          <div className="images-grid">
            {currentAssets.map(asset => (
              <div key={asset.id} className="image-item">
                {isLoading ? (
                  <div className="loading-placeholder">Loading...</div>
                ) : images?.[asset.id] ? (
                  <img src={images[asset.id]} alt={asset.id} />
                ) : (
                  <div className="error-placeholder">Failed to load</div>
                )}
                <p>{asset.id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Example 4: Dynamic image management
export function DynamicImageManager() {
  const [imageList, setImageList] = useState<ImageAsset[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageId, setNewImageId] = useState('');

  const {
    getImage,
    hasImage,
    isLoading,
    getAllImages,
  } = useImages({ assets: imageList });

  const addImage = () => {
    if (newImageUrl && newImageId) {
      const newAsset: ImageAsset = {
        id: newImageId,
        source: newImageUrl,
      };
      
      setImageList(prev => [...prev, newAsset]);
      setNewImageUrl('');
      setNewImageId('');
    }
  };

  const removeImage = (id: string) => {
    setImageList(prev => prev.filter(asset => asset.id !== id));
  };

  const addRandomImage = () => {
    const id = `random-${Date.now()}`;
    const randomId = Math.floor(Math.random() * 1000);
    addImageToList({
      id,
      source: `https://picsum.photos/250/200?random=${randomId}`
    });
  };

  const addImageToList = (asset: ImageAsset) => {
    setImageList(prev => [...prev, asset]);
  };

  return (
    <div className="dynamic-manager">
      <h2>Dynamic Image Manager</h2>
      
      <div className="add-image-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Image ID"
            value={newImageId}
            onChange={(e) => setNewImageId(e.target.value)}
          />
          <input
            type="url"
            placeholder="Image URL"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
          />
          <button onClick={addImage} disabled={!newImageUrl || !newImageId}>
            Add Image
          </button>
        </div>
        
        <button onClick={addRandomImage} className="random-button">
          Add Random Image
        </button>
      </div>

      <div className="status-bar">
        <p>
          Images: {imageList.length} | 
          Loaded: {Object.keys(getAllImages()).length} |
          {isLoading && ' Loading...'}
        </p>
      </div>

      <div className="image-collection">
        {imageList.map(asset => (
          <div key={asset.id} className="dynamic-image-item">
            <div className="image-container">
              {hasImage(asset.id) ? (
                <img 
                  src={getImage(asset.id)} 
                  alt={asset.id}
                  style={{ width: 150, height: 100, objectFit: 'cover' }}
                />
              ) : isLoading ? (
                <div className="loading-box">Loading...</div>
              ) : (
                <div className="error-box">Failed</div>
              )}
            </div>
            
            <div className="image-controls">
              <p className="image-id">{asset.id}</p>
              <button 
                onClick={() => removeImage(asset.id)}
                className="remove-button"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {imageList.length === 0 && (
        <div className="empty-state">
          <p>No images added yet. Try adding some!</p>
        </div>
      )}
    </div>
  );
}

// Example 5: Lazy loading with intersection observer
export function LazyImageGrid() {
  const [visibleImages, setVisibleImages] = useState<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Generate a large list of images for demonstration
  const allImages: ImageAsset[] = Array.from({ length: 50 }, (_, i) => ({
    id: `image-${i}`,
    source: `https://picsum.photos/300/200?random=${i}`
  }));

  const {
    getImage,
    hasImage,
  } = useImages({ 
    assets: allImages.filter(asset => visibleImages.includes(asset.id))
  });

  const setImageRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    imageRefs.current[id] = el;
    
    if (el && observerRef.current) {
      observerRef.current.observe(el);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const imageId = entry.target.getAttribute('data-image-id');
            if (imageId && !visibleImages.includes(imageId)) {
              setVisibleImages(prev => [...prev, imageId]);
            }
          }
        });
      },
      {
        rootMargin: '50px' // Start loading 50px before entering viewport
      }
    );
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleImages]);

  return (
    <div className="lazy-grid">
      <h2>Lazy Loading Image Grid</h2>
      <p>Scroll to see images load as they enter the viewport</p>
      
      <div className="grid-container">
        {allImages.map(asset => (
          <div
            key={asset.id}
            ref={setImageRef(asset.id)}
            data-image-id={asset.id}
            className="grid-item"
          >
            {visibleImages.includes(asset.id) ? (
              hasImage(asset.id) ? (
                <img 
                  src={getImage(asset.id)} 
                  alt={asset.id}
                  className="lazy-image"
                />
              ) : (
                <div className="loading-placeholder">
                  <div className="spinner"></div>
                  Loading...
                </div>
              )
            ) : (
              <div className="not-loaded-placeholder">
                Scroll to load
              </div>
            )}
            <div className="image-label">{asset.id}</div>
          </div>
        ))}
      </div>
      
      <div className="lazy-stats">
        <p>Visible: {visibleImages.length} / {allImages.length}</p>
      </div>
    </div>
  );
}

// Example 6: Error handling and retry logic
export function RobustImageLoader() {
  const [retryAttempts, setRetryAttempts] = useState<{ [key: string]: number }>({});
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const maxRetries = 3;

  // Mix of working and broken URLs for demonstration
  const testAssets: ImageAsset[] = [
    { id: 'working1', source: 'https://picsum.photos/200/150?random=1' },
    { id: 'broken1', source: 'https://nonexistent.example.com/image1.jpg' },
    { id: 'working2', source: 'https://picsum.photos/200/150?random=2' },
    { id: 'broken2', source: 'https://broken-url-example.com/missing.png' },
    { id: 'working3', source: 'https://picsum.photos/200/150?random=3' },
  ];

  const {
    images,
    isLoading,
    errors,
    progress,
  } = useImagePreloader(testAssets, {
    onLoadComplete: (id) => {
      console.log(`✅ Successfully loaded: ${id}`);
    },
    onLoadError: (id, error) => {
      console.error(`❌ Failed to load ${id}:`, error);
      
      const currentAttempts = retryAttempts[id] || 0;
      
      if (currentAttempts < maxRetries) {
        // Schedule retry with exponential backoff
        const delay = 1000 * Math.pow(2, currentAttempts); // 1s, 2s, 4s
        
        setTimeout(() => {
          setRetryAttempts(prev => ({
            ...prev,
            [id]: currentAttempts + 1
          }));
          
          console.log(`🔄 Retrying ${id} (attempt ${currentAttempts + 1}/${maxRetries})`);
          
          // In a real app, you'd trigger a retry here
          // For demo purposes, we'll just update the state
          
        }, delay);
      } else {
        console.log(`❌ Giving up on ${id} after ${maxRetries} attempts`);
        setFailedImages(prev => [...prev, id]);
      }
    }
  });

  const getImageWithFallback = (id: string) => {
    if (failedImages.includes(id)) {
      return '/images/error-fallback.png'; // Your error image
    }
    
    if (errors[id] && (retryAttempts[id] || 0) < maxRetries) {
      return '/images/retrying-placeholder.png'; // Your retry image
    }
    
    return images?.[id] || '/images/loading-placeholder.png';
  };

  const retryFailedImages = () => {
    setRetryAttempts({});
    setFailedImages([]);
    // In a real implementation, you'd trigger a reload of the failed images
  };

  const hasErrors = Object.keys(errors).length > 0;
  const totalRetries = Object.values(retryAttempts).reduce((sum, attempts) => sum + attempts, 0);

  return (
    <div className="robust-loader">
      <h2>Robust Image Loader with Retry Logic</h2>
      
      <div className="loader-status">
        <div className="status-item">
          <strong>Status:</strong> {isLoading ? 'Loading...' : 'Complete'}
        </div>
        <div className="status-item">
          <strong>Progress:</strong> {Math.round(progress * 100)}%
        </div>
        <div className="status-item">
          <strong>Errors:</strong> {Object.keys(errors).length}
        </div>
        <div className="status-item">
          <strong>Failed Permanently:</strong> {failedImages.length}
        </div>
        <div className="status-item">
          <strong>Total Retries:</strong> {totalRetries}
        </div>
      </div>

      {hasErrors && (
        <div className="error-section">
          <h3>Error Details:</h3>
          {Object.entries(errors).map(([id, error]) => (
            <div key={id} className="error-item">
              <strong>{id}:</strong> 
              <span>Attempts: {retryAttempts[id] || 0}/{maxRetries}</span>
              {failedImages.includes(id) && (
                <span className="permanently-failed">Permanently Failed</span>
              )}
            </div>
          ))}
          
          <button onClick={retryFailedImages} className="retry-button">
            Reset and Retry All
          </button>
        </div>
      )}

      <div className="image-results">
        {testAssets.map(asset => (
          <div key={asset.id} className="robust-image-item">
            <div className="image-container">
              <img 
                src={getImageWithFallback(asset.id)} 
                alt={asset.id}
                style={{ width: 200, height: 150, objectFit: 'cover' }}
                onError={(e) => {
                  // Additional client-side fallback
                  e.currentTarget.src = '/images/final-fallback.png';
                }}
              />
            </div>
            
            <div className="image-info">
              <p className="image-id">{asset.id}</p>
              {errors[asset.id] && (
                <div className="error-info">
                  {failedImages.includes(asset.id) ? (
                    <span className="failed-badge">❌ Failed</span>
                  ) : retryAttempts[asset.id] ? (
                    <span className="retry-badge">🔄 Retry {retryAttempts[asset.id]}/{maxRetries}</span>
                  ) : (
                    <span className="error-badge">⚠️ Error</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 7: Custom hook for common image patterns
export function useImageGallery(initialAssets: ImageAsset[] = []) {
  const [assets, setAssets] = useState<ImageAsset[]>(initialAssets);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const {
    getImage,
    hasImage,
    getAllImages,
    isLoading,
    progress,
  } = useImages({ assets });

  const addImage = useCallback((asset: ImageAsset) => {
    setAssets(prev => [...prev, asset]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
    if (selectedImage === id) {
      setSelectedImage(null);
    }
  }, [selectedImage]);

  const selectImage = useCallback((id: string) => {
    setSelectedImage(hasImage(id) ? id : null);
  }, [hasImage]);

  const getSelectedImageSrc = useCallback(() => {
    return selectedImage ? getImage(selectedImage) : null;
  }, [selectedImage, getImage]);

  return {
    // State
    assets,
    selectedImage,
    isLoading,
    progress,
    
    // Computed
    loadedImages: getAllImages(),
    loadedCount: Object.keys(getAllImages()).length,
    totalCount: assets.length,
    
    // Actions
    addImage,
    removeImage,
    selectImage,
    getImage,
    hasImage,
    getSelectedImageSrc,
    
    // Helpers
    isImageLoaded: (id: string) => hasImage(id),
    getLoadingProgress: () => Math.round(progress * 100),
  };
}

// Usage of the custom hook
export function CustomImageGalleryDemo() {
  const gallery = useImageGallery([
    { id: 'demo1', source: 'https://picsum.photos/400/300?random=10' },
    { id: 'demo2', source: 'https://picsum.photos/400/300?random=11' },
    { id: 'demo3', source: 'https://picsum.photos/400/300?random=12' },
  ]);

  const addRandomImage = () => {
    const id = `random-${Date.now()}`;
    gallery.addImage({
      id,
      source: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`
    });
  };

  return (
    <div className="custom-gallery-demo">
      <h2>Custom Image Gallery Hook Demo</h2>
      
      <div className="gallery-controls">
        <button onClick={addRandomImage}>Add Random Image</button>
        <div className="gallery-stats">
          <span>Images: {gallery.totalCount}</span>
          <span>Loaded: {gallery.loadedCount}</span>
          <span>Progress: {gallery.getLoadingProgress()}%</span>
        </div>
      </div>

      {gallery.isLoading && (
        <div className="loading-bar">
          <div 
            className="loading-fill" 
            style={{ width: `${gallery.getLoadingProgress()}%` }}
          />
        </div>
      )}

      <div className="gallery-content">
        <div className="thumbnail-grid">
          {gallery.assets.map(asset => (
            <div 
              key={asset.id}
              className={`thumbnail ${gallery.selectedImage === asset.id ? 'selected' : ''}`}
              onClick={() => gallery.selectImage(asset.id)}
            >
              {gallery.isImageLoaded(asset.id) ? (
                <img src={gallery.getImage(asset.id)} alt={asset.id} />
              ) : (
                <div className="thumbnail-placeholder">Loading...</div>
              )}
              <button 
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  gallery.removeImage(asset.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {gallery.selectedImage && (
          <div className="main-image">
            <h3>Selected: {gallery.selectedImage}</h3>
            <img 
              src={gallery.getSelectedImageSrc() || ''} 
              alt={gallery.selectedImage}
              style={{ maxWidth: '100%', maxHeight: 400 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}