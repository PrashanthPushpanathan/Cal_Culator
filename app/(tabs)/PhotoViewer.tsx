import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';

export default function PhotoViewer() {
  const { photo } = useLocalSearchParams();
  const photoData = JSON.parse(photo as string);

  // Hardcoded values for testing purposes
  const uri = photoData.uri || '';  // Fallback to empty string if uri is missing
  const nutrition = photoData.nutrition || {
    calories: 500,
    protein: 30,
    fats: 20,
    carbs: 60,
  };

  const { calories, protein, fats, carbs } = nutrition;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri }} style={styles.image} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Meal Nutrition</Text>
        <Text style={styles.caloriesText}>{calories} kcal</Text>

        <View style={styles.macroRow}>
          <Text style={styles.macroLabel}>Protein:</Text>
          <Text style={styles.macroValue}>{protein}g</Text>
        </View>
        <View style={styles.macroRow}>
          <Text style={styles.macroLabel}>Fats:</Text>
          <Text style={styles.macroValue}>{fats}g</Text>
        </View>
        <View style={styles.macroRow}>
          <Text style={styles.macroLabel}>Carbs:</Text>
          <Text style={styles.macroValue}>{carbs}g</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
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
});
