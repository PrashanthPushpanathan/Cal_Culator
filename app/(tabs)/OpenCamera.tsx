  import React, { useState, useEffect, useRef } from 'react';
  import { View, TouchableOpacity, StyleSheet, Alert, Text, ActivityIndicator } from 'react-native';
  import { CameraView, Camera } from 'expo-camera';
  import { Ionicons } from '@expo/vector-icons';
  import * as ImagePicker from 'expo-image-picker';
  import { router } from 'expo-router';
  import { storePhoto } from '../utils/storage';
  import { ImageAnalyzer } from '../utils/ImageAnalyzer';

  export default function OpenCamera() {
    const cameraRef = useRef<CameraView>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [facing, setFacing] = useState<'front' | 'back'>('back');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }, []);

  const takePictureAndSave = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera not ready');
      return;
    }

    let photo: { uri: string } | null = null;

    try {
      setIsAnalyzing(true);
      photo = await cameraRef.current.takePictureAsync();
      if (!photo?.uri) throw new Error('Invalid photo');

      // Start fake progress animation
      let fakeProgress = 0;
      const fakeInterval = setInterval(() => {
        fakeProgress += 5;
        if (fakeProgress > 80) clearInterval(fakeInterval);
      }, 100);

      // Run analysis in parallel with fake loading
      const analysisPromise = ImageAnalyzer.analyseImage(photo.uri);
      
      // Minimum show time for animation (1.5 seconds)
      const minimumLoadTime = Promise.all([
        analysisPromise,
        new Promise(resolve => setTimeout(resolve, 1500))
      ]).then(([nutrition]) => nutrition);

      const nutrition = await minimumLoadTime;
      clearInterval(fakeInterval); // Clear if still running
      
      // Store photo with nutrition data
      const savedPhoto = await storePhoto({
        uri: photo.uri,
        nutrition: {
          calories: nutrition.calories,
          protein: nutrition.protein,
          fats: nutrition.fat,
          carbs: nutrition.carbohydrates
        }
      });

      setIsAnalyzing(false);
      
      Alert.alert(
        'Analysis Complete', 
        `Nutrition Information:\n\nCalories: ${nutrition.calories} kcal\nProtein: ${nutrition.protein}g\nFat: ${nutrition.fat}g\nCarbs: ${nutrition.carbohydrates}g`, 
        [
          { 
            text: 'View Details', 
            onPress: () => router.push({
              pathname: '/(tabs)/PhotoViewer',
              params: { 
                photo: JSON.stringify(savedPhoto)
              }
            }) 
          },
          { text: 'Take Another', style: 'cancel' }
        ]
      );
      } catch (error) {
        setIsAnalyzing(false);
        
        const actions = [];
        
        if (photo?.uri) {
          actions.push({
            text: 'Save Without Analysis', 
            onPress: async () => {
              try {
                const savedPhoto = await storePhoto({
                  uri: photo!.uri,
                  nutrition: {
                    calories: 0,
                    protein: 0,
                    fats: 0,
                    carbs: 0
                  }
                });
                router.push('/(tabs)/GalleryScreen');
              } catch (saveError) {
                Alert.alert('Error', 'Failed to save photo');
              }
            }
          });
        }
        
        actions.push({ 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('Cancelled')
        });
        
        Alert.alert(
          'Analysis Failed', 
          error instanceof Error ? error.message : 'Could not analyze the food photo',
        );
      }
    };

    const pickImageFromLibrary = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets.length > 0) {
        try {
          setIsAnalyzing(true);
          const uri = result.assets[0].uri;
          const nutrition = await ImageAnalyzer.analyseImage(uri);

          const savedPhoto = await storePhoto({
            uri,
            nutrition: {
              calories: nutrition.calories,
              protein: nutrition.protein,
              fats: nutrition.fat,
              carbs: nutrition.carbohydrates
            }
          });

          setIsAnalyzing(false);
          Alert.alert(
            'Analysis Complete', 
            `Nutrition Information:\n\nCalories: ${nutrition.calories} kcal\nProtein: ${nutrition.protein}g\nFat: ${nutrition.fat}g\nCarbs: ${nutrition.carbohydrates}g`, 
            [
              { 
                text: 'View Details', 
                onPress: () => router.push({
                  pathname: '/(tabs)/PhotoViewer',
                  params: { 
                    photo: JSON.stringify(savedPhoto)
                  }
                }) 
              },
              { text: 'Pick Another', style: 'cancel' }
            ]
          );
        } catch (error) {
          setIsAnalyzing(false);
          Alert.alert(
            'Analysis Failed', 
            error instanceof Error ? error.message : 'Could not analyze the food photo',
            [
              { text: 'OK', style: 'cancel' }
            ]
          );
        }
      }
    };

    if (hasPermission === null) {
      return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
    }

    if (hasPermission === false) {
      return (
        <View style={styles.container}>
          <Text style={styles.permissionText}>Camera permission denied</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => router.push('/(tabs)/GalleryScreen')}
          >
            <Text style={styles.permissionButtonText}>Go to Gallery</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <CameraView 
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          enableTorch={false}
          autofocus="on"
          zoom={0}
        >
          {isAnalyzing && (
            <View style={styles.analyzingOverlay}>
              <ActivityIndicator size="large" color="#00BFFF" />
              <Text style={styles.analyzingText}>Analyzing your food...</Text>
            </View>
          )}
          
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={takePictureAndSave}
              disabled={isAnalyzing}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
              disabled={isAnalyzing}
            >
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.galleryButton}
              onPress={pickImageFromLibrary}
              disabled={isAnalyzing}
            >
              <Ionicons name="images" size={24} color="white" />
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
      justifyContent: 'center',
      alignItems: 'center' 
    },
    camera: { 
      flex: 1,
      width: '100%' 
    },
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
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  analyzingText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#00BFFF',
    padding: 15,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});