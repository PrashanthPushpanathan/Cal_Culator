import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageAnalyzer } from './ImageAnalyzer';

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

export const storePhoto = async (photoData: { uri: string; nutrition?: {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
} }): Promise<PhotoItem> => {
  try {
    const filename = `${Date.now()}.jpg`;
    const folder = `${FileSystem.documentDirectory}photos/`;

    // Ensure photos directory exists
    const dirInfo = await FileSystem.getInfoAsync(folder);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
    }

    // Copy photo to permanent location
    const newUri = folder + filename;
    await FileSystem.copyAsync({ from: photoData.uri, to: newUri });

    // Get nutrition data (either provided or from AI analysis)
    let nutritionData;
    if (photoData.nutrition) {
      nutritionData = photoData.nutrition;
    } else {
      try {
        const analyzedNutrition = await ImageAnalyzer.analyseImage(newUri);
        nutritionData = {
          calories: analyzedNutrition.calories,
          protein: analyzedNutrition.protein,
          fats: analyzedNutrition.fat,
          carbs: analyzedNutrition.carbohydrates
        };
      } catch (error) {
        console.error('AI analysis failed, using default values', error);
        nutritionData = {
          calories: 0,
          protein: 0,
          fats: 0,
          carbs: 0
        };
      }
    }

    // Create new photo item
    const newPhoto: PhotoItem = {
      key: filename,
      uri: newUri,
      nutrition: nutritionData
    };
    
    // Update storage
    const current = await getPhotos();
    const updated = [newPhoto, ...current];
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updated));

    return newPhoto;
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

    // Delete the actual file
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