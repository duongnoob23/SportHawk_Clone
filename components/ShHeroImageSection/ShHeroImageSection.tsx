import { colorPalette } from '@top/constants/colors';
import { opacity } from '@top/constants/opacity';
import { spacing } from '@top/constants/spacing';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
// import { styles } from './styles';
interface ShHeroImageSectionProps {
  imageUrl?: string;
}

const { width } = Dimensions.get('window');
const mp4Width = 390;
const mp4Height = 150;
const mp4TopCrop = 0;

const videoScaling = width / mp4Width;
const scaledHeight = mp4Height * videoScaling;

const visibleHeightFraction = (mp4Height + mp4TopCrop) / mp4Height;

export const ShHeroImageSection: React.FC<ShHeroImageSectionProps> = ({
  imageUrl,
}) => {
  return (
    <View style={styles.container}>
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
      <View style={styles.gradient} />
      <LinearGradient
        // colors={['transparent', 'rgba(22,22,21,0.8)', 'rgba(22,22,21,1)']}
        // locations={[0.3, 0.7, 1]}
        // colors={['transparent', , 'rgba(0,0,0,1)']}
        // locations={[0.5, 0.6]}
        colors={['transparent', 'rgba(22,22,21,0.8)', 'rgba(22,22,21,1)']}
        locations={[
          0.5 * visibleHeightFraction,
          0.8 * visibleHeightFraction,
          1 * visibleHeightFraction,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientOverlay}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: scaledHeight, 
    zIndex: 0,
    elevation: 10, 
  },
  container: {
    height: spacing.heroImageHeight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: spacing.none,
    left: spacing.none,
    right: spacing.none,
    height: '100%',
    backgroundColor: colorPalette.baseDark,
    opacity: opacity.none,
  },
});
