import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';

type RootStackParamList = {
  'index': undefined;
};

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function CameraScreen() {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCloseCamera = () => {
    navigation.navigate('index');
  };

  const handleFlipCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera not ready');
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (!photo) throw new Error('Photo capture failed');
      Alert.alert('Success', 'Photo captured!');
      console.log('Photo URI:', photo.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return (
    <View style={styles.permissionContainer}>
      <Text style={styles.permissionText}>Camera permission required</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* Top Bar with Close Button */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseCamera}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls - ABOVE the navigation bar */}
        <View style={styles.controlsContainer}>
          {/* Left: Gallery Picker Button */}
          <TouchableOpacity style={styles.galleryButton} onPress={handlePickImage}>
            <Ionicons name="images" size={30} color="white" />
          </TouchableOpacity>

          {/* Center: Capture Button */}
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          {/* Right: Flip Camera Button */}
          <TouchableOpacity style={styles.flipButton} onPress={handleFlipCamera}>
            <Ionicons name="camera-reverse" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 10,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 100, // Positioned above the navigation bar
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  galleryButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  captureButtonInner: {
    backgroundColor: 'white',
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});