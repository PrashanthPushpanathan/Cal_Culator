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
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { getPhotos, deletePhoto } from '../utils/storage';
import { useFocusEffect, router } from 'expo-router';

type ProgressCircleProps = {
  size: number;
  strokeWidth: number;
  progress: number;
  current: number;
  goal: number;
  label: string;
  color: string;
};

type MacroBarProps = {
  label: string;
  current: number;
  goal: number;
  color: string;
};

const ProgressCircle = ({
  size,
  strokeWidth,
  progress,
  current,
  goal,
  label,
  color,
}: ProgressCircleProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.circleContainer}>
      <Svg width={size} height={size}>
        <Circle
          stroke="#333"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.circleTextContainer}>
        <Ionicons name="flame" size={24} color={color} />
        <Text style={styles.circleText}>{current} kcal</Text>
        <Text style={styles.subText}>Goal {goal}</Text>
      </View>
    </View>
  );
};

const MacroBar = ({ label, current, goal, color }: MacroBarProps) => {
  const percent = Math.min(current / goal, 1);
  return (
    <View style={styles.macroBarContainer}>
      <View style={styles.macroLabelRow}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroNumbers}>{current} / {goal}g</Text>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percent * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

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
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <View style={{ height: 24 }} />
      </View>

      {/* CALORIE CIRCLE */}
      <View style={styles.centerContent}>
        <ProgressCircle
          size={200}
          strokeWidth={12}
          progress={630 / 1000}
          current={630}
          goal={1000}
          label="Calories"
          color="#00BFFF"
        />
      </View>

      {/* MACRO BARS */}
      <View style={styles.macroContainer}>
        <MacroBar label="Protein" current={60} goal={100} color="#FF6B6B" />
        <MacroBar label="Fats" current={40} goal={70} color="#FFD166" />
        <MacroBar label="Carbs" current={150} goal={200} color="#06D6A0" />
      </View>

      {/* RECENTS TITLE */}
      <View style={styles.recentsSection}>
        <Text style={styles.recentsTitle}>Recents</Text>
        <View style={styles.divider} />
      </View>

      {/* GALLERY */}
      {photos.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="images" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No photos yet</Text>
          <Text style={styles.emptySubtext}>Take some pictures with the camera</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.galleryList}
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

      {/* ADD PHOTO BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/OpenCamera')}
      >
        <Ionicons name="camera" size={30} color="white" />
      </TouchableOpacity>
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
    marginVertical: 20,
  },
  circleContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  circleText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
  },
  subText: {
    fontSize: 14,
    color: '#aaa',
  },

  macroContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  macroBarContainer: {
    marginBottom: 20,
  },
  macroLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  macroLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  macroNumbers: {
    color: '#ccc',
  },
  barBackground: {
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },

  recentsSection: {
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  recentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    width: '100%',
    marginBottom: 10,
  },

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
    borderRadius: 30,
    backgroundColor: '#00BFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  galleryList: {
    paddingBottom: 100,
  },
});
