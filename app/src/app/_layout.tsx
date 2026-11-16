// 쓰는 굵기만 하나씩 불러온다 (패키지 전체를 불러오면 모든 굵기가 앱에 들어가 용량이 커짐)
import { NotoSansKR_400Regular } from '@expo-google-fonts/noto-sans-kr/400Regular';
import { NotoSansKR_500Medium } from '@expo-google-fonts/noto-sans-kr/500Medium';
import { NotoSansKR_700Bold } from '@expo-google-fonts/noto-sans-kr/700Bold';
import { Sora_600SemiBold } from '@expo-google-fonts/sora/600SemiBold';
import { Sora_700Bold } from '@expo-google-fonts/sora/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStoreProvider } from '../store/AppStore';
import { useTheme } from '../theme/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { c, dark } = useTheme();
  const [loaded, error] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="drugs/[id]/index" />
          <Stack.Screen name="drugs/[id]/ai" />
          <Stack.Screen name="interactions" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="about" />
          <Stack.Screen name="faq" />
        </Stack>
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}
