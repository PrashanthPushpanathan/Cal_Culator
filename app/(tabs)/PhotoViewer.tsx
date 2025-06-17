import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
const PHOTOS_KEY = 'SAVED_PHOTOS';

    // Function to save updated nutrition info to AsyncStorage
const saveUpdatedNutrition = async (photoKey: string, updatedNutrition: any) => { 
  try {
    const json = await AsyncStorage.getItem(PHOTOS_KEY);
    const photos = json ? JSON.parse(json) : [];

    const updatedPhotos = photos.map((p: any) =>
      p.key === photoKey ? { ...p, nutrition: updatedNutrition } : p
    );

    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos));
    console.log('Nutrition saved');
  } catch (err) {
    console.error('Error saving nutrition:', err);
  }
};

// PhotoViewer page: view image from local storage and edit nutrition info
export default function PhotoViewer() {
  const { photo } = useLocalSearchParams();
  const photoData = JSON.parse(photo as string);
  const key = photoData.key || '';
  const uri = photoData.uri || '';
  const defaultNutrition = photoData.nutrition || {
    calories: 500,
    protein: 30,
    fats: 20,
    carbs: 60,
  };

  // State to manage edit mode and nutrition data
  const [editMode, setEditMode] = useState(false);
  // the nutrition to the displayed image
  const [nutrition, setNutrition] = useState(defaultNutrition);

  // handle change: set nutrition 
  const handleChange = (field: string, value: string) => {
    setNutrition({ ...nutrition, [field]: parseInt(value) || 0 });
  };

// View
return ( 
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri }} style={styles.image} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Meal Nutrition</Text>
          <TouchableOpacity
            onPress={async () => {
              if (editMode) {
                await saveUpdatedNutrition(key, nutrition);  // Save when exiting edit mode
              }
              setEditMode(!editMode);
            }}>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              if (editMode) {
                await saveUpdatedNutrition(key, nutrition); // Save when exiting edit mode
              }
              setEditMode(!editMode);
            }}>
            <Ionicons name={editMode ? 'checkmark' : 'create-outline'} size={24} color="#00BFFF" />
          </TouchableOpacity>
        </View>
              
        {editMode ? ( 
        // Edit
        <View style={styles.caloriesInputRow}>
        <TextInput
            style={styles.caloriesInput}
            keyboardType="numeric"
            value={nutrition['calories'].toString()}
            onChangeText={(value) => handleChange('calories', value)}
        />
        <Text style={styles.kcalLabel}>kcal</Text>
        </View>
      ):(
        // Display
        <Text style={styles.caloriesText}>{nutrition.calories} kcal</Text>
      )}

        {['protein', 'fats', 'carbs'].map((macro) => (
          <View key={macro} style={styles.macroRow}>
            <Text style={styles.macroLabel}>{macro.charAt(0).toUpperCase() + macro.slice(1)}:</Text>
            {editMode ? (
              //Edit
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={nutrition[macro].toString()}
                onChangeText={(value) => handleChange(macro, value)}
              />
            ) : (
              // Display
              <Text style={styles.macroValue}>{nutrition[macro]}g</Text>
            )}
          </View>
        ))}
      </View>
    </SafeAreaView>
    );
}

// Styles
const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: 'black' },
  imageContainer: {
    flex: 0.4,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  infoSection: {
    flex: 0.6,
    backgroundColor: '#111',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  caloriesText: {
    color: '#00BFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomColor: '#222',
    borderBottomWidth: 1,
  },
  macroLabel: {
    color: '#ccc',
    fontSize: 16,
  },
  macroValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    color: '#fff',
    backgroundColor: '#222',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    width: 60,
    textAlign: 'right',
  },
  caloriesInput: {
  color: '#00BFFF',
  backgroundColor: '#222',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  fontSize: 32,
  fontWeight: 'bold',
  textAlign: 'right',
  marginBottom: 24,
  width: 120,
},
caloriesInputRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 24,
},

kcalLabel: {
  color: '#00BFFF',
  fontSize: 24,
  fontWeight: 'bold',
  marginLeft: 8,
},

});
