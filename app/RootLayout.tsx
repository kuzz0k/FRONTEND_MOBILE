import { useAppSelector } from '@/hooks/redux';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  const [loaded] = useFonts({
    AnonymousPro: require('../assets/fonts/AnonymousPro-Regular.ttf'),
    AnonymousProBold: require('../assets/fonts/AnonymousPro-Bold.ttf'),
    AnonymousProItalic: require('../assets/fonts/AnonymousPro-Italic.ttf'),
    AnonymousProBoldItalic: require('../assets/fonts/AnonymousPro-BoldItalic.ttf'),
  });

  const isAuth = useAppSelector(state => state.user.isAuth);
  
  if (!loaded) return null;

  return (
    <>
      <Stack initialRouteName={isAuth ? "MainPage" : "AuthPage"}>
        <Stack.Screen name="AuthPage" options={{ headerShown: false }} />
        <Stack.Screen name="MainPage" options={{ title: 'Map' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
