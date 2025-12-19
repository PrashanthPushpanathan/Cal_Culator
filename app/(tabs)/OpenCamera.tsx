import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { storePhoto } from '../utils/storage';

// OpenCamera page: allows user to take a picture or pick an image from the gallery
export default function OpenCamera() {
  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('back');

  // Check for camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Function to take a picture and save it
  const takePictureAndSave = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera not ready');
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (!photo?.uri) throw new Error('Invalid photo');

      await storePhoto(photo.uri);
      Alert.alert('Success', 'Photo saved!', [
        { text: 'View Gallery', onPress: () => router.push('/(tabs)/GalleryScreen') },
        { text: 'Keep Shooting', style: 'cancel' },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save photo');
    }
  };

  // Function to pick an image from the phone gallery and save it
  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      try {
        const uri = result.assets[0].uri;
        await storePhoto(uri);
        Alert.alert('Success', 'Image saved from gallery!', [
          { text: 'View Gallery', onPress: () => router.push('/(tabs)/GalleryScreen') },
          { text: 'Pick Another', style: 'cancel' },
        ]);
      } catch (error) {
        Alert.alert('Error', 'Failed to save image');
      }
    }
  };

  // Render the camera view or permission status
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>Camera permission denied</Text>
      </View>
    );
  }

  // View
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.captureButton} onPress={takePictureAndSave}>
            <View style={styles.captureInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
          >
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.galleryButton} onPress={pickImageFromLibrary}>
            <Ionicons name="images" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  topBar: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  captureButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    backgroundColor: 'white',
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  flipButton: {
    position: 'absolute',
    right: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
    padding: 15,
  },
  galleryButton: {
    position: 'absolute',
    left: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
    padding: 15,
  },
});
