import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from "react";

type AudioRecorderContextValue = {
  audioModuleVisible: boolean;
  audioRecordComplete: boolean;
  audioUri: string | null;
  openAudioModule: () => void;
  closeAudioModule: () => void;
  onAudioRecordComplete: (uri: string | null) => void;
};

const AudioRecorderContext = createContext<
  AudioRecorderContextValue | undefined
>(undefined);

export const AudioRecorderProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [audioModuleVisible, setAudioModuleVisible] = useState(false);
  const [audioRecordComplete, setAudioRecordComplete] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const openAudioModule = useCallback(() => {
    setAudioModuleVisible(true);
    setAudioRecordComplete(false);
    setAudioUri(null);
  }, []);

  const closeAudioModule = useCallback(() => {
    setAudioModuleVisible(false);
  }, []);

  const onAudioRecordComplete = useCallback((uri: string | null) => {
    setAudioRecordComplete(true);
    setAudioUri(uri);
  }, []);

  return (
    <AudioRecorderContext.Provider
      value={{
        audioModuleVisible,
        audioRecordComplete,
        audioUri,
        openAudioModule,
        closeAudioModule,
        onAudioRecordComplete,
      }}
    >
      {children}
    </AudioRecorderContext.Provider>
  );
};

export const useAudioRecorderContext = () => {
  const context = useContext(AudioRecorderContext);
  if (!context)
    throw new Error(
      "useAudioRecorderContext must be used inside AudioRecorderProvider",
    );
  return context;
};
