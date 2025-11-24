import { Stack } from 'expo-router';
import { colorPalette } from '@con/colors';

export default function UserLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colorPalette.baseDark,
        },
      }}
    />
  );
}
