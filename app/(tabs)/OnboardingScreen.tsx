import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Picker } from 'react-native';
import { useRouter } from 'expo-router';

const OnboardingScreen = () => {
  const [goal, setGoal] = useState<'gain' | 'lose' | null>(null);
  const [age, setAge] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [fats, setFats] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const router = useRouter();

  const handleCalculate = () => {
    if (goal && age && height && weight) {
      const ageNum = parseInt(age);
      const heightNum = parseInt(height);
      const weightNum = parseInt(weight);

      // Calculate daily calorie intake (this is just a placeholder for your formula)
      const bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5; // Mifflin-St Jeor Equation for Men
      const calorieGoal = goal === 'gain' ? bmr + 500 : bmr - 500;

      // Set up macros (example formula)
      setCalories(calorieGoal);
      setProtein(calorieGoal * 0.3);
      setFats(calorieGoal * 0.2);
      setCarbs(calorieGoal * 0.5);

      // Navigate to the homepage with the results
      router.push({
        pathname: '/(tabs)/HomePage',
        params: {
          calories: calorieGoal,
          protein: calorieGoal * 0.3,
          fats: calorieGoal * 0.2,
          carbs: calorieGoal * 0.5,
        },
      });
    } else {
      alert('Please fill all the fields');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding</Text>
      <Text style={styles.label}>Select your goal</Text>
      <Picker
        selectedValue={goal}
        onValueChange={(itemValue) => setGoal(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Gain Weight" value="gain" />
        <Picker.Item label="Lose Weight" value="lose" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Age"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />
      <TextInput
        style={styles.input}
        placeholder="Height (in cm)"
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
      />
      <TextInput
        style={styles.input}
        placeholder="Weight (in kg)"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />

      <Button title="Calculate Goals" onPress={handleCalculate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'black',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  picker: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 5,
  },
});

export default OnboardingScreen;
