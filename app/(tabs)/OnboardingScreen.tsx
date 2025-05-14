import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';

const OnboardingScreen = () => {
  const [age, setAge] = useState<number>(25);
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(70);
  const [goalWeight, setGoalWeight] = useState<number>(75);
  const router = useRouter();

  const handleCalculate = () => {
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const isGaining = goalWeight > weight;
    const kcalChangePerDay = 480;
    const calorieGoal = isGaining ? bmr + kcalChangePerDay : bmr - kcalChangePerDay;

    const proteinGrams = weight * 2;
    const proteinCalories = proteinGrams * 4;

    const fatCalories = calorieGoal * 0.25;
    const fatGrams = fatCalories / 9;

    const remainingCalories = calorieGoal - (proteinCalories + fatCalories);
    const carbGrams = remainingCalories / 4;

    const weightDifference = Math.abs(goalWeight - weight);
    const kcalPerKg = 7700;
    const totalKcalNeeded = weightDifference * kcalPerKg;
    const estimatedDays = Math.ceil(totalKcalNeeded / kcalChangePerDay);

    router.push({
      pathname: '/(tabs)/GalleryScreen',
      params: {
        calories: calorieGoal,
        protein: proteinGrams,
        fats: fatGrams,
        carbs: carbGrams,
        daysLeft: estimatedDays,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputsContainer}>
        <Text style={styles.inputLabel}>Age: {age}</Text>
        <Slider
          style={styles.slider}
          minimumValue={18}
          maximumValue={100}
          step={1}
          value={age}
          onValueChange={(value) => setAge(value)}
          minimumTrackTintColor="#00BFFF"
          maximumTrackTintColor="#ddd"
        />

        <Text style={styles.inputLabel}>Height (cm): {height}</Text>
        <Slider
          style={styles.slider}
          minimumValue={100}
          maximumValue={250}
          step={1}
          value={height}
          onValueChange={(value) => setHeight(value)}
          minimumTrackTintColor="#00BFFF"
          maximumTrackTintColor="#ddd"
        />

        <Text style={styles.inputLabel}>Current Weight (kg): {weight}</Text>
        <Slider
          style={styles.slider}
          minimumValue={30}
          maximumValue={200}
          step={1}
          value={weight}
          onValueChange={(value) => setWeight(value)}
          minimumTrackTintColor="#00BFFF"
          maximumTrackTintColor="#ddd"
        />

        <Text style={styles.inputLabel}>Goal Weight (kg): {goalWeight}</Text>
        <Slider
          style={styles.slider}
          minimumValue={30}
          maximumValue={200}
          step={1}
          value={goalWeight}
          onValueChange={(value) => setGoalWeight(value)}
          minimumTrackTintColor="#00BFFF"
          maximumTrackTintColor="#ddd"
        />

        <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
          <Text style={styles.buttonText}>Calculate Goals</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  inputsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  slider: {
    width: '80%',
    height: 40,
    marginBottom: 20,
  },
  calculateButton: {
    backgroundColor: '#00BFFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
