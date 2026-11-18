// 본문 글꼴: Pretendard (assets/fonts, OFL 라이선스). 로고 글자만 Nunito.
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStoreProvider } from '../store/AppStore';
import { useTheme } from '../theme/theme';

SplashScreen.preventAutoHideAsync();

// 웹: 한글이 글자 단위로 끊기지 않고 단어(띄어쓰기) 단위로 줄바꿈되게 한다
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = 'body { word-break: keep-all; }';
  document.head.appendChild(style);
}

export default function RootLayout() {
  const { c, dark } = useTheme();
  const [loaded, error] = useFonts({
    'Pretendard-Regular': require('../../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../../assets/fonts/Pretendard-Bold.otf'),
    Nunito_800ExtraBold,
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
          <Stack.Screen name="history" />
          <Stack.Screen name="about" />
          <Stack.Screen name="faq" />
        </Stack>
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}
