import ImageViewing from 'react-native-image-viewing';
import { useLocalSearchParams, router } from 'expo-router';

export default function PhotoViewer() {
  const params = useLocalSearchParams();
  const rawAll = Array.isArray(params.all) ? params.all[0] : params.all;
  const rawIndex = Array.isArray(params.index) ? params.index[0] : params.index;

  if (!rawAll || typeof rawAll !== 'string') return null;

  const images = JSON.parse(rawAll).map((uri: string) => ({ uri }));
  const imageIndex = parseInt(rawIndex ?? '0', 10);

  return (
    <ImageViewing
      images={images}
      imageIndex={imageIndex}
      visible={true}
      onRequestClose={() => router.back()}
    />
  );
}
