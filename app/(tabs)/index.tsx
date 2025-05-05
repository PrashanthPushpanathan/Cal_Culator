import { useEffect } from 'react';
import { router } from 'expo-router';
import { InteractionManager } from 'react-native';

export default function RedirectToGallery() {
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      router.replace('/(tabs)/GalleryScreen');
    });

    return () => task.cancel(); // sauber abbrechen beim Unmount
  }, []);

  return null;
}
