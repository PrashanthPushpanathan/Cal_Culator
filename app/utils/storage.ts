import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageAnalyzer } from './ImageAnalyzer';

const PHOTOS_KEY = 'SAVED_PHOTOS';

type PhotoItem = {
  key: string;
  uri: string;
};

// Lade gespeicherte Fotoeinträge
export const getPhotos = async (): Promise<PhotoItem[]> => {
  try {
    const json = await AsyncStorage.getItem(PHOTOS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error reading photos', error);
    return [];
  }
};

// Speichere Foto-URI als kopierte Datei im App-Speicher
export const storePhoto = async (originalUri: string): Promise<void> => {
  try {
    const filename = `${Date.now()}.jpg`;
    const folder = `${FileSystem.documentDirectory}photos/`;

    // Stelle sicher, dass der Ordner existiert
    const dirInfo = await FileSystem.getInfoAsync(folder);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
    }

    const newUri = folder + filename;

    // Kopiere Datei in App-Ordner
    await FileSystem.copyAsync({ from: originalUri, to: newUri });

    const newPhoto: PhotoItem = { key: filename, uri: newUri };
    
    const a = ImageAnalyzer.analyseImage(newPhoto.uri)

    // Lade aktuelle Liste, hänge neues Foto an
    const current = await getPhotos();
    const updated = [newPhoto, ...current];
    
    // Speichere neue Liste
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to store photo', error);
    throw error;
  }
};

// Lösche Foto aus Liste und vom Dateisystem
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
