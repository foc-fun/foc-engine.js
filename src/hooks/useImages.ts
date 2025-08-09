import { useCallback } from "react";
import { usePreloadedImages, ImageAsset } from "./useImagePreloader";

export interface ImageHookConfig {
  fallbackImage?: any;
  assets?: ImageAsset[];
}

export const useImages = (config: ImageHookConfig = {}) => {
  const { images: preloadedImages, isLoading, ...preloaderState } = usePreloadedImages(config.assets);

  const getImage = useCallback(
    (key: string) => {
      if (preloadedImages) {
        const image = preloadedImages[key];
        if (image) return image;
        
        if (config.fallbackImage) return config.fallbackImage;
        
        const unknownImage = preloadedImages.unknown;
        return unknownImage || null;
      }
      return config.fallbackImage || null;
    },
    [preloadedImages, config.fallbackImage],
  );

  const hasImage = useCallback(
    (key: string) => {
      return preloadedImages ? key in preloadedImages : false;
    },
    [preloadedImages]
  );

  const getAllImages = useCallback(() => {
    return preloadedImages || {};
  }, [preloadedImages]);

  return { 
    getImage, 
    hasImage,
    getAllImages,
    isLoading, 
    images: preloadedImages || {},
    ...preloaderState
  };
};