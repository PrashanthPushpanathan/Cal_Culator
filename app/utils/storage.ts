import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PHOTOS_KEY = 'SAVED_PHOTOS';

export type PhotoItem = {
  key: string;
  uri: string;
  nutrition: {
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  };
};

export const getPhotos = async (): Promise<PhotoItem[]> => {
  try {
    const json = await AsyncStorage.getItem(PHOTOS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error reading photos', error);
    return [];
  }
};

export const storePhoto = async (originalUri: string): Promise<void> => {
  try {
    const filename = `${Date.now()}.jpg`;
    const folder = `${FileSystem.documentDirectory}photos/`;

    const dirInfo = await FileSystem.getInfoAsync(folder);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
    }

    const newUri = folder + filename;
    await FileSystem.copyAsync({ from: originalUri, to: newUri });

    const newPhoto: PhotoItem = {
      key: filename,
      uri: newUri,
      nutrition: {
        calories: Math.floor(Math.random() * 500) + 300,
        protein: Math.floor(Math.random() * 50) + 10,
        fats: Math.floor(Math.random() * 30) + 5,
        carbs: Math.floor(Math.random() * 100) + 20,
      },
    };

    const current = await getPhotos();
    const updated = [newPhoto, ...current];
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to store photo', error);
    throw error;
  }
};

export const deletePhoto = async (key: string): Promise<void> => {
  try {
    const current = await getPhotos();
    const updated = current.filter(photo => photo.key !== key);
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updated));

    const photoPath = `${FileSystem.documentDirectory}photos/${key}`;
    const fileInfo = await FileSystem.getInfoAsync(photoPath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(photoPath);
    }
  } catch (error) {
    console.error('Failed to delete photo', error);
    throw error;
  }
};
