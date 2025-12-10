import { Stack } from "expo-router";
import { Provider } from 'react-redux';
import { store } from '../store/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
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
    </Provider>
  );
}
