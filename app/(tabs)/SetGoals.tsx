import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';

export default function SetGoals() {
  const router = useRouter();

  const [goalCalories, setGoalCalories] = useState<number>(100);
  const [goalProtein, setGoalProtein] = useState<number>(10);
  const [goalFats, setGoalFats] = useState<number>(10);
  const [goalCarbs, setGoalCarbs] = useState<number>(10);

  const handleSaveGoals = () => {
    // Just a placeholder, you can save the values to context or state
    console.log({
      goalCalories,
      goalProtein,
      goalFats,
      goalCarbs,
    });
    
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Set Your Goals</Text>
        <View style={{ width: 24 }} />

      </View>
      

      {/* Calories Goal Slider */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: '#00BFFF' }]}>Calories Goal: {goalCalories}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={5000}
          step={10}
          value={goalCalories}
          onValueChange={(value: React.SetStateAction<number>) => setGoalCalories(value)}
        />
      </View>

      {/* Protein Goal Slider */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: '#FF6B6B' }]}>Protein Goal: {goalProtein}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={500}
          step={5}
          value={goalProtein}
          onValueChange={(value: React.SetStateAction<number>) => setGoalProtein(value)}
        />
      </View>

      {/* Fats Goal Slider */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: '#FFD166' }]}>Fats Goal: {goalFats}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={200}
          step={5}
          value={goalFats}
          onValueChange={(value: React.SetStateAction<number>) => setGoalFats(value)}
        />
      </View>

      {/* Carbs Goal Slider */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: '#06D6A0' }]}>Carbs Goal: {goalCarbs}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={500}
          step={5}
          value={goalCarbs}
          onValueChange={(value: React.SetStateAction<number>) => setGoalCarbs(value)}
        />
      </View>

      <Button title="Save Goals" onPress={handleSaveGoals} />
      <Button title="Cancel" onPress={router.back} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', paddingTop: 40 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: 'white' },

  centerContent: {
    alignItems: 'center',
    marginVertical: 20
  },
  sectionContainer: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 10,
  },
});
