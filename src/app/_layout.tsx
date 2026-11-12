import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Mi Pokédex',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="haptics"
        options={{
          title: 'Haptics',
        }}
      />
    </Stack>
  );
}