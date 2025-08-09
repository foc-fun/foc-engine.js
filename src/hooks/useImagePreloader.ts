import { useState, useEffect, useCallback } from "react";

export interface ImageAsset {
  id: string;
  source: string | any;
  preloaded?: boolean;
}

export interface ImagePreloaderConfig {
  loadImmediately?: boolean;
  onLoadComplete?: (id: string) => void;
  onLoadError?: (id: string, error: any) => void;
  onAllLoaded?: (images: Record<string, any>) => void;
}

interface PreloaderState {
  images: Record<string, any> | null;
  isLoading: boolean;
  loadedCount: number;
  totalCount: number;
  errors: Record<string, any>;
}

export const useImagePreloader = (
  assets: ImageAsset[],
  config: ImagePreloaderConfig = {}
) => {
  const [state, setState] = useState<PreloaderState>({
    images: null,
    isLoading: false,
    loadedCount: 0,
    totalCount: assets.length,
    errors: {},
  });

  const loadImage = useCallback(
    async (asset: ImageAsset) => {
      try {
        let loadedImage: any;

        if (typeof window !== "undefined" && window.Image) {
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = typeof asset.source === "string" ? asset.source : asset.source.default || asset.source;
          });
          loadedImage = img.src;
        } else {
          loadedImage = asset.source;
        }

        setState((prev) => {
          const newImages = { ...prev.images, [asset.id]: loadedImage };
          const newLoadedCount = prev.loadedCount + 1;
          const isComplete = newLoadedCount === prev.totalCount;

          if (isComplete && config.onAllLoaded) {
            config.onAllLoaded(newImages);
          }

          return {
            ...prev,
            images: newImages,
            loadedCount: newLoadedCount,
            isLoading: !isComplete,
          };
        });

        config.onLoadComplete?.(asset.id);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          errors: { ...prev.errors, [asset.id]: error },
          loadedCount: prev.loadedCount + 1,
          isLoading: prev.loadedCount + 1 < prev.totalCount,
        }));

        config.onLoadError?.(asset.id, error);
      }
    },
    [config]
  );

  const startLoading = useCallback(() => {
    if (assets.length === 0) {
      setState((prev) => ({ ...prev, isLoading: false, images: {} }));
      config.onAllLoaded?.({});
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, images: {}, loadedCount: 0 }));

    assets.forEach((asset) => {
      loadImage(asset);
    });
  }, [assets, loadImage, config]);

  useEffect(() => {
    if (config.loadImmediately !== false) {
      startLoading();
    }
  }, [startLoading, config.loadImmediately]);

  return {
    ...state,
    startLoading,
    progress: state.totalCount > 0 ? state.loadedCount / state.totalCount : 0,
  };
};

export const usePreloadedImages = (assets?: ImageAsset[]) => {
  const defaultAssets: ImageAsset[] = assets || [];

  return useImagePreloader(defaultAssets, {
    loadImmediately: true,
  });
};