import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { styles } from './ShHeroImage.styles';
import { spacing } from '@con/spacing';

interface ShHeroImageProps {
  imageUrl?: string;
  height?: number;
  overlayOpacity?: number;
}

export const ShHeroImage: React.FC<ShHeroImageProps> = ({
  imageUrl,
  height = spacing.heroImageHeight,
  overlayOpacity = 0.3, // Reduced from 0.6 for debugging
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.log('Hero image failed to load:', imageUrl);
    setImageError(true);
  };

  // Debug log to see what URL is being received
  console.log('ShHeroImage props:', {
    imageUrl,
    height,
    overlayOpacity,
    imageError,
  });

  return (
    <View style={[styles.container, { height }]}>
      {imageUrl && !imageError ? (
        <>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            onError={handleImageError}
            resizeMode="cover"
          />
          <View style={[styles.overlay, { opacity: overlayOpacity }]} />
        </>
      ) : (
        <View style={[styles.overlay, { opacity: 1 }]} />
      )}
    </View>
  );
};
