import { createContext, useContext, useState, ReactNode } from "react";
import ImageViewing from "react-native-image-viewing";

type ImageViewerContextType = {
  openImageViewer: (image: string) => void;
};

const ImageViewerContext = createContext<ImageViewerContextType | undefined>(undefined);

export const ImageViewerProvider = ({ children }: { children: ReactNode }) => {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  const openImageViewer = (image: string) => {
    setViewerImage(image);
    setViewerVisible(true);
  };

  const closeViewer = () => {
    setViewerVisible(false);
    setViewerImage(null);
  };

  return (
    <ImageViewerContext.Provider value={{ openImageViewer }}>
      {children}

      <ImageViewing
        presentationStyle="pageSheet"
        images={viewerImage ? [{ uri: viewerImage }] : []}
        animationType="slide"
        swipeToCloseEnabled
        imageIndex={0}
        visible={viewerVisible}
        onRequestClose={closeViewer}
      />
    </ImageViewerContext.Provider>
  );
};

export const useImageViewerContext = () => {
  const context = useContext(ImageViewerContext);
  if (!context) {
    throw new Error("useImageViewer must be used inside ImageViewerProvider");
  }
  return context;
};
