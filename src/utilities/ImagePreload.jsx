import { useEffect } from "react";
import { preloadAppImages, appImages } from "./preloadAppImages";

const ImagePreloader = () => {
  useEffect(() => {
    const loadImages = async () => {
      try {
        await preloadAppImages(Object.values(appImages));
        console.log("Images preloaded successfully");
      } catch (error) {
        console.error("Failed to preload images:", error);
      }
    };

    loadImages();
  }, []);

  return null;
};

export default ImagePreloader;
