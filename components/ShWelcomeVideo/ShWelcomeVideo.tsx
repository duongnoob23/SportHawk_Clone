import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
//import { colorPalette, ColorName } from '@con/colors';

const { width } = Dimensions.get('window');

interface ShWelcomeVideoProps {
  style?: any;
}

const mp4Width = 390;
const mp4Height = 700;
const mp4TopCrop = -90;

const videoScaling = width / mp4Width;

// const scaledWidth = width;
const scaledHeight = mp4Height * videoScaling;
// const scaledTopCrop = mp4TopCrop * videoScaling;
const scaledMarginTop = mp4TopCrop * videoScaling;

const visibleHeightFraction = (mp4Height + mp4TopCrop) / mp4Height;

export const ShWelcomeVideo: React.FC<ShWelcomeVideoProps> = ({ style }) => {
  const videoSource = require('@vid/sporthawk-welcome-video.mp4');
  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <View style={[styles.videoContainer, style]}>
      <VideoView
        style={styles.video}
        player={player}
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
        contentFit="cover"
        nativeControls={false} // ✅ QUAN TRỌNG
      />
      <LinearGradient
        // colors={['transparent', 'rgba(22,22,21,0.8)', 'rgba(22,22,21,1)']}
        // locations={[0.3, 0.7, 1]}
        // colors={['transparent', , 'rgba(0,0,0,1)']}
        // locations={[0.5, 0.6]}
        colors={['transparent', 'rgba(22,22,21,0.8)', 'rgba(22,22,21,1)']}
        locations={[
          0.3 * visibleHeightFraction,
          0.85 * visibleHeightFraction,
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
  videoContainer: {
    width: width,
    height: scaledHeight,
    alignSelf: 'center',
    marginTop: scaledMarginTop,
    overflow: 'hidden',
  },
  video: {
    width: width,
    height: scaledHeight,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    // bottom: 0,
    // left: 0,
    // right: 0,
    top: 0,
    left: 0,
    width: width,
    height: scaledHeight, // Cover bottom half of video
    zIndex: 10,
    elevation: 10, // For Android
  },
});
