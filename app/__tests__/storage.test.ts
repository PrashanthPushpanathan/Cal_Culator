// app/__tests__/storage.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { ImageAnalyzer } from '../utils/ImageAnalyzer';
import { getPhotos, storePhoto, deletePhoto, PhotoItem } from '../utils/storage';
// ---- Mocks ----
// AsyncStorage mocken
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
      getItem: jest.fn(),
      setItem: jest.fn(),
  },
}));
// FileSystem mocken
jest.mock('expo-file-system', () => ({
  __esModule: true,
  documentDirectory: 'file://documents/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));
// ImageAnalyzer mocken
jest.mock('../utils/imageAnalyzer', () => ({
  ImageAnalyzer: {
      analyseImage: jest.fn(),
  },
}));
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockedFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const mockedImageAnalyzer = ImageAnalyzer as jest.Mocked<typeof ImageAnalyzer>;
describe('storage utils', () => {
  beforeEach(() => {
      jest.clearAllMocks();
  });
  // ---------- getPhotos ----------
  it('getPhotos: gibt gespeicherte Fotos zurück, wenn JSON vorhanden ist', async () => {
      const mockPhotos: PhotoItem[] = [
          {
              key: '1.jpg',
              uri: 'file://documents/photos/1.jpg',
              nutrition: { calories: 100, protein: 5, fats: 3, carbs: 10 },
          },
      ];
      mockedAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockPhotos));
      const result = await getPhotos();
      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith('SAVED_PHOTOS');
      expect(result).toEqual(mockPhotos);
  });
  it('getPhotos: gibt leeres Array zurück, wenn kein Eintrag existiert', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(null);
      const result = await getPhotos();
      expect(result).toEqual([]);
  });
  it('getPhotos: gibt leeres Array zurück, wenn ein Fehler auftritt', async () => {
      mockedAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
      const result = await getPhotos();
      expect(result).toEqual([]);
  });
  // ---------- storePhoto ----------
  it('storePhoto: legt Ordner an, kopiert Bild, analysiert es und speichert es', async () => {
      // Date.now fixen -> deterministischer Dateiname
      jest.spyOn(Date, 'now').mockReturnValue(123456789);
      // Verzeichnis existiert noch nicht
      mockedFileSystem.getInfoAsync.mockResolvedValueOnce({ exists: false } as any);
      // Kopieren und Analyse erfolgreich
      mockedFileSystem.copyAsync.mockResolvedValueOnce(undefined as any);
      mockedImageAnalyzer.analyseImage.mockResolvedValueOnce({
          calories: 500,
          protein: 30,
          fat: 20,
          carbohydrates: 50,
      });
      // Aktuell gespeicherte Fotos: keins
      mockedAsyncStorage.getItem.mockResolvedValueOnce(null);
      const originalUri = 'file://temp/original.jpg';
      await storePhoto(originalUri);
      const expectedFilename = '123456789.jpg';
      const expectedFolder = 'file://documents/photos/';
      const expectedNewUri = expectedFolder + expectedFilename;
      // Verzeichnis-Checks
      expect(mockedFileSystem.getInfoAsync).toHaveBeenCalledWith(expectedFolder);
      expect(mockedFileSystem.makeDirectoryAsync).toHaveBeenCalledWith(expectedFolder, {
          intermediates: true,
      });
      // Kopieren
      expect(mockedFileSystem.copyAsync).toHaveBeenCalledWith({
          from: originalUri,
          to: expectedNewUri,
      });
      // Analyse
      expect(mockedImageAnalyzer.analyseImage).toHaveBeenCalledWith(expectedNewUri);
      // Speicherung in AsyncStorage
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledTimes(1);
      const [key, json] = mockedAsyncStorage.setItem.mock.calls[0];
      expect(key).toBe('SAVED_PHOTOS');
      const storedArray = JSON.parse(json) as PhotoItem[];
      expect(storedArray).toHaveLength(1);
      expect(storedArray[0]).toMatchObject({
          key: expectedFilename,
          uri: expectedNewUri,
          nutrition: {
              calories: 500,
              protein: 30,
              fats: 20,
              carbs: 50,
          },
      });
  });
  it('storePhoto: wirft Fehler weiter, wenn etwas schiefgeht', async () => {
      mockedFileSystem.getInfoAsync.mockRejectedValueOnce(new Error('FS error'));
      await expect(storePhoto('file://temp.jpg')).rejects.toThrow('FS error');
  });
  // ---------- deletePhoto ----------
  it('deletePhoto: entfernt Eintrag aus AsyncStorage und löscht Datei, wenn vorhanden', async () => {
      const existing: PhotoItem[] = [
          {
              key: 'keep.jpg',
              uri: 'file://documents/photos/keep.jpg',
              nutrition: { calories: 100, protein: 5, fats: 3, carbs: 10 },
          },
          {
              key: 'delete.jpg',
              uri: 'file://documents/photos/delete.jpg',
              nutrition: { calories: 200, protein: 10, fats: 5, carbs: 20 },
          },
      ];
      mockedAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existing));
      mockedFileSystem.getInfoAsync.mockResolvedValueOnce({ exists: true } as any);
      mockedFileSystem.deleteAsync.mockResolvedValueOnce(undefined as any);
      await deletePhoto('delete.jpg');
      // AsyncStorage: Liste ohne das zu löschende Foto
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
          'SAVED_PHOTOS',
          JSON.stringify([
              {
                  key: 'keep.jpg',
                  uri: 'file://documents/photos/keep.jpg',
                  nutrition: { calories: 100, protein: 5, fats: 3, carbs: 10 },
              },
          ]),
      );
      // Datei gelöscht
      expect(mockedFileSystem.getInfoAsync).toHaveBeenCalledWith(
          'file://documents/photos/delete.jpg',
      );
      expect(mockedFileSystem.deleteAsync).toHaveBeenCalledWith(
          'file://documents/photos/delete.jpg',
      );
  });
  it('deletePhoto: wirft Fehler weiter, wenn etwas schiefgeht', async () => {
      // getPhotos() fängt Fehler ab und gibt [] zurück, daher müssen wir
      // FileSystem.getInfoAsync mocken, um einen Fehler zu werfen
      mockedAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([]));
      mockedFileSystem.getInfoAsync.mockRejectedValueOnce(new Error('Storage error'));
      await expect(deletePhoto('any.jpg')).rejects.toThrow('Storage error');
  });
});