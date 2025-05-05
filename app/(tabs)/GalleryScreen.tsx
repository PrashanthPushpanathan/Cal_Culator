import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPhotos, deletePhoto } from '../utils/storage';
import { useFocusEffect, router } from 'expo-router';

export default function GalleryScreen() {
  const [photos, setPhotos] = useState<Array<{ key: string; uri: string }>>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPhotos = async () => {
    setRefreshing(true);
    try {
      const loadedPhotos = await getPhotos();
      setPhotos(loadedPhotos);
    } catch (error) {
      Alert.alert('Error', 'Failed to load photos');
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [])
  );

  const handleDelete = async (key: string) => {
    try {
      await deletePhoto(key);
      loadPhotos();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete photo');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Photo Gallery</Text>
        <View style={{ width: 24 }} />
      </View>

      {photos.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="images" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No photos yet</Text>
          <Text style={styles.emptySubtext}>Take some pictures with the camera</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          numColumns={3}
          keyExtractor={(item) => item.key}
          refreshing={refreshing}
          onRefresh={loadPhotos}
          renderItem={({ item, index }) => (
            <View style={styles.photoContainer}>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/PhotoViewer',
                    params: {
                      index: index.toString(),
                      all: JSON.stringify(photos.map((p) => p.uri)),
                    },
                  })
                }
              >
                <Image source={{ uri: item.uri }} style={styles.photo} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.key)}
              >
                <Ionicons name="trash" size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* ➕ Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/OpenCamera')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
  emptySubtext: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 5,
  },
  photoContainer: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 2,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 12, // Cube Look
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
