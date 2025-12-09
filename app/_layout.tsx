import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="movie-detail" 
        options={{ 
          presentation: 'card',
          headerShown: true,
          headerTitle: 'Movie Details',
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="cinema-detail" 
        options={{ 
          presentation: 'card',
          headerShown: true,
          headerTitle: 'Cinema Details',
          headerBackTitle: 'Back',
        }} 
      />
    </Stack>
  );
}
