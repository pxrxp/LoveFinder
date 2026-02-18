import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';

const AudioPreview = ({ uri }: { uri: string }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = async () => {
    if (!sound) return;
    if (playing) {
      await sound.pauseAsync();
      setPlaying(false);
    } else {
      await sound.playAsync();
      setPlaying(true);
    }
  };

  useEffect(() => {
    const load = async () => {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
    };
    load();
    return () => { sound?.unloadAsync(); };
  }, [uri]);

  return <Pressable onPress={togglePlay}>{playing ? 'Pause' : 'Play'}</Pressable>;
};

